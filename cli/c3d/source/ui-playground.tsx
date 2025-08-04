import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import {DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO, DOLPHIN_BANNER} from './dolphins.js';

// Unxversal Labs C3D UI Component
export function UIPlayground() {
	const [counter, setCounter] = useState(0);
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [currentDolphin, setCurrentDolphin] = useState(0);

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

	// Alternate between dolphins
	useEffect(() => {
		const dolphinInterval = setInterval(() => {
			setCurrentDolphin(prev => (prev + 1) % 2);
		}, 5000);

		return () => clearInterval(dolphinInterval);
	}, []);

	const dolphins = [DOLPHIN_ANSI_ONE, DOLPHIN_ANSI_TWO];

	return (
		<Box flexDirection="row" padding={1} height={50}>
			{/* Left Side - Dolphin */}
			<Box flexDirection="column" marginRight={3} width={60}>
				<Text color="cyan" dimColor>
					{dolphins[currentDolphin]}
				</Text>
				<Box marginTop={1} borderStyle="single" paddingX={1}>
					<Text color="gray" dimColor>
						🐬 UNXVERSAL LABS - Dolphin {currentDolphin + 1}/2
					</Text>
				</Box>
			</Box>

			{/* Right Side - Content */}
			<Box flexDirection="column" width={80}>
				{/* Top Banner */}
				<Box marginBottom={2}>
					<Text color="cyan" bold>
						{DOLPHIN_BANNER}
					</Text>
				</Box>

				{/* Status Section */}
				<Box borderStyle="round" paddingX={2} paddingY={1} marginBottom={2}>
					<Box flexDirection="column">
						<Text color="yellow" bold>🎛️  System Status</Text>
						<Box marginTop={1}>
							<Text color="gray">Current State: </Text>
							<Text color={getStatusColor(status)}>
								{getStatusIcon(status)} {status.toUpperCase()}
							</Text>
						</Box>
						<Box>
							<Text color="gray">Uptime: </Text>
							<Text color="white" bold>{counter}s</Text>
						</Box>
						<Box>
							<Text color="gray">Server: </Text>
							<Text color="green">🟢 Online</Text>
						</Box>
					</Box>
				</Box>

				{/* Progress Section */}
				<Box borderStyle="round" paddingX={2} paddingY={1} marginBottom={2}>
					<Box flexDirection="column">
						<Text color="blue" bold>⚡ AI Generation Progress</Text>
						<Box marginTop={1}>
							<ProgressBar percentage={(counter * 5) % 100} />
						</Box>
						<Box marginTop={1}>
							<GenerationProgressDemo />
						</Box>
					</Box>
				</Box>

				{/* Status Messages */}
				<Box borderStyle="round" paddingX={2} paddingY={1} marginBottom={2}>
					<Box flexDirection="column">
						<Text color="magenta" bold>📋 Status Messages</Text>
						<Box marginTop={1}>
							<StatusMessage type="success" message="CAD generation completed successfully!" />
						</Box>
						<Box>
							<StatusMessage type="info" message="C3D model ready for generation" />
						</Box>
						<Box>
							<StatusMessage type="warning" message="Server port auto-discovered: 8765" />
						</Box>
						{status === 'error' && (
							<Box>
								<StatusMessage type="error" message="Demo error state - this is just a simulation" />
							</Box>
						)}
					</Box>
				</Box>

				{/* Footer */}
				<Box borderStyle="single" paddingX={1}>
					<Text color="gray" dimColor>
						🎨 UNXVERSAL LABS C3D - UI Development Environment | Dolphin Animation: {currentDolphin === 0 ? 'Swimming' : 'Diving'}
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

// Helper Components
function ProgressBar({percentage}: {percentage: number}) {
	const totalBars = 30;
	const filledBars = Math.floor((percentage / 100) * totalBars);
	const progress = '█'.repeat(filledBars) + '░'.repeat(totalBars - filledBars);
	
	return (
		<Box>
			<Text color="cyan">[{progress}] </Text>
			<Text color="white" bold>{percentage.toFixed(1)}%</Text>
		</Box>
	);
}

function StatusMessage({type, message}: {type: 'success' | 'error' | 'info' | 'warning'; message: string}) {
	const getColor = () => {
		switch (type) {
			case 'success': return 'green';
			case 'error': return 'red';
			case 'warning': return 'yellow';
			case 'info': return 'blue';
		}
	};

	const getIcon = () => {
		switch (type) {
			case 'success': return '✅';
			case 'error': return '❌';
			case 'warning': return '⚠️';
			case 'info': return 'ℹ️';
		}
	};

	return (
		<Box>
			<Text color={getColor()}>{getIcon()} </Text>
			<Text color={getColor()}>{message}</Text>
		</Box>
	);
}

function GenerationProgressDemo() {
	const [step, setStep] = useState(0);
	const [attempt, setAttempt] = useState(1);
	
	const steps = [
		'Initializing C3D model...',
		'Parsing user prompt...',
		'Generating technical specs...',
		'Creating CADQuery code...',
		'Validating output...',
		'Rendering STL file...'
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setStep(prev => {
				if (prev >= steps.length - 1) {
					setAttempt(a => (a >= 5 ? 1 : a + 1));
					return 0;
				}
				return prev + 1;
			});
		}, 1500);

		return () => clearInterval(interval);
	}, []);

	return (
		<Box flexDirection="column">
			<Box>
				<Text color="cyan">🤖 AI Generation: </Text>
				<Text color="yellow">{steps[step]}</Text>
				{step === 4 && (
					<Text color="gray" dimColor> (attempt {attempt}/5)</Text>
				)}
			</Box>
			
			<Box marginTop={1}>
				{steps.map((_, index) => (
					<Text key={index} color={index <= step ? 'cyan' : 'gray'} dimColor={index > step}>
						{index <= step ? '●' : '○'}
					</Text>
				))}
				<Text color="gray" dimColor> {Math.min(step + 1, steps.length)}/{steps.length}</Text>
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