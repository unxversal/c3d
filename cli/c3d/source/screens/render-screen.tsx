import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';

interface Props {
	scriptFile: string;
	isRendering?: boolean;
	progress?: {
		stage: string;
		percentage: number;
	};
	result?: {
		success: boolean;
		outputPaths?: string[];
		error?: string;
	};
}

export function RenderScreen({scriptFile = "my_cad_model.py", isRendering: _isRendering = false, progress: _progress, result: _result}: Props) {
	const [demoState, setDemoState] = useState(0);
	
	// Cycle through different states every 2.5 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setDemoState(prev => (prev + 1) % 4);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	const states = [
		{
			isRendering: true,
			progress: { stage: "PARSING SCRIPT", percentage: 25 },
			result: null
		},
		{
			isRendering: true, 
			progress: { stage: "EXECUTING CADQUERY", percentage: 65 },
			result: null
		},
		{
			isRendering: true,
			progress: { stage: "EXPORTING FILES", percentage: 90 },
			result: null
		},
		{
			isRendering: false,
			progress: null,
			result: { 
				success: true, 
				outputPaths: ["/tmp/model.stl", "/tmp/model.step", "/tmp/preview.png"],
				error: undefined
			}
		}
	];

	const currentState = states[demoState]!;
	return (
		<BaseScreen title="Script Rendering">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>📄 Input File: </Text>
					<Text color="white">{scriptFile}</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>⚡ Render Status</Text>
						{currentState.isRendering && currentState.progress ? (
							<Box flexDirection="column">
								<ShimmerText text={currentState.progress.stage} />
								<Text color="cyan">
									{'█'.repeat(Math.floor(currentState.progress.percentage / 10))}
									{'░'.repeat(10 - Math.floor(currentState.progress.percentage / 10))}
								</Text>
								<Text color="gray">{currentState.progress.percentage}%</Text>
							</Box>
						) : currentState.result ? (
							<Box flexDirection="column">
								{currentState.result.success ? (
									<>
										<Text color="green">✅ Render Complete!</Text>
										{currentState.result.outputPaths && (
											<Box flexDirection="column">
												{currentState.result.outputPaths.map((path, index) => (
													<Text key={index} color="gray">  • {path}</Text>
												))}
											</Box>
										)}
									</>
								) : (
									<>
										<Text color="red">❌ Render Failed</Text>
										<Text color="gray">{currentState.result.error}</Text>
									</>
								)}
							</Box>
						) : (
							<Text color="gray">Ready to render...</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>🎯 Output Formats</Text>
						<Text color="gray">  • STL (3D printing)</Text>
						<Text color="gray">  • STEP (CAD exchange)</Text>
						<Text color="gray">  • PNG (preview image)</Text>
						<Text color="gray" dimColor>  State {demoState + 1}/4 - Auto-cycling every 2.5s</Text>
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}