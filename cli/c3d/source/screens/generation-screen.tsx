import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {ServerManager} from '../server-manager.js';
import {GenerationService, GenerationProgress} from '../generation-service.js';
import {updateConfig} from '../c3d.config.js';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

interface Props {
	prompt: string;
	flags: {
		name?: string;
		port?: number;
		output?: string;
		retries?: number;
		noViewer?: boolean;
	};
}

const serverManager = new ServerManager();
const generationService = new GenerationService();

export function GenerationScreen({prompt, flags}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [progress, setProgress] = useState<GenerationProgress | null>(null);
	const [actualPort, setActualPort] = useState<number | null>(null);

	useEffect(() => {
		const generateModel = async () => {
			// Update config with CLI flags
			if (flags.retries) {
				updateConfig({ maxRetries: flags.retries });
			}
			if (flags.port) {
				updateConfig({ defaultPort: flags.port });
			}

			try {
				// Auto-start server if not running
				const isRunning = await serverManager.isRunning();
				if (!isRunning) {
					setMessage('Starting CADQuery server...');
					const startedPort = await serverManager.start(flags.port || 8765);
					setActualPort(startedPort);
				} else {
					const currentPort = serverManager.getCurrentPort() || 8765;
					setActualPort(currentPort);
				}

				setMessage('Starting CAD generation...');
				const result = await generationService.generateCADFromText(prompt, (progressUpdate) => {
					setProgress(progressUpdate);
					setMessage(progressUpdate.message);
				});

				if (result.success) {
					setMessage(`✅ Generation complete!\nOutput: ${result.outputPath}\nAttempts: ${result.attempts}\nWorking directory: ${result.workingDirectory}`);
					setStatus('success');

					// Auto-open frontend with the generated model
					if (!flags.noViewer && result.outputPath) {
						try {
							setMessage((prev) => prev + '\n\n🌐 Opening 3D viewer...');
							await openFrontendWithModel(result.outputPath, actualPort || 8765, prompt);
							setMessage((prev) => prev + '\n✅ 3D viewer opened successfully!');
						} catch (error) {
							setMessage((prev) => prev + `\n⚠️  3D viewer failed to open: ${error}`);
						}
					}
				} else {
					setMessage(`❌ Generation failed after ${result.attempts} attempts.\nError: ${result.error}`);
					setStatus('error');
				}
			} catch (error) {
				setMessage(`❌ Generation failed: ${error instanceof Error ? error.message : String(error)}`);
				setStatus('error');
			}
		};

		generateModel();
	}, [prompt, flags]);

	// Helper function to open frontend with model
	const openFrontendWithModel = async (modelPath: string, port: number, prompt?: string) => {
		const modelFileName = modelPath.split('/').pop() || 'model.stl';
		const encodedPrompt = prompt ? encodeURIComponent(prompt) : '';
		const url = `http://localhost:${port}?model=${modelFileName}&from=cli${prompt ? `&prompt=${encodedPrompt}` : ''}`;
		
		const platform = process.platform;
		if (platform === 'darwin') {
			await execAsync(`open "${url}"`);
		} else if (platform === 'win32') {
			await execAsync(`start "${url}"`);
		} else {
			await execAsync(`xdg-open "${url}"`);
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case 'loading': return 'yellow';
			case 'success': return 'green';
			case 'error': return 'red';
			default: return 'white';
		}
	};

	return (
		<BaseScreen title="CAD Generation">
			<Box flexDirection="column">
				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Text color="cyan" bold>🎨 CAD Generation Engine</Text>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>🎯 Target Object</Text>
						<Text color="white">  "{prompt}"</Text>
					</Box>
				</Box>

				<Box borderStyle="single" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>⚡ Generation Status</Text>
						{status === 'loading' && (
							<Box flexDirection="column">
								<Text color="yellow">
									{progress ? <ShimmerText text={progress.step.toUpperCase() || 'PROCESSING'} /> : <ShimmerText text="INITIALIZING" />}
								</Text>
								<Text color="gray" dimColor>
									{progress?.message || 'Starting generation...'}
								</Text>
								{progress?.attempt && progress?.maxAttempts && (
									<Text color="gray" dimColor>
										Attempt {progress.attempt}/{progress.maxAttempts}
									</Text>
								)}
							</Box>
						)}
						{status !== 'loading' && (
							<Text color={getStatusColor()}>
								{message}
							</Text>
						)}
					</Box>
				</Box>

				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="magenta" bold>🎮 Controls</Text>
						<Text color="gray">  • Q: Return to main menu</Text>
						{actualPort && (
							<Text color="gray">  • Server running on port {actualPort}</Text>
						)}
					</Box>
				</Box>
			</Box>
		</BaseScreen>
	);
}