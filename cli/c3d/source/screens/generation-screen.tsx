import React from 'react';
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



export function GenerationScreen({prompt, isGenerating = true, progress, result}: Props) {
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
						{isGenerating && progress ? (
							<Box flexDirection="column">
								<ShimmerText text={progress.stage} />
								<Text color="gray">{progress.message}</Text>
								<Text color="blue">
									Attempt {progress.attempt}/{progress.maxAttempts}
								</Text>
							</Box>
						) : result ? (
							<Box flexDirection="column">
								{result.success ? (
									<>
										<Text color="green">✅ Generation Complete!</Text>
										<Text color="gray">Output: {result.outputPath}</Text>
									</>
								) : (
									<>
										<Text color="red">❌ Generation Failed</Text>
										<Text color="gray">{result.error}</Text>
									</>
								)}
							</Box>
						) : (
							<Text color="gray">Ready to generate...</Text>
						)}
					</Box>
				</Box>

				{isGenerating && progress && (
					<Box borderStyle="single" padding={1}>
						<Box flexDirection="column">
							<Text color="blue" bold>📊 Progress</Text>
							<Text color="cyan">
								{'█'.repeat(Math.floor((progress.attempt / progress.maxAttempts) * 10))}
								{'░'.repeat(10 - Math.floor((progress.attempt / progress.maxAttempts) * 10))}
							</Text>
						</Box>
					</Box>
				)}
			</Box>
		</BaseScreen>
	);
}