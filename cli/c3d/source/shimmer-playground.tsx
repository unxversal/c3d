import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {DOLPHIN_ANSI_ONE, DOLPHIN_BANNER, DOLPHIN_BANNER_COLUMNS} from './dolphins.js';

// Shimmer/ripple effects playground
export function ShimmerPlayground() {
	const [wavePosition, setWavePosition] = useState(0);
	const [shimmerPhase, setShimmerPhase] = useState(0);
	const [pulseIntensity, setPulseIntensity] = useState(0);
	const [focusedSection, setFocusedSection] = useState(0);

	const sections = ['Wave Ripple', 'Color Shimmer', 'Pulse Effect', 'Character Shimmer', 'Letter Animation', 'Sliding Highlight', 'Flash Animation', 'Static Shimmer', 'Colorful Static'];

	// Handle keyboard navigation
	useInput((input, key) => {
		if (key.leftArrow || key.upArrow) {
			setFocusedSection(prev => prev === 0 ? sections.length - 1 : prev - 1);
		} else if (key.rightArrow || key.downArrow) {
			setFocusedSection(prev => (prev + 1) % sections.length);
		} else if (input === 'q') {
			process.exit(0);
		}
	});

	// Wave animation for ripple effect
	useEffect(() => {
		const interval = setInterval(() => {
			setWavePosition(prev => (prev + 1) % 100);
		}, 100);
		return () => clearInterval(interval);
	}, []);

	// Shimmer phase animation
	useEffect(() => {
		const interval = setInterval(() => {
			setShimmerPhase(prev => (prev + 1) % 4);
		}, 200);
		return () => clearInterval(interval);
	}, []);

	// Pulse effect
	useEffect(() => {
		const interval = setInterval(() => {
			setPulseIntensity(prev => (prev + 1) % 10);
		}, 150);
		return () => clearInterval(interval);
	}, []);

	// Create shimmer effect by cycling through colors
	const getShimmerColor = (index: number): string => {
		const colors = ['blue', 'cyan', 'white', 'cyan'];
		return colors[(shimmerPhase + index) % colors.length]!;
	};

	// Create wave effect color
	const getWaveColor = (lineIndex: number): string => {
		const waveCenter = (wavePosition / 100) * 35; // Assuming ~35 lines in dolphin
		const distance = Math.abs(lineIndex - waveCenter);
		
		if (distance < 2) return 'white';
		if (distance < 4) return 'cyan';
		if (distance < 6) return 'blue';
		return 'blue';
	};

	// Create pulse effect
	const getPulseProps = () => {
		const intensity = pulseIntensity / 10;
		return {
			color: intensity > 0.7 ? 'white' : intensity > 0.4 ? 'cyan' : 'blue' as const,
			dimColor: intensity < 0.3
		};
	};

	// Split ASCII into lines for individual animation
	const dolphinLines = DOLPHIN_ANSI_ONE.split('\n');
	const bannerLines = DOLPHIN_BANNER.split('\n');

	const renderCurrentEffect = () => {
		switch (focusedSection) {
			case 0: // Wave Ripple
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								{dolphinLines.map((line, index) => (
									<Text key={index} color={getWaveColor(index)}>
										{line}
									</Text>
								))}
							</Box>
							<Box flexDirection="column">
								{bannerLines.map((line, index) => (
									<Text key={index} color={getWaveColor(index + 15)}>
										{line}
									</Text>
								))}
							</Box>
						</Box>
					</Box>
				);

			case 1: // Color Shimmer
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								{dolphinLines.map((line, index) => (
									<Text key={index} color={getShimmerColor(index)}>
										{line}
									</Text>
								))}
							</Box>
							<Box flexDirection="column">
								{bannerLines.map((line, index) => (
									<Text key={index} color={getShimmerColor(index + 2)}>
										{line}
									</Text>
								))}
							</Box>
						</Box>
					</Box>
				);

			case 2: // Pulse Effect
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								<Text {...getPulseProps()}>
									{DOLPHIN_ANSI_ONE}
								</Text>
							</Box>
							<Box flexDirection="column">
								<Text {...getPulseProps()}>
									{DOLPHIN_BANNER}
								</Text>
							</Box>
						</Box>
					</Box>
				);

			case 3: // Character Shimmer
				return (
					<Box flexDirection="column">
						<Box marginBottom={2}>
							<ShimmerText text="LOADING CAD GENERATION..." />
						</Box>
						<Box marginTop={4}>
							<ShimmerText text="PROCESSING YOUR REQUEST..." />
						</Box>
						<Box marginTop={2}>
							<ShimmerText text="GENERATING 3D MODEL..." />
						</Box>
					</Box>
				);

			case 4: // Letter Animation
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								<Text color="blue">{DOLPHIN_ANSI_ONE}</Text>
							</Box>
							<Box flexDirection="column">
								<AnimatedBanner />
							</Box>
						</Box>
					</Box>
				);

			case 5: // Sliding Highlight
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								<Text color="blue">{DOLPHIN_ANSI_ONE}</Text>
							</Box>
							<Box flexDirection="column">
								<SlidingHighlightBanner />
							</Box>
						</Box>
					</Box>
				);

			case 6: // Flash Animation
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								<Text color="blue">{DOLPHIN_ANSI_ONE}</Text>
							</Box>
							<Box flexDirection="column">
								<FlashAnimationBanner />
							</Box>
						</Box>
					</Box>
				);

			case 7: // Static Shimmer
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								<Text color="blue">{DOLPHIN_ANSI_ONE}</Text>
							</Box>
							<Box flexDirection="column">
								<StaticShimmerBanner />
							</Box>
						</Box>
					</Box>
				);

			case 8: // Colorful Static
				return (
					<Box flexDirection="column">
						<Box flexDirection="row">
							<Box flexDirection="column" marginRight={4}>
								<Text color="blue">{DOLPHIN_ANSI_ONE}</Text>
							</Box>
							<Box flexDirection="column">
								<ColorfulStaticBanner />
							</Box>
						</Box>
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box marginBottom={2}>
				<Text color="yellow" bold>✨ {sections[focusedSection]} Effect</Text>
				<Text color="gray" dimColor> ({focusedSection + 1}/{sections.length}) - Use ←→ or ↑↓ to navigate, Q to quit</Text>
			</Box>

			{/* Current Effect Display */}
			<Box marginBottom={2}>
				{renderCurrentEffect()}
			</Box>

			{/* Navigation Dots */}
			<Box marginBottom={2} justifyContent="center">
				{sections.map((_, index) => (
					<Text key={index} color={index === focusedSection ? 'cyan' : 'gray'}>
						{index === focusedSection ? '●' : '○'} 
					</Text>
				))}
			</Box>

			{/* Effect Description */}
			<Box borderStyle="single" padding={1}>
				<Box flexDirection="column">
					<Text color="cyan" bold>
						{focusedSection === 0 && "Wave Ripple: Color wave sweeps through ASCII art"}
						{focusedSection === 1 && "Color Shimmer: Each line cycles through different colors"}
						{focusedSection === 2 && "Pulse Effect: Entire ASCII brightens and dims rhythmically"}
						{focusedSection === 3 && "Character Shimmer: Text shimmers with animated symbols"}
						{focusedSection === 4 && "Letter Animation: Letters appear and disappear in waves"}
						{focusedSection === 5 && "Sliding Highlight: Full text visible with bright sliding highlight"}
						{focusedSection === 6 && "Flash Animation: Text appears, stays visible, then disappears and repeats"}
						{focusedSection === 7 && "Static Shimmer: Full text always visible with random static noise"}
						{focusedSection === 8 && "Colorful Static: Full text with varied colors and random effects"}
					</Text>
					<Text color="gray" dimColor>Perfect for loading states in your CLI!</Text>
				</Box>
			</Box>
		</Box>
	);
}

// Character shimmer component
function ShimmerText({text}: {text: string}) {
	const [shimmerIndex, setShimmerIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setShimmerIndex(prev => (prev + 1) % (text.length + 5));
		}, 100);
		return () => clearInterval(interval);
	}, [text.length]);

	return (
		<Box>
			{text.split('').map((char, index) => {
				const isShimmering = index >= shimmerIndex - 2 && index <= shimmerIndex + 2;
				const shimmerIntensity = 2 - Math.abs(index - shimmerIndex);
				
				let color: string = 'white';
				let useChar = char;
				
				if (isShimmering && char !== ' ') {
					if (shimmerIntensity === 2) {
						color = 'yellow';
						useChar = '▓';
					} else if (shimmerIntensity === 1) {
						color = 'cyan';
						useChar = '▒';
					} else {
						color = 'blue';
					}
				} else if (char !== ' ') {
					color = 'gray';
				}

				return (
					<Text key={index} color={color}>
						{useChar}
					</Text>
				);
			})}
		</Box>
	);
}

// Animated banner component using column-based animation
function AnimatedBanner() {
	const [animationPhase, setAnimationPhase] = useState(0);
	const totalCols = DOLPHIN_BANNER_COLUMNS.length;
	const totalRows = DOLPHIN_BANNER_COLUMNS[0]?.length || 0;
	
	// Total animation cycle: fade in left-to-right + pause (1s) + fade out left-to-right + pause
	const pauseSteps = 10; // 1 second pause (10 steps at 100ms each)
	const totalAnimationSteps = totalCols + pauseSteps + totalCols + 5; // fade in + pause + fade out + end pause

	useEffect(() => {
		const interval = setInterval(() => {
			setAnimationPhase(prev => (prev + 1) % totalAnimationSteps);
		}, 60); // Even faster: 60ms
		return () => clearInterval(interval);
	}, [totalAnimationSteps]);

	return (
		<Box flexDirection="column">
			{Array.from({ length: totalRows }, (_, rowIndex) => (
				<Box key={rowIndex}>
					{Array.from({ length: totalCols }, (_, colIndex) => {
						const char = DOLPHIN_BANNER_COLUMNS[colIndex]?.[rowIndex] || ' ';
						
						let isVisible = false;
						let color: string = 'cyan';
						
						// Determine which phase we're in
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
						} else if (animationPhase < totalCols + pauseSteps) {
							// Phase 2: Pause - all letters visible and stable
							isVisible = true;
							color = 'cyan';
							// Occasional subtle flicker during pause
							if (Math.random() > 0.98) {
								isVisible = false;
							}
						} else if (animationPhase < totalCols + pauseSteps + totalCols) {
							// Phase 3: Fade out left to right
							const fadeOutProgress = animationPhase - totalCols - pauseSteps;
							const fadeOutPosition = fadeOutProgress; // Start from left
							const distanceFromFadeOut = colIndex - fadeOutPosition;
							
							if (distanceFromFadeOut < 0) {
								// Already faded out
								isVisible = false;
							} else if (distanceFromFadeOut <= 3) {
								// In the fade out zone
								if (distanceFromFadeOut === 0) {
									color = 'yellow'; // Fade out edge
									isVisible = Math.random() > 0.3; // Some uncertainty
								} else if (distanceFromFadeOut === 1) {
									color = 'white';
									isVisible = Math.random() > 0.6; // More uncertainty  
								} else {
									color = 'blue';
									isVisible = Math.random() > 0.8; // High uncertainty
								}
							} else {
								// Still visible but add some noise
								isVisible = true;
								if (Math.random() > 0.95) {
									isVisible = false; // Occasional flicker
								}
								color = 'cyan';
							}
						}
						// Phase 3: Pause (all letters invisible)
						// isVisible stays false

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
}

// Sliding highlight banner - subtle shimmer effect on colored base
function SlidingHighlightBanner() {
	const [highlightPosition, setHighlightPosition] = useState(0);
	const totalCols = DOLPHIN_BANNER_COLUMNS.length;
	const totalRows = DOLPHIN_BANNER_COLUMNS[0]?.length || 0;

	useEffect(() => {
		const interval = setInterval(() => {
			setHighlightPosition(prev => (prev + 1) % (totalCols + 10));
		}, 80); // Faster: 80ms instead of 120ms
		return () => clearInterval(interval);
	}, [totalCols]);

	return (
		<Box flexDirection="column">
			{Array.from({ length: totalRows }, (_, rowIndex) => (
				<Box key={rowIndex}>
					{Array.from({ length: totalCols }, (_, colIndex) => {
						const char = DOLPHIN_BANNER_COLUMNS[colIndex]?.[rowIndex] || ' ';
						
						// Calculate distance from highlight center
						const distanceFromHighlight = Math.abs(colIndex - highlightPosition);
						
						let color: string = 'blue'; // Base color - blue instead of gray
						
						// Apply subtle shimmer colors based on distance from center
						if (distanceFromHighlight <= 4) { // Wider window: 4 instead of 2
							// Letters in the shimmer zone - subtle brightening
							if (distanceFromHighlight === 0) {
								color = 'white'; // Center of shimmer - brightest
							} else if (distanceFromHighlight <= 1) {
								color = 'cyan'; // Next to center - medium bright
							} else if (distanceFromHighlight <= 2) {
								color = 'cyan'; // Medium zone
							} else {
								color = 'blue'; // Edge - back to base
							}
						} else if (distanceFromHighlight <= 6) {
							// Subtle transition zone
							if (Math.random() > 0.8) {
								color = 'cyan'; // Occasional subtle sparkle
							} else {
								color = 'blue'; // Mostly base color
							}
						}
						// Everything else stays blue (base color)

						return (
							<Text key={colIndex} color={color}>
								{char}
							</Text>
						);
					})}
				</Box>
			))}
		</Box>
	);
}

// Flash animation banner - fade on, stay full, disappear, repeat
function FlashAnimationBanner() {
	const [animationPhase, setAnimationPhase] = useState(0);
	const totalCols = DOLPHIN_BANNER_COLUMNS.length;
	const totalRows = DOLPHIN_BANNER_COLUMNS[0]?.length || 0;
	
	// Total animation cycle: fade in + pause (1s) + disappear + brief pause
	const pauseSteps = 15; // 1 second pause when fully visible
	const disappearSteps = 5; // Brief disappear phase
	const totalAnimationSteps = totalCols + pauseSteps + disappearSteps;

	useEffect(() => {
		const interval = setInterval(() => {
			setAnimationPhase(prev => (prev + 1) % totalAnimationSteps);
		}, 60); // Fast like the letter animation
		return () => clearInterval(interval);
	}, [totalAnimationSteps]);

	return (
		<Box flexDirection="column">
			{Array.from({ length: totalRows }, (_, rowIndex) => (
				<Box key={rowIndex}>
					{Array.from({ length: totalCols }, (_, colIndex) => {
						const char = DOLPHIN_BANNER_COLUMNS[colIndex]?.[rowIndex] || ' ';
						
						let isVisible = false;
						let color: string = 'cyan';
						
						// Determine which phase we're in
						if (animationPhase < totalCols) {
							// Phase 1: Fade in left to right (same as letter animation)
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
						} else if (animationPhase < totalCols + pauseSteps) {
							// Phase 2: Stay fully visible for pause duration
							isVisible = true;
							color = 'cyan';
							// Very occasional subtle flicker during pause
							if (Math.random() > 0.99) {
								isVisible = false;
							}
						}
						// Phase 3: Disappear completely (isVisible stays false)
						// Phase 4: Brief pause before restart

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
}

// Static shimmer banner - full text always visible with random static effects
function StaticShimmerBanner() {
	const totalCols = DOLPHIN_BANNER_COLUMNS.length;
	const totalRows = DOLPHIN_BANNER_COLUMNS[0]?.length || 0;

	useEffect(() => {
		const interval = setInterval(() => {
			// Force re-render for static effects
		}, 100);
		return () => clearInterval(interval);
	}, []);

	return (
		<Box flexDirection="column">
			{Array.from({ length: totalRows }, (_, rowIndex) => (
				<Box key={rowIndex}>
					{Array.from({ length: totalCols }, (_, colIndex) => {
						const char = DOLPHIN_BANNER_COLUMNS[colIndex]?.[rowIndex] || ' ';
						
						let color: string = 'blue'; // Base color
						
						// Random static effects across all characters
						const randomValue = Math.random();
						if (randomValue > 0.9) {
							color = 'white'; // Bright flicker
						} else if (randomValue > 0.8) {
							color = 'cyan'; // Medium flicker
						} else if (randomValue > 0.7) {
							color = 'blue'; // Stay base (this creates the static feel)
						}
						// Most of the time stays blue (base color)

						return (
							<Text key={colIndex} color={color}>
								{char}
							</Text>
						);
					})}
				</Box>
			))}
		</Box>
	);
}

// Colorful static banner - full text with varied colors and effects
function ColorfulStaticBanner() {
	const totalCols = DOLPHIN_BANNER_COLUMNS.length;
	const totalRows = DOLPHIN_BANNER_COLUMNS[0]?.length || 0;

	useEffect(() => {
		const interval = setInterval(() => {
			// Force re-render for colorful effects
		}, 120);
		return () => clearInterval(interval);
	}, []);

	return (
		<Box flexDirection="column">
			{Array.from({ length: totalRows }, (_, rowIndex) => (
				<Box key={rowIndex}>
					{Array.from({ length: totalCols }, (_, colIndex) => {
						const char = DOLPHIN_BANNER_COLUMNS[colIndex]?.[rowIndex] || ' ';
						
						// Base color varies by position for more variety
						const baseColors = ['blue', 'cyan', 'magenta', 'green'];
						const baseColor = baseColors[(rowIndex + colIndex) % baseColors.length] || 'blue';
						let color: string = baseColor;
						
						// Random colorful static effects
						const randomValue = Math.random();
						if (randomValue > 0.95) {
							color = 'yellow'; // Bright sparkle
						} else if (randomValue > 0.9) {
							color = 'white'; // White flash
						} else if (randomValue > 0.8) {
							color = 'red'; // Red accent
						} else if (randomValue > 0.7) {
							// Randomly pick a different base color for variety
							const altColors = ['cyan', 'magenta', 'green', 'blue'];
							color = altColors[Math.floor(Math.random() * altColors.length)] || 'blue';
						}
						// Most of the time stays the base color

						return (
							<Text key={colIndex} color={color}>
								{char}
							</Text>
						);
					})}
				</Box>
			))}
		</Box>
	);
}