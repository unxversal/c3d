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
	navigateTo: (screen: 'list', selectedFile?: string) => void; 
}

type EditorMode = 'generating' | 'waiting' | 'editing_code' | 'editing_prompt' | 'success' | 'error';
type EditingFocus = 'prompt' | 'code';

const serverManager = new ServerManager();
const generationService = new GenerationService();

export function EditorScreen({prompt: initialPrompt, flags, navigateTo}: Props) {
	const [mode, setMode] = useState<EditorMode>('generating');
	const [editingFocus, setEditingFocus] = useState<EditingFocus>('prompt');
	const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
	const [currentCode, setCurrentCode] = useState('');
	const [message, setMessage] = useState('Starting interactive CAD generation...');
	const [progress, setProgress] = useState<GenerationProgress | null>(null);
	const [actualPort, setActualPort] = useState<number | null>(null);



	const [lastError, setLastError] = useState('');
	const [successResult, setSuccessResult] = useState<any>(null);
	
	// Streaming state
	const [streamingText, setStreamingText] = useState('');
	const [isStreaming, setIsStreaming] = useState(false);
	
	// Code display scroll state
	const [codeScrollOffset, setCodeScrollOffset] = useState(0);

	// Handle key inputs
	useInput((input, key) => {
		if (key.tab && (mode === 'editing_code' || mode === 'editing_prompt' || mode === 'success')) {
			if (mode === 'success') {
				// From success mode → start editing (prompt first)
				setMode('editing_prompt');
				setEditingFocus('prompt');
				setMessage('Edit mode: Editing prompt. Press Tab to switch to code or return to view.');
			} else if (mode === 'editing_prompt') {
				// From prompt editing → code editing
				setMode('editing_code');
				setEditingFocus('code');
				setMessage('Edit mode: Editing code. Press Tab to return to view or switch to prompt.');
			} else if (mode === 'editing_code') {
				// From code editing → back to success/view mode
				if (successResult) {
					setMode('success');
					setMessage(`✅ Generation complete!\nOutput: ${successResult.outputPath}\nAttempts: ${successResult.attempts}\n\nPress Tab to edit, Ctrl+L for library`);
				} else {
					// If no success result yet, go to prompt editing
					setMode('editing_prompt');
					setEditingFocus('prompt');
					setMessage('Edit mode: Editing prompt. Press Tab to switch to code.');
				}
			}
		}
		
		if (key.ctrl && input === 'c') {
			// Cancel waiting period or generation
			if (mode === 'waiting') {
				setMode('editing_code');
				setMessage('Generation cancelled. Edit code below or press Tab to edit prompt.');
			}
		}
		
		if (key.ctrl && input === 'r') {
			// Resend/regenerate with current prompt (Ctrl+R)
			if (mode === 'editing_code' || mode === 'editing_prompt') {
				attemptGeneration();
			}
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
		
		// Open library shortcut (Ctrl+L)
		if (key.ctrl && input.toLowerCase() === 'l') {
			if (successResult && successResult.outputPath) {
				navigateTo('list', successResult.outputPath);
			} else {
				navigateTo('list');
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
				// Generation failed after all internal retries - switch to edit mode
				setLastError(result.error || 'Unknown error');
				setCurrentCode(result.finalCode || '// No code generated\n// Edit this code or press Tab to edit prompt');
				setMode('editing_code');
				setMessage(`❌ Generation failed after ${result.attempts} attempts.\n\nLast error: ${result.error}\n\nEdit the code below or press Tab to edit the prompt.`);
			}
		} catch (error) {
			setLastError(error instanceof Error ? error.message : String(error));
			setCurrentCode('// Error occurred during generation\n// Edit this code or press Tab to edit prompt');
			setMode('editing_code');
			setMessage(`❌ Unexpected error: ${error instanceof Error ? error.message : String(error)}\n\nEdit the code below or press Tab to edit the prompt.`);
		}
	}, [currentPrompt, flags, actualPort]);



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
				<Text color="cyan" bold>
					{(mode === 'editing_code' || mode === 'editing_prompt') ? '✏️  Edit' : '📋 Code'}
					{(mode === 'editing_code' || mode === 'editing_prompt') && (
						<Text color="gray"> (Tab: cycle modes, Ctrl+R: regenerate, Ctrl+L: library)</Text>
					)}
				</Text>
				
				{(mode === 'editing_code' || mode === 'editing_prompt') ? (
					editingFocus === 'prompt' ? (
						<Box marginTop={1} height={26}>
							<Box marginBottom={1}>
								<Text color="white">Edit Prompt:</Text>
							</Box>
							<CodeEditor
								value={currentPrompt}
								onChange={setCurrentPrompt}
								placeholder="Enter your CAD generation prompt here..."
								maxHeight={24}
							/>
						</Box>
					) : (
						<Box marginTop={1} height={26}>
							<CodeEditor
								value={currentCode}
								onChange={setCurrentCode}
								placeholder="// Generated CADQuery code will appear here..."
								maxHeight={24}
							/>
						</Box>
					)
				) : currentCode ? (
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
							📝 Editor Mode
						</Text>
						
						{/* Show streaming text when active */}
						{isStreaming && (
							<Box marginTop={1} flexDirection="column">
								<StreamingText 
									streamingText={streamingText}
									isComplete={false}
									height={10}
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
										<Text color="cyan">Press Ctrl+L to open in library</Text>
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



				{/* Controls */}
				<Box borderStyle="single" padding={1}>
					<Box flexDirection="column">
						<Text color="magenta" bold>🎮 Controls</Text>
						<Text color="gray">  • Tab: Switch between prompt/code editing</Text>
						<Text color="gray">  • Ctrl+R: Regenerate with current settings</Text>
						<Text color="gray">  • ↑↓: Scroll code display</Text>
						<Text color="gray">  • Ctrl+L: Open in library (after success)</Text>
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