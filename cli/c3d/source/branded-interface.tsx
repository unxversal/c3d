import React, {useEffect, useState} from 'react';
import {Text, Box} from 'ink';
import {DOLPHIN_ANSI_ONE, DOLPHIN_BANNER} from './dolphins.js';
import {ServerManager} from './server-manager.js';
import {GenerationService, GenerationProgress} from './generation-service.js';
import {getConfig, updateConfig} from './c3d.config.js';

type Props = {
	command: string;
	subCommand?: string;
	scriptFile?: string;
	generatePrompt?: string;
	flags: {
		name?: string;
		port?: number;
		output?: string;
		retries?: number;
	};
};

const serverManager = new ServerManager();
const generationService = new GenerationService();

export default function BrandedInterface({command, subCommand, scriptFile, generatePrompt, flags}: Props) {
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');
	const [serverRunning, setServerRunning] = useState(false);
	const [actualPort, setActualPort] = useState<number | null>(null);
	const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);

	const updateServerStatus = async () => {
		const currentPort = serverManager.getCurrentPort();
		const checkPort = currentPort || flags.port || 8765;
		const isRunning = await serverManager.isRunning(checkPort);
		setServerRunning(isRunning);
		if (isRunning && currentPort) {
			setActualPort(currentPort);
		}
		return isRunning;
	};

	useEffect(() => {
		const executeCommand = async () => {
			setStatus('loading');
			
			// Update config with any CLI flags
			if (flags.retries) {
				updateConfig({ maxRetries: flags.retries });
			}
			if (flags.port) {
				updateConfig({ defaultPort: flags.port });
			}
			
			try {
				switch (command) {
					case 'ui':
						setMessage('🎨 UI Development Interface\n\nThis is the new branded interface for C3D!\n\n🐬 Features:\n• UNXVERSAL Labs branding\n• Dolphin ASCII art\n• Organized status panels\n• Real-time operation tracking\n\n💡 Use other commands to see the interface in action:\n  c3d generate "your idea"\n  c3d server start\n  c3d config');
						setStatus('success');
						break;

					case 'generate':
						if (!generatePrompt) {
							setMessage('Error: Please provide a description of what you want to generate');
							setStatus('error');
							return;
						}
						
						// Auto-start server if not running
						const generationServerRunning = await updateServerStatus();
						if (!generationServerRunning) {
							setMessage('Starting CADQuery server...');
							const autoStartPort = await serverManager.start(flags.port || 8765);
							setActualPort(autoStartPort);
							await updateServerStatus();
						}
						
						setMessage('Starting CAD generation...');
						const generationResult = await generationService.generateCADFromText(generatePrompt, (progress) => {
							setGenerationProgress(progress);
							setMessage(progress.message);
						});
						
						if (generationResult.success) {
							setMessage(`✅ Generation complete!\nOutput: ${generationResult.outputPath}\nAttempts: ${generationResult.attempts}\nWorking directory: ${generationResult.workingDirectory}`);
							setStatus('success');
						} else {
							setMessage(`❌ Generation failed after ${generationResult.attempts} attempts.\nError: ${generationResult.error}`);
							setStatus('error');
						}
						break;

					case 'config':
						const config = getConfig();
						setMessage(`📋 Current Configuration:
AI Settings:
  Model: ${config.ollamaModel}
  Max Retries: ${config.maxRetries}
  Temperature: ${config.temperature}
  Host: ${config.ollamaHost}

Server Settings:
  Default Port: ${config.defaultPort}
  Timeout: ${config.serverStartTimeout}ms

Output Settings:
  Format: ${config.defaultOutputFormat}
  Keep Working Dir: ${config.keepWorkingDirectory}`);
						setStatus('success');
						break;

					case 'deload':
						setMessage('Removing C3D AI model from local storage...');
						const modelAvailable = await generationService.testOllamaConnection();
						if (!modelAvailable) {
							setMessage('❌ Cannot connect to Ollama. Make sure Ollama is running.');
							setStatus('error');
							return;
						}

						const hasModel = await generationService.checkModelAvailability();
						if (!hasModel) {
							setMessage('ℹ️  C3D model is not currently installed.');
							setStatus('success');
							return;
						}

						try {
							await generationService.deleteModel();
							setMessage('✅ C3D AI model successfully removed from local storage.\n💾 Freed up ~4-8GB of disk space.');
							setStatus('success');
						} catch (error) {
							setMessage(`❌ Failed to remove model: ${error instanceof Error ? error.message : String(error)}`);
							setStatus('error');
						}
						break;

					case 'server':
						if (subCommand === 'start') {
							const startedPort = await serverManager.start(flags.port || 8765);
							setActualPort(startedPort);
							await updateServerStatus();
							setMessage(`Server started on port ${startedPort}${startedPort !== (flags.port || 8765) ? ` (requested: ${flags.port || 8765})` : ''}`);
							setStatus('success');
						} else if (subCommand === 'stop') {
							await serverManager.stop();
							setActualPort(null);
							await updateServerStatus();
							setMessage('Server stopped');
							setStatus('success');
						} else if (subCommand === 'status') {
							const isRunning = await updateServerStatus();
							const currentPort = serverManager.getCurrentPort();
							setMessage(isRunning ? 
								`Server is running on port ${currentPort || flags.port || 8765}` : 
								'Server is not running'
							);
							setStatus('success');
						} else {
							setMessage('Error: Unknown server command. Use: start, stop, or status');
							setStatus('error');
						}
						break;

					case 'render':
						if (!scriptFile) {
							setMessage('Error: Please specify a Python script file to render (e.g., c3d render script.py)');
							setStatus('error');
							return;
						}
						
						// Auto-start server if not running
						const running = await updateServerStatus();
						if (!running) {
							setMessage('Starting server...');
							const autoStartPort = await serverManager.start(flags.port || 8765);
							setActualPort(autoStartPort);
							await updateServerStatus();
						}
						
						const renderResult = await serverManager.render(scriptFile, flags.output);
						setMessage(`Render complete! Output: ${renderResult.output_paths.join(', ')}`);
						setStatus('success');
						break;

					case 'hello':
					default:
						setMessage(`Hello, ${flags.name || 'Stranger'}!`);
						await updateServerStatus();
						setStatus('success');
						break;
				}
			} catch (error) {
				setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
				setStatus('error');
			}
		};

		executeCommand();
	}, [command, subCommand, scriptFile, generatePrompt, flags]);

	const getStatusColor = () => {
		switch (status) {
			case 'loading': return 'yellow';
			case 'success': return 'green';
			case 'error': return 'red';
			default: return 'white';
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Top Banner */}
			<Box marginBottom={2}>
				<Text color="cyan">
					{DOLPHIN_BANNER}
				</Text>
			</Box>

			{/* Main Content - Dolphin on left, Status on right */}
			<Box flexDirection="row">
				{/* Left Side - Dolphin */}
				<Box flexDirection="column" marginRight={4}>
					<Text color="blue">
						{DOLPHIN_ANSI_ONE}
					</Text>
				</Box>

				{/* Right Side - Status and Information */}
				<Box flexDirection="column" flexGrow={1}>
					{/* Server Status */}
					<Box marginBottom={2} borderStyle="single" padding={1}>
						<Box flexDirection="column">
							<Text color="cyan" bold>🖥️  Server Status</Text>
							<Box marginTop={1}>
								<Text color={serverRunning ? 'green' : 'red'}>
									{serverRunning ? '🟢 Running' : '🔴 Stopped'}
									{actualPort && ` on port ${actualPort}`}
								</Text>
							</Box>
						</Box>
					</Box>

					{/* Current Operation */}
					<Box marginBottom={2} borderStyle="single" padding={1}>
						<Box flexDirection="column">
							<Text color="cyan" bold>⚡ Current Operation</Text>
							<Box marginTop={1}>
								{status === 'loading' && (
									<Box flexDirection="column">
										<Text color="yellow">
											⏳ Processing...
										</Text>
										{generationProgress && (
											<Box marginTop={1}>
												<Text color="gray" dimColor>
													{generationProgress.message}
													{generationProgress.attempt && generationProgress.maxAttempts && 
														` (${generationProgress.attempt}/${generationProgress.maxAttempts})`
													}
												</Text>
											</Box>
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
					</Box>

					{/* AI Model Status */}
					<Box marginBottom={2} borderStyle="single" padding={1}>
						<Box flexDirection="column">
							<Text color="cyan" bold>🤖 AI Model</Text>
							<Box marginTop={1}>
								<Text color="magenta">joshuaokolo/C3Dv0</Text>
							</Box>
							<Box>
								<Text color="gray" dimColor>Two-stage CAD generation</Text>
							</Box>
						</Box>
					</Box>

					{/* Quick Commands */}
					<Box borderStyle="single" padding={1}>
						<Box flexDirection="column">
							<Text color="cyan" bold>🚀 Quick Commands</Text>
							<Box marginTop={1} flexDirection="column">
								<Text color="yellow">c3d generate "your idea"</Text>
								<Text color="green">c3d server start</Text>
								<Text color="blue">c3d config</Text>
								<Text color="red">c3d deload</Text>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Footer */}
			<Box marginTop={2} borderStyle="round" padding={1}>
				<Text color="gray" dimColor>
					🐬 UNXVERSAL Labs C3D - AI-Powered CAD Generation | Use 'c3d ui' for development playground
				</Text>
			</Box>
		</Box>
	);
}