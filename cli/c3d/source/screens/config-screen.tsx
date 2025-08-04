import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {BaseScreen} from '../components/base-screen.js';

export function ConfigScreen() {
	const [selectedIndex, setSelectedIndex] = useState(0);
	
	// Sample config data
	const configItems = [
		{ key: 'maxRetries', value: '5', description: 'Maximum generation retries' },
		{ key: 'defaultPort', value: '8765', description: 'Default server port' },
		{ key: 'temperature', value: '0.1', description: 'AI model temperature' },
		{ key: 'keepFirstPrompt', value: 'true', description: 'Keep first prompt in history' },
		{ key: 'keepLatestExplanation', value: 'true', description: 'Keep latest explanation' },
		{ key: 'maxHistoryMessages', value: '10', description: 'Maximum history messages' },
	];

	useInput((_, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex(prev => Math.min(configItems.length - 1, prev + 1));
		}
	});

	return (
		<BaseScreen title="Configuration">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>⚙️  Configuration - Use ↑↓ to navigate</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>📋 Settings</Text>
						{configItems.map((item, index) => (
							<Text key={item.key} color={index === selectedIndex ? 'cyan' : 'white'}>
								{index === selectedIndex ? '▶ ' : '  '}
								{item.key}: <Text color="green">{item.value}</Text>
							</Text>
						))}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>ℹ️  Details</Text>
						<Text color="gray">  {configItems[selectedIndex]?.description}</Text>
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}