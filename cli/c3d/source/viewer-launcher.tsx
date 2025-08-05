import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from './components/base-screen.js';
import {ShimmerText} from './components/shimmer-text.js';
import {ServerManager} from './server-manager.js';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

export function ViewerLauncher() {
	const [status, setStatus] = useState<'starting' | 'running' | 'error'>('starting');
	const [serverPort, setServerPort] = useState<number | null>(null);
	const [message, setMessage] = useState('Starting C3D server...');

	useEffect(() => {
		const launchViewer = async () => {
			try {
				setMessage('🚀 Starting CADQuery server...');
				
				const serverManager = new ServerManager();
				
				// Start server if not running
				if (!(await serverManager.isRunning())) {
					const port = await serverManager.start();
					setServerPort(port);
				} else {
					// Get current port if already running
					const port = 8765; 
					setServerPort(port);
				}
				
				setMessage(`✅ Server running on port ${serverPort || 8765}`);
				
				// Wait a moment for server to be ready
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				setMessage('🌐 Opening web viewer...');
				
				// Open browser (cross-platform)
				const url = `http://localhost:${serverPort || 8765}?from=cli`;
				const platform = process.platform;
				
				if (platform === 'darwin') {
					await execAsync(`open "${url}"`);
				} else if (platform === 'win32') {
					await execAsync(`start "${url}"`);
				} else {
					await execAsync(`xdg-open "${url}"`);
				}
				
				setStatus('running');
				setMessage(`🎯 Web viewer opened at ${url}`);
				
			} catch (error) {
				setStatus('error');
				setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		};

		launchViewer();
	}, []);

	return (
		<BaseScreen title="3D Web Viewer">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="cyan" bold>🌐 Web Viewer Status</Text>
						{status === 'starting' && (
							<ShimmerText text={message} />
						)}
						{status === 'running' && (
							<>
								<Text color="green">✅ {message}</Text>
								{serverPort && (
									<Text color="blue">🔗 http://localhost:{serverPort}</Text>
								)}
							</>
						)}
						{status === 'error' && (
							<Text color="red">{message}</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>✨ Features</Text>
						<Text color="gray">  • Interactive 3D CAD viewer</Text>
						<Text color="gray">  • Generate models from text prompts</Text>
						<Text color="gray">  • Real-time VTK.js rendering</Text>
						<Text color="gray">  • Export STL, STEP, PNG formats</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>🎮 Controls</Text>
						<Text color="gray">  • Mouse: Rotate, zoom, pan model</Text>
						<Text color="gray">  • Type prompts to generate new models</Text>
						<Text color="gray">  • Press Q here to close this CLI view</Text>
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}