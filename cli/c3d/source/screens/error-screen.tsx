import React from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ERROR_COLOR_SCHEME} from '../dolphins.js';

interface Props {
	message: string;
	details?: string;
	suggestions?: string[];
}

export function ErrorScreen({message, details, suggestions}: Props) {
	return (
		<BaseScreen title="Error" forceColorScheme={ERROR_COLOR_SCHEME}>
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="red" bold>❌ Error</Text>
						<Text color="white">{message}</Text>
						{details && (
							<Text color="gray">{details}</Text>
						)}
					</Box>
				</Box>

				{suggestions && suggestions.length > 0 && (
					<Box borderStyle="single" padding={1} marginBottom={1}>
						<Box flexDirection="column">
							<Text color="yellow" bold>💡 Suggestions</Text>
							{suggestions.map((suggestion, index) => (
								<Text key={index} color="cyan">  • {suggestion}</Text>
							))}
						</Box>
					</Box>
				)}

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>🔧 Common Solutions</Text>
						<Text color="gray">  • Check server status: c3d server status</Text>
						<Text color="gray">  • Restart server: c3d server start</Text>
						<Text color="gray">  • View config: c3d config</Text>
						<Text color="gray">  • Reinstall model: c3d deload</Text>
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}