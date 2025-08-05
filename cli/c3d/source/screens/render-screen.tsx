import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {ServerManager} from '../server-manager.js';
import {updateConfig} from '../c3d.config.js';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

interface Props {
	scriptFile: string;
	flags: {
		port?: number;
		output?: string;
		noViewer?: boolean;
	};
}

const serverManager = new ServerManager();

export function RenderScreen({scriptFile, flags}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [actualPort, setActualPort] = useState<number | null>(null);

	// Helper function to open frontend with model
	const openFrontendWithModel = async (servedFileName: string, port: number, scriptName?: string) => {
		const encodedScriptName = scriptName ? encodeURIComponent(scriptName) : '';
		const url = `http://localhost:${port}?model=${servedFileName}&from=cli${scriptName ? `&script=${encodedScriptName}` : ''}`;
		
		const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
		await execAsync(`${command} "${url}"`);
	};

	useEffect(() => {
		const renderScript = async () => {
			// Update config with CLI flags
			if (flags.port) {
				updateConfig({ defaultPort: flags.port });
			}

			try {
				// Auto-start server if not running
				const isRunning = await serverManager.isRunning();
				if (!isRunning) {
					setMessage('Starting server...');
					const startedPort = await serverManager.start(flags.port || 8765);
					setActualPort(startedPort);
				} else {
					const currentPort = serverManager.getCurrentPort() || 8765;
					setActualPort(currentPort);
				}

				setMessage('Rendering CADQuery script...');
				const renderResult = await serverManager.render(scriptFile, flags.output);
				setMessage(`✅ Render complete!\nOutput: ${renderResult.output_paths.join(', ')}`);
				setStatus('success');

				// Auto-open frontend with the rendered model
				const servedFile = renderResult.served_files?.[0];
				if (!flags.noViewer && servedFile) {
					try {
						setMessage((prev) => prev + '\n\n🌐 Opening 3D viewer...');
						const scriptName = scriptFile.split('/').pop()?.replace('.py', '') || 'script';
						await openFrontendWithModel(servedFile, actualPort || 8765, scriptName);
						setMessage((prev) => prev + '\n✅ 3D viewer opened successfully!');
					} catch (error) {
						setMessage((prev) => prev + `\n⚠️  3D viewer failed to open: ${error}`);
					}
				}
			} catch (error) {
				setMessage(`❌ Render failed: ${error instanceof Error ? error.message : String(error)}`);
				setStatus('error');
			}
		};

		renderScript();
	}, [scriptFile, flags]);

	const getStatusColor = () => {
		switch (status) {
			case 'loading': return 'yellow';
			case 'success': return 'green';
			case 'error': return 'red';
			default: return 'white';
		}
	};

	return (
		<BaseScreen title="Script Rendering">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>🔧 CADQuery Script Renderer</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>📄 Script File</Text>
						<Text color="white">  {scriptFile}</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>⚡ Render Status</Text>
						{status === 'loading' ? (
							<ShimmerText text="PROCESSING..." />
						) : (
							<Text color={getStatusColor()}>
								{message}
							</Text>
						)}
						{flags.output && (
							<Text color="gray" dimColor>Output: {flags.output}</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="magenta" bold>🎮 Controls</Text>
						<Text color="gray">  • Q: Return to main menu</Text>
						{actualPort && (
							<Text color="gray">  • Server running on port {actualPort}</Text>
						)}
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}