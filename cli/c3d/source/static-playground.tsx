import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO, DOLPHIN_BANNER} from './dolphins.js';

// Static layout testing component for ASCII art positioning
export function StaticPlayground() {
	const [currentDolphinIndex, setCurrentDolphinIndex] = useState(0);
	const dolphins = [DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO];
	const dolphinNames = ['Dolphin One', 'Dolphin Two'];

	// Handle keyboard controls
	useInput((input, key) => {
		if (key.leftArrow || key.upArrow) {
			setCurrentDolphinIndex(prev => prev === 0 ? dolphins.length - 1 : prev - 1);
		} else if (key.rightArrow || key.downArrow) {
			setCurrentDolphinIndex(prev => (prev + 1) % dolphins.length);
		} else if (input === 'q') {
			process.exit(0);
		}
	});

	// Randomly choose dolphin once on component mount
	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * dolphins.length);
		setCurrentDolphinIndex(randomIndex);
	}, []);

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box marginBottom={2}>
				<Text color="cyan" bold>🐬 {dolphinNames[currentDolphinIndex]} Layout</Text>
				<Text color="gray" dimColor>({currentDolphinIndex + 1}/{dolphins.length}) - Use ←→ or ↑↓ to switch, Q to quit</Text>
			</Box>

			{/* Main Layout: Dolphin Left, Banner Right */}
			<Box flexDirection="row" marginBottom={2}>
				{/* Left Side - Dolphin */}
				<Box flexDirection="column" marginRight={4}>
					<Text color="blue">{dolphins[currentDolphinIndex]}</Text>
				</Box>

				{/* Right Side - Banner */}
				<Box flexDirection="column">
					<Text color="cyan">{DOLPHIN_BANNER}</Text>
				</Box>
			</Box>

			{/* Navigation Dots */}
			<Box marginBottom={2} justifyContent="center">
				{dolphins.map((_, index) => (
					<Text key={index} color={index === currentDolphinIndex ? 'cyan' : 'gray'}>
						{index === currentDolphinIndex ? '●' : '○'} 
					</Text>
				))}
			</Box>

			{/* Instructions */}
			<Box borderStyle="single" padding={1}>
				<Box flexDirection="column">
					<Text color="yellow" bold>Layout Testing:</Text>
					<Text color="cyan" bold>Currently showing: {dolphinNames[currentDolphinIndex]}</Text>
					<Text color="gray" dimColor>• Dolphin on left, UNXVERSAL banner on right</Text>
					<Text color="gray" dimColor>• Use arrow keys to switch between dolphin variations</Text>
					<Text color="gray" dimColor>• Test how different dolphins look with your layout</Text>
					<Text color="gray" dimColor>• Perfect for styling and spacing comparisons</Text>
				</Box>
			</Box>
		</Box>
	);
}