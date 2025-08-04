import React from 'react';
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

export function RenderScreen({scriptFile, isRendering = false, progress, result}: Props) {
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
						{isRendering && progress ? (
							<Box flexDirection="column">
								<ShimmerText text={progress.stage} />
								<Text color="cyan">
									{'█'.repeat(Math.floor(progress.percentage / 10))}
									{'░'.repeat(10 - Math.floor(progress.percentage / 10))}
								</Text>
								<Text color="gray">{progress.percentage}%</Text>
							</Box>
						) : result ? (
							<Box flexDirection="column">
								{result.success ? (
									<>
										<Text color="green">✅ Render Complete!</Text>
										{result.outputPaths && (
											<Box flexDirection="column">
												{result.outputPaths.map((path, index) => (
													<Text key={index} color="gray">  • {path}</Text>
												))}
											</Box>
										)}
									</>
								) : (
									<>
										<Text color="red">❌ Render Failed</Text>
										<Text color="gray">{result.error}</Text>
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
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}