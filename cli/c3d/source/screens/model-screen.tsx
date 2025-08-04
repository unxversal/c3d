import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';

// Auto-cycling demo screen - no props needed

export function ModelScreen() {
	const [demoState, setDemoState] = useState(0);
	
	// Cycle through different states every 3 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setDemoState(prev => (prev + 1) % 4);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const states = [
		{ modelStatus: 'available' as const, size: '2.1GB', isDeleting: false },
		{ modelStatus: 'downloading' as const, size: '1.2GB/2.1GB', isDeleting: false },
		{ modelStatus: 'available' as const, size: '2.1GB', isDeleting: true },
		{ modelStatus: 'missing' as const, size: '0GB', isDeleting: false }
	];

	const { modelStatus, size, isDeleting } = states[demoState]!;
	
	
	const getStatusColor = () => {
		switch (modelStatus) {
			case 'available': return 'green';
			case 'downloading': return 'yellow';
			case 'missing': return 'red';
			default: return 'gray';
		}
	};

	const getStatusIcon = () => {
		switch (modelStatus) {
			case 'available': return '✅';
			case 'downloading': return '⬇️';
			case 'missing': return '❌';
			default: return '⚪';
		}
	};

	return (
		<BaseScreen title="Model Management">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="cyan" bold>🤖 AI Model Status</Text>
						<Text color={getStatusColor()}>
							{getStatusIcon()} joshuaokolo/C3Dv0
						</Text>
						<Text color="gray">Status: {modelStatus}</Text>
						{modelStatus === 'available' && (
							<Text color="gray">Size: {size}</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>💾 Storage</Text>
						<Text color="gray">  Local models: ~/.ollama/models</Text>
						<Text color="gray">  Space used: {size}</Text>
						<Text color="blue">  Free up space with: c3d deload</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>🎛️  Actions</Text>
						{isDeleting ? (
							<ShimmerText text="🗑️  DELETING MODEL..." />
						) : modelStatus === 'downloading' ? (
							<ShimmerText text="📥  DOWNLOADING MODEL..." />
						) : modelStatus === 'available' ? (
							<>
								<Text color="red">  c3d deload - Remove model</Text>
								<Text color="gray">  Will free up {size}</Text>
							</>
						) : modelStatus === 'missing' ? (
							<>
								<Text color="green">  Model will auto-download when needed</Text>
								<Text color="gray">  Required for generation</Text>
							</>
						) : null}
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}