import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';

interface Props {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	maxHeight?: number;
}

export function CodeEditor({value, onChange, placeholder = '', maxHeight = 20}: Props) {
	const [lines, setLines] = useState<string[]>(() => value.split('\n'));
	const [cursorLine, setCursorLine] = useState(0);
	const [cursorColumn, setCursorColumn] = useState(0);
	const [scrollOffset, setScrollOffset] = useState(0);

	// Update lines when value changes externally
	useEffect(() => {
		const newLines = value.split('\n');
		setLines(newLines);
		// Reset cursor if content changed significantly
		if (cursorLine >= newLines.length) {
			setCursorLine(Math.max(0, newLines.length - 1));
		}
		if (cursorColumn > (newLines[cursorLine] || '').length) {
			setCursorColumn((newLines[cursorLine] || '').length);
		}
	}, [value]);

	// Update parent when lines change
	useEffect(() => {
		onChange(lines.join('\n'));
	}, [lines, onChange]);

	// Handle keyboard input
	useInput((input, key) => {
		if (key.upArrow) {
			setCursorLine(prev => {
				const newLine = Math.max(0, prev - 1);
				setCursorColumn(Math.min(cursorColumn, lines[newLine]?.length || 0));
				return newLine;
			});
		} else if (key.downArrow) {
			setCursorLine(prev => {
				const newLine = Math.min(lines.length - 1, prev + 1);
				setCursorColumn(Math.min(cursorColumn, lines[newLine]?.length || 0));
				return newLine;
			});
		} else if (key.leftArrow) {
			setCursorColumn(prev => {
				if (prev > 0) {
					return prev - 1;
				} else if (cursorLine > 0) {
					setCursorLine(cursorLine - 1);
					return lines[cursorLine - 1]?.length || 0;
				}
				return 0;
			});
		} else if (key.rightArrow) {
			setCursorColumn(prev => {
				const currentLineLength = lines[cursorLine]?.length || 0;
				if (prev < currentLineLength) {
					return prev + 1;
				} else if (cursorLine < lines.length - 1) {
					setCursorLine(cursorLine + 1);
					return 0;
				}
				return prev;
			});
		} else if (key.return) {
			// Insert new line
			const currentLine = lines[cursorLine] || '';
			const beforeCursor = currentLine.slice(0, cursorColumn);
			const afterCursor = currentLine.slice(cursorColumn);
			
			const newLines = [
				...lines.slice(0, cursorLine),
				beforeCursor,
				afterCursor,
				...lines.slice(cursorLine + 1)
			];
			
			setLines(newLines);
			setCursorLine(cursorLine + 1);
			setCursorColumn(0);
		} else if (key.backspace) {
			const currentLine = lines[cursorLine] || '';
			if (cursorColumn > 0) {
				// Delete character at cursor position (the character the cursor is on)
				const newLine = currentLine.slice(0, cursorColumn - 1) + currentLine.slice(cursorColumn);
				const newLines = [...lines];
				newLines[cursorLine] = newLine;
				setLines(newLines);
				setCursorColumn(cursorColumn - 1);
			} else if (cursorLine > 0) {
				// At beginning of line - merge with previous line
				const prevLine = lines[cursorLine - 1] || '';
				const newLines = [
					...lines.slice(0, cursorLine - 1),
					prevLine + currentLine,
					...lines.slice(cursorLine + 1)
				];
				setLines(newLines);
				setCursorLine(cursorLine - 1);
				setCursorColumn(prevLine.length);
			}
		} else if (key.delete) {
			const currentLine = lines[cursorLine] || '';
			if (cursorColumn < currentLine.length) {
				// Delete character after cursor (at cursorColumn position)
				const newLine = currentLine.slice(0, cursorColumn) + currentLine.slice(cursorColumn + 1);
				const newLines = [...lines];
				newLines[cursorLine] = newLine;
				setLines(newLines);
				// Cursor stays at same position
			} else if (cursorLine < lines.length - 1) {
				// At end of line - merge with next line
				const nextLine = lines[cursorLine + 1] || '';
				const newLines = [
					...lines.slice(0, cursorLine),
					currentLine + nextLine,
					...lines.slice(cursorLine + 2)
				];
				setLines(newLines);
				// Cursor stays at same position
			}
		} else if (input && !key.ctrl && !key.meta) {
			// Insert character
			const currentLine = lines[cursorLine] || '';
			const newLine = currentLine.slice(0, cursorColumn) + input + currentLine.slice(cursorColumn);
			const newLines = [...lines];
			newLines[cursorLine] = newLine;
			setLines(newLines);
			setCursorColumn(cursorColumn + 1);
		}
	});

	// Auto-scroll to keep cursor visible
	useEffect(() => {
		if (cursorLine < scrollOffset) {
			setScrollOffset(cursorLine);
		} else if (cursorLine >= scrollOffset + maxHeight) {
			setScrollOffset(cursorLine - maxHeight + 1);
		}
	}, [cursorLine, scrollOffset, maxHeight]);

	// Get visible lines
	const visibleLines = lines.slice(scrollOffset, scrollOffset + maxHeight);
	const showPlaceholder = lines.length === 1 && lines[0] === '' && placeholder;

	return (
		<Box flexDirection="column" borderStyle="round" padding={1}>
			{showPlaceholder ? (
				<Text color="gray" italic>{placeholder}</Text>
			) : (
				visibleLines.map((line, index) => {
					const lineNumber = scrollOffset + index;
					const isCurrentLine = lineNumber === cursorLine;
					const displayLine = line || ' '; // Show space for empty lines
					
					return (
						<Box key={lineNumber} flexDirection="row">
							<Text color="gray" dimColor>
								{(lineNumber + 1).toString().padStart(3, ' ')}│
							</Text>
							<Text color="white">
								{isCurrentLine ? (
									<>
										{displayLine.slice(0, cursorColumn)}
										<Text backgroundColor="white" color="black">
											{displayLine[cursorColumn] || ' '}
										</Text>
										{displayLine.slice(cursorColumn + 1)}
									</>
								) : (
									displayLine
								)}
							</Text>
						</Box>
					);
				})
			)}
			
			{/* Status bar */}
			<Box marginTop={1} borderColor="gray">
				<Text color="gray" dimColor>
					Line {cursorLine + 1}, Column {cursorColumn + 1} • {lines.length} lines • Use arrows to navigate
				</Text>
			</Box>
		</Box>
	);
}