import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import {DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO, DOLPHIN_BANNER_COLUMNS} from '../dolphins.js';

interface Props {
	children: React.ReactNode;
	title?: string;
	showExitAnimation?: boolean;
}

export function BaseScreen({children, title, showExitAnimation = false}: Props) {
	const [selectedDolphin, setSelectedDolphin] = useState(DOLPHIN_ANSI_ONE);
	const [animationPhase, setAnimationPhase] = useState(0);
	const totalCols = DOLPHIN_BANNER_COLUMNS.length;
	const totalRows = DOLPHIN_BANNER_COLUMNS[0]?.length || 0;

	// Randomly choose dolphin on component mount
	useEffect(() => {
		const dolphins = [DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO];
		const randomDolphin = dolphins[Math.floor(Math.random() * dolphins.length)]!;
		setSelectedDolphin(randomDolphin);
	}, []);

	// Handle quit
	useInput((input, key) => {
		if (input === 'q' || key.escape) {
			process.exit(0);
		}
	});

	// Animation logic - exact copy of AnimatedBanner2 from shimmer-playground
	useEffect(() => {
		if (showExitAnimation) {
			// Exit animation: fade in + pause + fade out + pause (cycles)
			const pauseSteps = 10;
			const totalAnimationSteps = totalCols + pauseSteps + totalCols + 5;
			
			const interval = setInterval(() => {
				setAnimationPhase(prev => (prev + 1) % totalAnimationSteps);
			}, 60);
			return () => clearInterval(interval);
		} else {
			// Letter Animation 2 - fade in then freeze forever (exact copy from shimmer-playground)
			const maxPhase = totalCols; // Stop after fade-in completes
			
			const interval = setInterval(() => {
				setAnimationPhase(prev => {
					if (prev >= maxPhase) {
						return maxPhase; // Freeze at the end of fade-in
					}
					return prev + 1;
				});
			}, 60);
			return () => clearInterval(interval);
		}
	}, [showExitAnimation, totalCols]);

	// Banner rendering logic
	const renderBanner = () => {
		return (
			<Box flexDirection="column">
				{Array.from({ length: totalRows }, (_, rowIndex) => (
					<Box key={rowIndex}>
						{Array.from({ length: totalCols }, (_, colIndex) => {
							const char = DOLPHIN_BANNER_COLUMNS[colIndex]?.[rowIndex] || ' ';
							
							let isVisible = false;
							let color: string = 'cyan';
							
							if (showExitAnimation) {
								// Exit animation logic (same as Letter Animation 1)
								const pauseSteps = 10;
								if (animationPhase < totalCols) {
									// Fade in
									const fadeInProgress = animationPhase;
									const distanceFromFront = colIndex - fadeInProgress;
									
									if (distanceFromFront <= 0) {
										isVisible = true;
										if (distanceFromFront < -5 && Math.random() > 0.95) {
											isVisible = false;
										}
										color = 'cyan';
									} else if (distanceFromFront <= 3) {
										if (distanceFromFront === 1) {
											color = 'yellow';
											isVisible = Math.random() > 0.3;
										} else if (distanceFromFront === 2) {
											color = 'white';
											isVisible = Math.random() > 0.6;
										} else {
											color = 'blue';
											isVisible = Math.random() > 0.8;
										}
									}
								} else if (animationPhase < totalCols + pauseSteps) {
									// Pause
									isVisible = true;
									color = 'cyan';
									if (Math.random() > 0.98) {
										isVisible = false;
									}
								} else if (animationPhase < totalCols + pauseSteps + totalCols) {
									// Fade out
									const fadeOutProgress = animationPhase - totalCols - pauseSteps;
									const fadeOutPosition = fadeOutProgress;
									const distanceFromFadeOut = colIndex - fadeOutPosition;
									
									if (distanceFromFadeOut < 0) {
										isVisible = false;
									} else if (distanceFromFadeOut <= 3) {
										if (distanceFromFadeOut === 0) {
											color = 'yellow';
											isVisible = Math.random() > 0.3;
										} else if (distanceFromFadeOut === 1) {
											color = 'white';
											isVisible = Math.random() > 0.6;
										} else {
											color = 'blue';
											isVisible = Math.random() > 0.8;
										}
									} else {
										isVisible = true;
										if (Math.random() > 0.95) {
											isVisible = false;
										}
										color = 'cyan';
									}
								}
							} else {
								// Letter Animation 2 logic - EXACT copy from AnimatedBanner2
								if (animationPhase < totalCols) {
									// Phase 1: Fade in left to right
									const fadeInProgress = animationPhase;
									const distanceFromFront = colIndex - fadeInProgress;
									
									if (distanceFromFront <= 0) {
										// Already revealed
										isVisible = true;
										// Add some noise to fully revealed letters
										if (distanceFromFront < -5 && Math.random() > 0.95) {
											isVisible = false; // Occasional flicker
										}
										color = 'cyan';
									} else if (distanceFromFront <= 3) {
										// In the reveal zone
										if (distanceFromFront === 1) {
											color = 'yellow'; // Leading edge
											isVisible = Math.random() > 0.3; // Some uncertainty
										} else if (distanceFromFront === 2) {
											color = 'white'; 
											isVisible = Math.random() > 0.6; // More uncertainty
										} else {
											color = 'blue';
											isVisible = Math.random() > 0.8; // High uncertainty
										}
									}
								} else {
									// Phase 2: Freeze - all letters visible and stable forever
									isVisible = true;
									color = 'cyan';
									// Occasional subtle flicker during freeze
									if (Math.random() > 0.98) {
										isVisible = false;
									}
								}
							}

							return (
								<Text key={colIndex} color={color}>
									{isVisible && char !== ' ' ? char : ' '}
								</Text>
							);
						})}
					</Box>
				))}
			</Box>
		);
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Box flexDirection="row">
				{/* Left: Dolphin */}
				<Box flexDirection="column" marginRight={4}>
					<Text color="cyan">{selectedDolphin}</Text>
				</Box>

				{/* Right Column */}
				<Box flexDirection="column">
					{/* Top Right: Banner */}
					<Box marginBottom={1}>
						{renderBanner()}
					</Box>

					{/* Bottom Right: Content Area - full width and thin */}
					<Box flexDirection="column">
						{children}
					</Box>
				</Box>
			</Box>

			{/* Footer */}
			<Box marginTop={1}>
				<Text color="gray" dimColor>Press Q to quit</Text>
				{title && <Text color="gray" dimColor> | {title}</Text>}
			</Box>
		</Box>
	);
}