import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';

interface Props {
	streamingText: string;
	isComplete: boolean;
	height?: number;
}

export function StreamingText({streamingText, isComplete, height = 8}: Props) {
	const [lines, setLines] = useState<string[]>([]);

	useEffect(() => {
		// Split text into lines and update state
		const newLines = streamingText.split('\n');
		setLines(newLines);
	}, [streamingText]);

	// Get the last N lines to display based on height
	const displayLines = lines.slice(-height);
	
	// Pad with empty lines if we don't have enough content
	const paddedLines = [...Array(height - displayLines.length).fill(''), ...displayLines];

	return (
		<Box flexDirection="column" borderStyle="single" padding={1} height={height + 2}>
			<Text bold color="cyan">
				{isComplete ? '✅ Generation Complete' : '🔄 Streaming...'}
			</Text>
			<Box flexDirection="column" marginTop={1}>
				{paddedLines.map((line, index) => {
					// Calculate fade level - top lines are more faded
					const fadeLevel = index / (height - 1);
					const opacity = fadeLevel < 0.3 ? 'gray' : fadeLevel < 0.6 ? 'white' : 'green';
					const dimmed = fadeLevel < 0.6;
					
					return (
						<Text 
							key={index} 
							color={opacity} 
							dimColor={dimmed}
							wrap="truncate"
						>
							{line ? line.replace(/[^\x20-\x7E]/g, '?') : ' '}
						</Text>
					);
				})}
			</Box>
		</Box>
	);
}