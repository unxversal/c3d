import React from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';

export function HomeScreen() {
	return (
		<BaseScreen title="Welcome">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>🏠 Welcome to C3D - AI-Powered CAD Generation</Text>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>📋 Quick Commands</Text>
						<Text color="green">  c3d generate "your idea"</Text>
						<Text color="blue">  c3d server start</Text>
						<Text color="cyan">  c3d render script.py</Text>
						<Text color="magenta">  c3d config</Text>
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}