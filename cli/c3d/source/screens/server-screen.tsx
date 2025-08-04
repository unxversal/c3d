import React from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';

interface Props {
	status: 'running' | 'stopped' | 'starting' | 'stopping';
	port?: number;
}

export function ServerScreen({status, port}: Props) {
	const getStatusColor = () => {
		switch (status) {
			case 'running': return 'green';
			case 'stopped': return 'red';
			case 'starting': return 'yellow';
			case 'stopping': return 'orange';
			default: return 'gray';
		}
	};

	const getStatusIcon = () => {
		switch (status) {
			case 'running': return '🟢';
			case 'stopped': return '🔴';
			case 'starting': return '🟡';
			case 'stopping': return '🟠';
			default: return '⚪';
		}
	};

	return (
		<BaseScreen title="Server Management">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="cyan" bold>🖥️  Server Status</Text>
						{status === 'starting' || status === 'stopping' ? (
							<ShimmerText text={`${status.toUpperCase()}...`} />
						) : (
							<Text color={getStatusColor()}>
								{getStatusIcon()} {status.toUpperCase()}
							</Text>
						)}
						{port && status === 'running' && (
							<Text color="blue">Port: {port}</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>🎛️  Controls</Text>
						<Text color="green">  c3d server start</Text>
						<Text color="red">  c3d server stop</Text>
						<Text color="blue">  c3d server status</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>🔗 Connection</Text>
						{status === 'running' && port ? (
							<>
								<Text color="gray">  Endpoint: http://localhost:{port}</Text>
								<Text color="gray">  API: /render</Text>
							</>
						) : (
							<Text color="gray">  Server not running</Text>
						)}
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}