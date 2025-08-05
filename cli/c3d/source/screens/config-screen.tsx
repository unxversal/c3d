import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {getConfig, updateConfig, type C3DConfig} from '../c3d.config.js';

type ConfigItem = {
	key: keyof C3DConfig;
	description: string;
	type: 'number' | 'string' | 'boolean';
	category: string;
};

export function ConfigScreen() {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [editingIndex, setEditingIndex] = useState(-1);
	const [editValue, setEditValue] = useState('');
	const [config, setConfig] = useState<C3DConfig>(getConfig());
	
	// Define all configurable items
	const configItems: ConfigItem[] = [
		// AI Generation Settings
		{ key: 'maxRetries', description: 'Maximum generation retries', type: 'number', category: 'AI Generation' },
		{ key: 'ollamaModel', description: 'Ollama model name', type: 'string', category: 'AI Generation' },
		{ key: 'ollamaHost', description: 'Ollama host URL', type: 'string', category: 'AI Generation' },
		{ key: 'temperature', description: 'AI model temperature (0.0-1.0)', type: 'number', category: 'AI Generation' },
		
		// Server Settings
		{ key: 'defaultPort', description: 'Default server port', type: 'number', category: 'Server' },
		{ key: 'serverStartTimeout', description: 'Server startup timeout (ms)', type: 'number', category: 'Server' },
		{ key: 'stopServerOnQuit', description: 'Stop server when quitting with Q', type: 'boolean', category: 'Server' },
		
		// Output Settings
		{ key: 'defaultOutputFormat', description: 'Default output format', type: 'string', category: 'Output' },
		{ key: 'keepWorkingDirectory', description: 'Keep working directory after generation', type: 'boolean', category: 'Output' },
		
		// Conversation Management
		{ key: 'keepFirstPrompt', description: 'Keep first prompt in history', type: 'boolean', category: 'Conversation' },
		{ key: 'keepLatestExplanation', description: 'Keep latest explanation', type: 'boolean', category: 'Conversation' },
		{ key: 'maxHistoryMessages', description: 'Maximum history messages', type: 'number', category: 'Conversation' },
	];

	// Reload config when component mounts
	useEffect(() => {
		setConfig(getConfig());
	}, []);

	const formatValue = (item: ConfigItem): string => {
		const value = config[item.key];
		if (item.type === 'boolean') {
			return value ? 'true' : 'false';
		}
		return String(value);
	};

	const saveConfigValue = (item: ConfigItem, newValue: string) => {
		let parsedValue: any = newValue;
		
		if (item.type === 'number') {
			parsedValue = parseFloat(newValue);
			if (isNaN(parsedValue)) {
				return; // Invalid number, don't save
			}
		} else if (item.type === 'boolean') {
			parsedValue = newValue.toLowerCase() === 'true';
		}
		
		// Update config
		const updates = { [item.key]: parsedValue } as Partial<C3DConfig>;
		updateConfig(updates);
		setConfig(getConfig()); // Reload to reflect changes
	};

	useInput((input, key) => {
		if (editingIndex >= 0) {
			// In edit mode
			if (key.return) {
				// Save the value
				const item = configItems[editingIndex];
				if (item) {
					saveConfigValue(item, editValue);
					setEditingIndex(-1);
					setEditValue('');
				}
			} else if (key.escape) {
				// Cancel editing
				setEditingIndex(-1);
				setEditValue('');
			} else if (key.backspace || key.delete) {
				setEditValue(prev => prev.slice(0, -1));
			} else if (input && input.length === 1) {
				setEditValue(prev => prev + input);
			}
		} else {
			// Navigation mode
			if (key.upArrow) {
				setSelectedIndex(prev => Math.max(0, prev - 1));
			} else if (key.downArrow) {
				setSelectedIndex(prev => Math.min(configItems.length - 1, prev + 1));
			} else if (key.return) {
				// Start editing
				const item = configItems[selectedIndex];
				if (item) {
					setEditingIndex(selectedIndex);
					setEditValue(formatValue(item));
				}
			}
		}
	});

	return (
		<BaseScreen title="Configuration">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>⚙️  Configuration Editor</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>📋 Settings</Text>
						{configItems.map((item, index) => {
							const isSelected = index === selectedIndex;
							const isEditing = index === editingIndex;
							const value = isEditing ? editValue : formatValue(item);
							
							return (
								<Box key={item.key} flexDirection="row">
									<Text color={isSelected ? 'cyan' : 'white'}>
										{isSelected ? '▶ ' : '  '}
										{item.key}: 
									</Text>
									<Text color={isEditing ? 'yellow' : 'green'}>
										{isEditing ? `[${value}]` : value}
									</Text>
								</Box>
							);
						})}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>ℹ️  Details</Text>
						<Text color="gray">  {configItems[selectedIndex]?.description}</Text>
						<Text color="gray">  Category: {configItems[selectedIndex]?.category}</Text>
						<Text color="gray">  Type: {configItems[selectedIndex]?.type}</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="magenta" bold>🎮 Controls</Text>
						{editingIndex >= 0 ? (
							<>
								<Text color="gray">  • Type to edit value</Text>
								<Text color="gray">  • Enter: Save changes</Text>
								<Text color="gray">  • Esc: Cancel editing</Text>
								<Text color="gray">  • Backspace: Delete character</Text>
							</>
						) : (
							<>
								<Text color="gray">  • ↑↓: Navigate settings</Text>
								<Text color="gray">  • Enter: Edit selected setting</Text>
								<Text color="gray">  • Q: Return to main menu</Text>
							</>
						)}
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}