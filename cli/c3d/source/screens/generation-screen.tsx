import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';

interface Props {
	prompt: string;
	isGenerating?: boolean;
	progress?: {
		stage: string;
		message: string;
		attempt: number;
		maxAttempts: number;
	};
	result?: {
		success: boolean;
		outputPath?: string;
		error?: string;
	};
}



export function GenerationScreen({prompt = "Create a coffee mug with handle", isGenerating: _isGenerating = true, progress: _progress, result: _result}: Props) {
	const [demoState, setDemoState] = useState(0);
	
	// Cycle through different states every 3 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setDemoState(prev => (prev + 1) % 4);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const states = [
		{
			isGenerating: true,
			progress: { stage: "ANALYZING PROMPT", message: "Understanding your request...", attempt: 1, maxAttempts: 5 },
			result: null
		},
		{
			isGenerating: true, 
			progress: { stage: "GENERATING CAD CODE", message: "AI is writing CADQuery script...", attempt: 2, maxAttempts: 5 },
			result: null
		},
		{
			isGenerating: true,
			progress: { stage: "RENDERING MODEL", message: "Creating 3D visualization...", attempt: 3, maxAttempts: 5 },
			result: null
		},
		{
			isGenerating: false,
			progress: null,
			result: { success: true, outputPath: "/tmp/coffee_mug.stl", error: undefined }
		}
	];

	const currentState = states[demoState]!;
	return (
		<BaseScreen title="CAD Generation">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>💭 Prompt: </Text>
					<Text color="white">"{prompt}"</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>⚡ Generation Status</Text>
						{currentState.isGenerating && currentState.progress ? (
							<Box flexDirection="column">
								<ShimmerText text={currentState.progress.stage} />
								<Text color="gray">{currentState.progress.message}</Text>
								<Text color="blue">
									Attempt {currentState.progress.attempt}/{currentState.progress.maxAttempts}
								</Text>
							</Box>
						) : currentState.result ? (
							<Box flexDirection="column">
								{currentState.result.success ? (
									<>
										<Text color="green">✅ Generation Complete!</Text>
										<Text color="gray">Output: {currentState.result.outputPath}</Text>
									</>
								) : (
									<>
										<Text color="red">❌ Generation Failed</Text>
										<Text color="gray">{currentState.result.error}</Text>
									</>
								)}
							</Box>
						) : (
							<Text color="gray">Ready to generate...</Text>
						)}
					</Box>
				</Box>

				{currentState.isGenerating && currentState.progress && (
					<Box borderStyle="single" padding={1}>
						<Box flexDirection="column">
							<Text color="blue" bold>📊 Progress</Text>
							<Text color="cyan">
								{'█'.repeat(Math.floor((currentState.progress.attempt / currentState.progress.maxAttempts) * 10))}
								{'░'.repeat(10 - Math.floor((currentState.progress.attempt / currentState.progress.maxAttempts) * 10))}
							</Text>
							<Text color="gray" dimColor>State {demoState + 1}/4 - Auto-cycling every 3s</Text>
						</Box>
					</Box>
				)}
			</Box>
		</BaseScreen>
	);
}