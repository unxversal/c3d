import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {ServerManager} from '../server-manager.js';

interface Props {
	subCommand: 'start' | 'stop' | 'status';
	flags: {
		port?: number;
	};
}

const serverManager = new ServerManager();

export function ServerScreen({subCommand, flags}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [serverRunning, setServerRunning] = useState(false);
	const [actualPort, setActualPort] = useState<number | null>(null);

	useEffect(() => {
		const executeServerCommand = async () => {
			try {
				switch (subCommand) {
					case 'start':
						setMessage('Starting server...');
						const startedPort = await serverManager.start(flags.port || 8765);
						setActualPort(startedPort);
						setServerRunning(true);
						setMessage(`✅ Server started on port ${startedPort}${startedPort !== (flags.port || 8765) ? ` (requested: ${flags.port || 8765})` : ''}`);
						setStatus('success');
						break;

					case 'stop':
						setMessage('Stopping server...');
						await serverManager.stop();
						setActualPort(null);
						setServerRunning(false);
						setMessage('✅ Server stopped');
						setStatus('success');
						break;

					case 'status':
						setMessage('Checking server status...');
						const isRunning = await serverManager.isRunning();
						const currentPort = serverManager.getCurrentPort();
						setServerRunning(isRunning);
						setActualPort(currentPort);
						setMessage(isRunning ? 
							`✅ Server is running on port ${currentPort || flags.port || 8765}` : 
							'⭕ Server is not running'
						);
						setStatus('success');
						break;
				}
			} catch (error) {
				setMessage(`❌ Server command failed: ${error instanceof Error ? error.message : String(error)}`);
				setStatus('error');
			}
		};

		executeServerCommand();
	}, [subCommand, flags]);

	const getStatusColor = () => {
		if (status === 'loading') return 'yellow';
		return serverRunning ? 'green' : 'red';
	};

	const getStatusIcon = () => {
		if (status === 'loading') return '🟡';
		return serverRunning ? '🟢' : '🔴';
	};

	return (
		<BaseScreen title="Server Management">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>🖥️  CADQuery Server Management</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>🔧 Command</Text>
						<Text color="white">  {subCommand.toUpperCase()}</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>📊 Status</Text>
						{status === 'loading' ? (
							<ShimmerText text="PROCESSING..." />
						) : (
							<Text color={getStatusColor()}>
								{getStatusIcon()} {message}
							</Text>
						)}
						{actualPort && (
							<Text color="gray" dimColor>Port: {actualPort}</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="magenta" bold>🎮 Controls</Text>
						<Text color="gray">  • Q: Return to main menu</Text>
						<Text color="gray">  • Available commands:</Text>
						<Text color="green">    c3d server start</Text>
						<Text color="red">    c3d server stop</Text>
						<Text color="blue">    c3d server status</Text>
						{serverRunning && actualPort && (
							<Text color="gray">  • Server: http://localhost:{actualPort}</Text>
						)}
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}