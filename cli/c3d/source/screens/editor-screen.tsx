import React, {useState, useEffect, useCallback} from 'react';
import {Box, Text, useInput} from 'ink';
import {BaseScreen} from '../components/base-screen.js';
import {CodeEditor} from '../components/code-editor.js';
import {ShimmerText} from '../components/shimmer-text.js';
import {StreamingText} from '../components/streaming-text.js';
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

type EditorMode = 'generating' | 'waiting' | 'editing_code' | 'editing_prompt' | 'success' | 'error';
type EditingFocus = 'prompt' | 'code';

const serverManager = new ServerManager();
const generationService = new GenerationService();

export function EditorScreen({prompt: initialPrompt, flags}: Props) {
	const [mode, setMode] = useState<EditorMode>('generating');
	const [editingFocus, setEditingFocus] = useState<EditingFocus>('prompt');
	const [currentPrompt] = useState(initialPrompt);
	// Note: setCurrentPrompt removed for now - prompt editing requires external editor
	const [currentCode, setCurrentCode] = useState('');
	const [message, setMessage] = useState('Starting interactive CAD generation...');
	const [progress, setProgress] = useState<GenerationProgress | null>(null);
	const [actualPort, setActualPort] = useState<number | null>(null);
	const [attempt, setAttempt] = useState(1);
	const [maxRetries, setMaxRetries] = useState(5);

	const [lastError, setLastError] = useState('');
	const [successResult, setSuccessResult] = useState<any>(null);
	
	// Streaming state
	const [streamingText, setStreamingText] = useState('');
	const [isStreaming, setIsStreaming] = useState(false);
	
	// Code display scroll state
	const [codeScrollOffset, setCodeScrollOffset] = useState(0);

	// Handle key inputs
	useInput((input, key) => {
		if (key.tab && (mode === 'editing_code' || mode === 'editing_prompt')) {
			// Toggle between editing prompt and code
			setEditingFocus(editingFocus === 'prompt' ? 'code' : 'prompt');
		}
		
		if (key.ctrl && input === 'c') {
			// Cancel waiting period or generation
			if (mode === 'waiting') {
				setMode('editing_code');
				setMessage('Generation cancelled. Edit code below or press Tab to edit prompt.');
			}
		}
		
		if (key.return && key.shift && (mode === 'editing_code' || mode === 'editing_prompt')) {
			// Resend/regenerate with current prompt
			attemptGeneration();
		}
		
		// Code scrolling with arrow keys (when not in editing mode)
		if (mode !== 'editing_code' && mode !== 'editing_prompt') {
			if (key.upArrow) {
				setCodeScrollOffset(prev => Math.max(0, prev - 1));
			}
			if (key.downArrow) {
				const codeLines = currentCode.split('\n');
				const maxScroll = Math.max(0, codeLines.length - 20); // Show 20 lines max
				setCodeScrollOffset(prev => Math.min(maxScroll, prev + 1));
			}
		}
		
		// Open in library shortcut
		if (input.toLowerCase() === 'l' && mode === 'success' && successResult?.outputPath) {
			try {
				// Copy file path to clipboard using pbcopy (macOS) or other clipboard tools
				const command = process.platform === 'darwin' ? 'pbcopy' : 
							   process.platform === 'win32' ? 'clip' : 'xclip -selection clipboard';
				
				execAsync(`echo "${successResult.outputPath}" | ${command}`).then(() => {
					setMessage(prev => prev + '\n\n📚 File path copied to clipboard! Run: c3d list');
				}).catch(() => {
					setMessage(prev => prev + '\n\n📚 File location: ' + successResult.outputPath);
				});
			} catch (error) {
				setMessage(prev => prev + '\n\n📚 File location: ' + successResult.outputPath);
			}
		}
	});

	const attemptGeneration = useCallback(async () => {
		setMode('generating');
		setMessage('Attempting CAD generation...');
		setProgress(null);
		
		try {
			// Update config with CLI flags
			if (flags.retries) {
				updateConfig({ maxRetries: flags.retries });
				setMaxRetries(flags.retries);
			}
			if (flags.port) {
				updateConfig({ defaultPort: flags.port });
			}

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
			setStreamingText('');
			setIsStreaming(true);
			
			const result = await generationService.generateCADDirectly(
				currentPrompt, 
				(progressUpdate) => {
					setProgress(progressUpdate);
					setMessage(progressUpdate.message);
					if (progressUpdate.step === 'generating_code') {
						setIsStreaming(true);
					} else if (progressUpdate.step === 'testing_code') {
						setIsStreaming(false);
					}
				},
				(chunk) => {
					// Stream callback for real-time text updates
					setStreamingText(prev => prev + chunk);
				}
			);
			
			setIsStreaming(false);

			if (result.success) {
				setSuccessResult(result);
				setCurrentCode(result.finalCode || '');
				setMessage(`✅ Generation complete!\nOutput: ${result.outputPath}\nAttempts: ${result.attempts}\nWorking directory: ${result.workingDirectory}`);
				setMode('success');

				// Auto-open frontend with the generated model
				const servedFile = result.servedFiles?.[0];
				if (!flags.noViewer && servedFile) {
					try {
						setMessage((prev) => prev + '\n\n🌐 Opening 3D viewer...');
						await openFrontendWithModel(servedFile, actualPort || 8765, currentPrompt);
						setMessage((prev) => prev + '\n✅ 3D viewer opened successfully!');
					} catch (error) {
						setMessage((prev) => prev + `\n⚠️  3D viewer failed to open: ${error}`);
					}
				}
			} else {
				// Generation failed - enter waiting period before allowing retry
				setLastError(result.error || 'Unknown error');
				setCurrentCode(result.finalCode || '');
				enterWaitingPeriod();
			}
		} catch (error) {
			setLastError(error instanceof Error ? error.message : String(error));
			setCurrentCode('// Error occurred during generation\n// Edit this code or press Tab to edit prompt');
			enterWaitingPeriod();
		}
	}, [currentPrompt, flags, actualPort]);

	const enterWaitingPeriod = () => {
		setAttempt(prev => prev + 1);
		if (attempt >= maxRetries) {
			setMode('editing_code');
			setMessage(`❌ Max retries (${maxRetries}) reached. Edit code below or press Tab to edit prompt.`);
			return;
		}

		setMode('waiting');
		let timeLeft = 2;
		setMessage(`❌ Attempt ${attempt} failed: ${lastError}\n\n⏱️  Next attempt in 2 seconds... (Ctrl+C to cancel and edit)`);
		
		// Countdown timer
		const timer = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				clearInterval(timer);
				// Auto-retry after wait period
				attemptGeneration();
			} else {
				setMessage(`❌ Attempt ${attempt} failed: ${lastError}\n\n⏱️  Next attempt in ${timeLeft} seconds... (Ctrl+C to cancel and edit)`);
			}
		}, 1000);
	};

	// Helper function to open frontend with model
	const openFrontendWithModel = async (servedFileName: string, port: number, prompt?: string) => {
		const encodedPrompt = prompt ? encodeURIComponent(prompt) : '';
		const url = `http://localhost:${port}?model=${servedFileName}&from=cli${prompt ? `&prompt=${encodedPrompt}` : ''}`;
		
		const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
		await execAsync(`${command} "${url}"`);
	};

	// Start initial generation
	useEffect(() => {
		attemptGeneration();
	}, []); // Only run once on mount

	const getStatusColor = () => {
		switch (mode) {
			case 'generating': return 'yellow';
			case 'waiting': return 'magenta';
			case 'editing_code':
			case 'editing_prompt': return 'cyan';
			case 'success': return 'green';
			case 'error': return 'red';
			default: return 'white';
		}
	};

	const codeDisplay = (
		<Box borderStyle="single" padding={1} width={60} height={30}>
			<Box flexDirection="column">
				<Text color="cyan" bold>📋 Current Code</Text>
				{currentCode ? (
					<Box marginTop={1} flexDirection="column" height={26}>
						{(() => {
							const lines = currentCode.split('\n');
							const visibleLines = lines.slice(codeScrollOffset, codeScrollOffset + 20);
							const hasMoreAbove = codeScrollOffset > 0;
							const hasMoreBelow = codeScrollOffset + 20 < lines.length;
							
							return (
								<Box flexDirection="column">
									{hasMoreAbove && (
										<Text color="gray" dimColor>↑ ... ({codeScrollOffset} lines above)</Text>
									)}
									{visibleLines.map((line, index) => (
										<Text key={index} color="green" wrap="truncate">
											{line ? line.replace(/[^\x20-\x7E]/g, '?') : ' '}
										</Text>
									))}
									{hasMoreBelow && (
										<Text color="gray" dimColor>↓ ... ({lines.length - codeScrollOffset - 20} lines below)</Text>
									)}
									{lines.length > 20 && (
										<Text color="gray" dimColor>Use ↑↓ arrows to scroll</Text>
									)}
								</Box>
							);
						})()}
					</Box>
				) : (
					<Box marginTop={1}>
						<Text color="gray" italic>
							Generated code will appear here...
						</Text>
					</Box>
				)}
			</Box>
		</Box>
	);

	return (
		<BaseScreen title="Interactive CAD Editor" rightColumn={codeDisplay}>
			<Box flexDirection="column">
				{/* Combined Status/Streaming/Result Display */}
				<Box borderStyle="single" padding={1} marginBottom={1} height={15}>
					<Box flexDirection="column">
						<Text color={getStatusColor()} bold>
							📝 Editor Mode - Attempt {attempt}/{maxRetries}
						</Text>
						
						{/* Show streaming text when active */}
						{isStreaming && (
							<Box marginTop={1} flexDirection="column">
								<Text color="yellow" bold>🔄 Streaming...</Text>
								<StreamingText 
									streamingText={streamingText}
									isComplete={false}
									height={8}
								/>
							</Box>
						)}
						
						{/* Show result when not streaming */}
						{!isStreaming && (
							<Box marginTop={1} flexDirection="column">
								{mode === 'success' && (
									<Box flexDirection="column">
										<Text color="green" bold>🎉 Generation Successful!</Text>
										<Text color="gray">Final code displayed on the right →</Text>
										<Text color="cyan">Press L to open in library</Text>
									</Box>
								)}
								
								{(mode === 'error' || (mode === 'waiting' && lastError)) && (
									<Box flexDirection="column">
										<Text color="red" bold>❌ Generation Failed</Text>
										<Text color="red" wrap="wrap">{lastError}</Text>
										{mode === 'waiting' && (
											<Text color="magenta">Retrying in 2 seconds... (Ctrl+C to cancel)</Text>
										)}
									</Box>
								)}
								
								{mode === 'generating' && progress && (
									<Box flexDirection="column">
										<ShimmerText text={progress.step.toUpperCase() || 'PROCESSING'} />
										{progress?.attempt && progress?.maxAttempts && (
											<Text color="gray" dimColor>
												Attempt {progress.attempt}/{progress.maxAttempts}
											</Text>
										)}
									</Box>
								)}
								
								{!progress && !lastError && mode !== 'success' && (
									<Text color="gray" wrap="wrap">{message}</Text>
								)}
							</Box>
						)}
					</Box>
				</Box>

				{/* Editing Interface */}
				{(mode === 'editing_code' || mode === 'editing_prompt') && (
					<Box borderStyle="single" padding={1} marginBottom={1}>
						<Box flexDirection="column">
							<Text color="cyan" bold>
								✏️  {editingFocus === 'prompt' ? 'Edit Prompt' : 'Edit Code'} 
								<Text color="gray"> (Tab to switch, Shift+Enter to regenerate)</Text>
							</Text>
							
							{editingFocus === 'prompt' ? (
								<Box marginTop={1} flexDirection="column">
									<Text color="white">Current Prompt:</Text>
									<Box borderStyle="round" padding={1} marginTop={1}>
										<Text color="cyan" wrap="wrap">
											{currentPrompt}
										</Text>
									</Box>
									<Text color="gray" italic>
										Note: Use external editor to modify prompt, then restart with new prompt.
									</Text>
								</Box>
							) : (
								<Box marginTop={1} flexDirection="column">
									<Text color="white">CADQuery Code:</Text>
									<CodeEditor
										value={currentCode}
										onChange={setCurrentCode}
										placeholder="// Generated CADQuery code will appear here..."
										maxHeight={15}
									/>
								</Box>
							)}
						</Box>
					</Box>
				)}

				{/* Controls */}
				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="magenta" bold>🎮 Controls</Text>
						<Text color="gray">  • Tab: Switch between prompt/code editing</Text>
						<Text color="gray">  • Shift+Enter: Regenerate with current settings</Text>
						<Text color="gray">  • ↑↓: Scroll code display</Text>
						<Text color="gray">  • L: Open in library (after success)</Text>
						<Text color="gray">  • Ctrl+C: Cancel waiting period</Text>
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