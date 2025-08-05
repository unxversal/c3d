import {execa} from 'execa';
import fetch from 'node-fetch';
import {readFile} from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {createConnection} from 'net';
import {getConfig} from './c3d.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RenderResult {
	success: boolean;
	output_paths: string[];
	served_files?: string[];  // Files accessible via /files/ endpoint
	workdir: string;
	error?: string;
}

export class ServerManager {
	private process: any = null;
	private readonly serverDir: string;
	private currentPort: number | null = null;

	constructor() {
		// When installed via npm, the server will be in a sibling directory to dist
		// This works whether installed globally or locally, or run from repo
		this.serverDir = path.resolve(__dirname, '../server');
	}

	private async findAvailablePort(startPort: number = 8765): Promise<number> {
		for (let port = startPort; port < startPort + 100; port++) {
			if (await this.isPortAvailable(port)) {
				return port;
			}
		}
		throw new Error(`Could not find available port starting from ${startPort}`);
	}

	private async isPortAvailable(port: number): Promise<boolean> {
		return new Promise((resolve) => {
			const server = createConnection(port, 'localhost');
			server.on('connect', () => {
				server.destroy();
				resolve(false); // Port is in use
			});
			server.on('error', () => {
				resolve(true); // Port is available
			});
		});
	}

	async checkUvInstallation(): Promise<void> {
		try {
			await execa('uv', ['--version']);
		} catch (error) {
			throw new Error(
				'uv is not installed. Please install it first:\n' +
				'Visit https://docs.astral.sh/uv/getting-started/installation/ for installation instructions'
			);
		}
	}

	async start(requestedPort: number = 8765): Promise<number> {
		if (this.process) {
			throw new Error('Server is already running');
		}

		await this.checkUvInstallation();

		// Find available port starting from requested port
		const availablePort = await this.findAvailablePort(requestedPort);

		try {
			// Use uv to run the server (uv run handles dependencies automatically)
			this.process = execa('uv', ['run', 'main.py'], {
				cwd: this.serverDir,
				env: {
					...process.env,
					HOST: '0.0.0.0',
					PORT: availablePort.toString(),
				},
				detached: true,
				stdio: ['pipe', 'pipe', 'pipe'],
			});

			// Parse server output to get actual port
			let actualPort = availablePort;
			this.process.stdout?.on('data', (data: Buffer) => {
				const output = data.toString();
				const portMatch = output.match(/server starting on port (\d+)/i);
				if (portMatch && portMatch[1]) {
					actualPort = parseInt(portMatch[1], 10);
					this.currentPort = actualPort;
				}
			});

			// Wait for server to start (using configurable timeout)
			const config = getConfig();
			const timeoutMs = config.serverStartTimeout;
			const maxAttempts = Math.floor(timeoutMs / 1000); // Convert ms to seconds for attempts
			
			let attempts = 0;
			while (attempts < maxAttempts) {
				await new Promise(resolve => setTimeout(resolve, 1000));
				if (await this.isRunning(actualPort)) {
					this.currentPort = actualPort;
					return actualPort;
				}
				attempts++;
			}
			
			throw new Error(`Server failed to start within ${timeoutMs / 1000} seconds`);
		} catch (error) {
			this.process = null;
			this.currentPort = null;
			throw error;
		}
	}

	async stop(): Promise<void> {
		// First, try to stop the process we started (if we have reference)
		if (this.process) {
			this.process.kill('SIGTERM');
			this.process = null;
			this.currentPort = null;
		}
		
		// Then, find and kill any running Python servers that match our pattern
		try {
			// Find Python processes running main.py (our server)
			const { stdout } = await execa('pgrep', ['-f', 'python.*main.py'], { reject: false });
			if (stdout.trim()) {
				const pids = stdout.trim().split('\n');
				for (const pid of pids) {
					try {
						await execa('kill', ['-TERM', pid.trim()]);
						console.log(`Killed server process ${pid}`);
					} catch (error) {
						// Process might already be dead, continue
					}
				}
			}
		} catch (error) {
			// pgrep might not find anything, which is fine
		}
		
		// Wait a moment for graceful shutdown, then force kill if needed
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		try {
			const { stdout } = await execa('pgrep', ['-f', 'python.*main.py'], { reject: false });
			if (stdout.trim()) {
				const pids = stdout.trim().split('\n');
				for (const pid of pids) {
					try {
						await execa('kill', ['-KILL', pid.trim()]);
						console.log(`Force killed server process ${pid}`);
					} catch (error) {
						// Process might already be dead, continue
					}
				}
			}
		} catch (error) {
			// No processes found, which is what we want
		}
	}

	getCurrentPort(): number | null {
		return this.currentPort;
	}

	async isRunning(port?: number): Promise<boolean> {
		const checkPort = port || this.currentPort || 8765;
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 2000);
			
			const response = await fetch(`http://localhost:${checkPort}/docs`, {
				method: 'GET',
				signal: controller.signal,
			});
			
			clearTimeout(timeoutId);
			return response.ok;
		} catch {
			return false;
		}
	}

	async render(scriptPath: string, outputFilename?: string, port?: number): Promise<RenderResult> {
		const renderPort = port || this.currentPort || 8765;
		const scriptContent = await readFile(scriptPath, 'utf-8');
		
		const response = await fetch(`http://localhost:${renderPort}/api/render`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				script: scriptContent,
				output_filename: outputFilename,
				timeout_secs: 60,
			}),
		});

		if (!response.ok) {
			const error = await response.json() as any;
			throw new Error(`Render failed: ${error.detail?.message || error.detail || response.statusText}`);
		}

		return response.json() as Promise<RenderResult>;
	}
}