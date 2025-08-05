import React from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import type {ColorScheme} from '../dolphins.js';

export function HomeScreen() {
	return (
		<BaseScreen title="Welcome">
			{(colorScheme: ColorScheme) => (
				<Box flexDirection="column">
					<Box borderStyle="single" padding={1} marginBottom={1}>
						<Text color={colorScheme.primary} bold>🏠 Welcome to C3D - AI-Powered CAD Generation</Text>
					</Box>

					<Box borderStyle="single" padding={1}>
						<Box flexDirection="column">
							<Text color={colorScheme.secondary} bold>📋 Quick Commands</Text>
							<Text color="green">  c3d generate "your idea"</Text>
							<Text color={colorScheme.secondary}>  c3d server start</Text>
							<Text color={colorScheme.primary}>  c3d render script.py</Text>
							<Text color={colorScheme.accent}>  c3d config</Text>
						</Box>
					</Box>
				</Box>
			)}
		</BaseScreen>
	);
}