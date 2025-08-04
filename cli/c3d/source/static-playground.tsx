import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import {DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO, DOLPHIN_BANNER} from './dolphins.js';

// Static layout testing component for ASCII art positioning
export function StaticPlayground() {
	const [selectedDolphin, setSelectedDolphin] = useState(DOLPHIN_ANSI_ONE);

	// Randomly choose dolphin once on component mount
	useEffect(() => {
		const dolphins = [DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO];
		const randomDolphin = dolphins[Math.floor(Math.random() * dolphins.length)]!;
		setSelectedDolphin(randomDolphin);
	}, []);

	return (
		<Box flexDirection="column" padding={1}>
			{/* Title */}
			<Box marginBottom={2}>
				<Text color="cyan" bold>🐬 ASCII Layout Testing</Text>
			</Box>

			{/* Main Layout: Dolphin Left, Banner Right */}
			<Box flexDirection="row">
				{/* Left Side - Dolphin */}
				<Box flexDirection="column" marginRight={4}>
					<Text color="blue">{selectedDolphin}</Text>
				</Box>

				{/* Right Side - Banner */}
				<Box flexDirection="column">
					<Text color="cyan">{DOLPHIN_BANNER}</Text>
				</Box>
			</Box>

			{/* Instructions */}
			<Box marginTop={2} borderStyle="single" padding={1}>
				<Box flexDirection="column">
					<Text color="yellow" bold>Layout Testing:</Text>
					<Text color="gray" dimColor>• Dolphin on left, UNXVERSAL banner on right</Text>
					<Text color="gray" dimColor>• Random dolphin selected each time you run the command</Text>
					<Text color="gray" dimColor>• Resize your terminal to test responsiveness</Text>
					<Text color="gray" dimColor>• Use this to perfect your styling and spacing</Text>
				</Box>
			</Box>
		</Box>
	);
}