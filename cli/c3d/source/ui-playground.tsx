import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';

// Sample component for UI development/testing
export function UIPlayground() {
	const [counter, setCounter] = useState(0);
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

	useEffect(() => {
		const interval = setInterval(() => {
			setCounter(prev => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Cycle through statuses for demo
	useEffect(() => {
		const statusCycle: Array<'idle' | 'loading' | 'success' | 'error'> = ['idle', 'loading', 'success', 'error'];
		let currentIndex = 0;
		
		const statusInterval = setInterval(() => {
			currentIndex = (currentIndex + 1) % statusCycle.length;
			setStatus(statusCycle[currentIndex]!);
		}, 3000);

		return () => clearInterval(statusInterval);
	}, []);

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box marginBottom={1}>
				<Text color="cyan" bold>🎨 C3D UI Playground</Text>
			</Box>

			{/* Status Indicators */}
			<Box marginBottom={1}>
				<Text color="gray">Status Examples:</Text>
			</Box>
			
			<Box flexDirection="column" marginBottom={2}>
				<Box marginBottom={1}>
					<Text color="yellow">⏳ Loading: </Text>
					<Text color="yellow">Processing your request...</Text>
				</Box>
				
				<Box marginBottom={1}>
					<Text color="green">✅ Success: </Text>
					<Text color="green">Operation completed successfully!</Text>
				</Box>
				
				<Box marginBottom={1}>
					<Text color="red">❌ Error: </Text>
					<Text color="red">Something went wrong.</Text>
				</Box>
				
				<Box marginBottom={1}>
					<Text color="blue">ℹ️  Info: </Text>
					<Text color="blue">Here's some helpful information.</Text>
				</Box>
			</Box>

			{/* Interactive Status Demo */}
			<Box marginBottom={2}>
				<Text color="gray">Current Status: </Text>
				<Text color={getStatusColor(status)}>
					{getStatusIcon(status)} {status.toUpperCase()}
				</Text>
			</Box>

			{/* Counter */}
			<Box marginBottom={2}>
				<Text color="magenta">Live Counter: </Text>
				<Text color="white" bold>{counter}s</Text>
			</Box>

			{/* Progress Bar Demo */}
			<Box flexDirection="column" marginBottom={2}>
				<Text color="gray">Progress Bar:</Text>
				<ProgressBar percentage={(counter * 10) % 100} />
			</Box>

			{/* Generation Progress Simulation */}
			<Box flexDirection="column" marginBottom={2}>
				<Text color="gray">AI Generation Simulation:</Text>
				<GenerationProgressDemo />
			</Box>

			{/* Interactive Controls */}
			<Box flexDirection="column" marginBottom={2}>
				<Text color="gray">Status Controls (press numbers):</Text>
				<Box>
					<Text color="yellow">1: Loading </Text>
					<Text color="green">2: Success </Text>
					<Text color="red">3: Error </Text>
					<Text color="blue">4: Idle</Text>
				</Box>
			</Box>

			{/* Layout Examples */}
			<Box flexDirection="column" marginBottom={2}>
				<Text color="gray">Layout Examples:</Text>
				
				{/* Two-column layout */}
				<Box marginY={1}>
					<Box width={20} borderStyle="single" paddingX={1}>
						<Text color="cyan">Left Column</Text>
					</Box>
					<Box width={20} borderStyle="single" paddingX={1} marginLeft={2}>
						<Text color="magenta">Right Column</Text>
					</Box>
				</Box>

				{/* Card-like layout */}
				<Box borderStyle="round" paddingX={2} paddingY={1} marginY={1}>
					<Box flexDirection="column">
						<Text color="green" bold>📦 Sample Card</Text>
						<Text color="gray">This is a card-like component with borders</Text>
						<Box marginTop={1}>
							<Text color="blue">• Feature 1</Text>
						</Box>
						<Box>
							<Text color="blue">• Feature 2</Text>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Footer */}
			<Box marginTop={1} borderStyle="single" paddingX={1}>
				<Text color="gray" dimColor>
					💡 This is the UI Playground - use it to develop and test components!
				</Text>
			</Box>
		</Box>
	);
}

// Helper Components
function ProgressBar({percentage}: {percentage: number}) {
	const totalBars = 20;
	const filledBars = Math.floor((percentage / 100) * totalBars);
	const progress = '█'.repeat(filledBars) + '░'.repeat(totalBars - filledBars);
	
	return (
		<Box>
			<Text color="green">[{progress}] </Text>
			<Text color="white">{percentage.toFixed(1)}%</Text>
		</Box>
	);
}

function GenerationProgressDemo() {
	const [step, setStep] = useState(0);
	const [attempt, setAttempt] = useState(1);
	
	const steps = [
		'Checking model availability...',
		'Generating technical description...',
		'Creating CADQuery code...',
		'Testing generated code...',
		'Completed successfully!'
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setStep(prev => {
				if (prev >= steps.length - 1) {
					setAttempt(a => (a >= 3 ? 1 : a + 1));
					return 0;
				}
				return prev + 1;
			});
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text color="yellow">
					⏳ {steps[step]}
				</Text>
				{step === 3 && (
					<Text color="gray" dimColor> (attempt {attempt}/5)</Text>
				)}
			</Box>
			
			<Box>
				{steps.map((_, index) => (
					<Text key={index} color={index <= step ? 'green' : 'gray'} dimColor={index > step}>
						{index <= step ? '✓' : '○'} 
					</Text>
				))}
				<Text color="gray" dimColor> Progress</Text>
			</Box>
		</Box>
	);
}

// Helper functions
function getStatusColor(status: string): string {
	switch (status) {
		case 'loading': return 'yellow';
		case 'success': return 'green';
		case 'error': return 'red';
		default: return 'blue';
	}
}

function getStatusIcon(status: string): string {
	switch (status) {
		case 'loading': return '⏳';
		case 'success': return '✅';
		case 'error': return '❌';
		default: return 'ℹ️';
	}
}