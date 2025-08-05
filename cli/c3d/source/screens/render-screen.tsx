import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {ServerManager} from '../server-manager.js';
import {updateConfig} from '../c3d.config.js';

interface Props {
	scriptFile: string;
	flags: {
		port?: number;
		output?: string;
	};
}

const serverManager = new ServerManager();

export function RenderScreen({scriptFile, flags}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [actualPort, setActualPort] = useState<number | null>(null);

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