import React from 'react';
import {Box, Text} from 'ink';
import {HomeScreen} from './screens/home-screen.js';
import {GenerationScreen} from './screens/generation-screen.js';
import {ServerScreen} from './screens/server-screen.js';
import {ConfigScreen} from './screens/config-screen.js';
import {RenderScreen} from './screens/render-screen.js';
import {ModelScreen} from './screens/model-screen.js';
import {ErrorScreen} from './screens/error-screen.js';
import {InteractiveScreen} from './screens/interactive-screen.js';

interface Props {
	screenName: string;
}

export function ScreenTester({screenName}: Props) {
	const renderScreen = () => {
		switch (screenName.toLowerCase()) {
			case 'home':
				return <HomeScreen />;
			case 'generation':
			case 'generate':
				return <GenerationScreen prompt="a simple gear with 12 teeth" />;
			case 'server':
				return <ServerScreen />;
			case 'config':
				return <ConfigScreen />;
			case 'render':
				return <RenderScreen scriptFile="example-model.py" />;
			case 'model':
			case 'deload':
				return <ModelScreen />;
			case 'error':
				return <ErrorScreen message="Connection failed" details="Could not connect to server on port 8765" />;
			case 'interactive':
				return <InteractiveScreen />;
			default:
				return (
					<Box flexDirection="column" padding={1}>
						<Text color="red" bold>❌ Unknown screen: {screenName}</Text>
						<Text color="gray">Available screens:</Text>
						<Text color="cyan">• home</Text>
						<Text color="cyan">• generation</Text>
						<Text color="cyan">• server</Text>
						<Text color="cyan">• config</Text>
						<Text color="cyan">• render</Text>
						<Text color="cyan">• model</Text>
						<Text color="cyan">• error</Text>
						<Text color="cyan">• interactive</Text>
					</Box>
				);
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Text color="yellow" bold>🖥️  Screen Tester: {screenName}</Text>
				<Text color="gray" dimColor> - Use Q to quit</Text>
			</Box>
			{renderScreen()}
		</Box>
	);
}