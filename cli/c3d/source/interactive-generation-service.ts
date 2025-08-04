import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import readline from 'readline';
import { InteractiveAIService, InteractiveGenerationResult } from './interactive-ai-service.js';
import type { InteractiveProgress } from './interactive-ai-service.js';
import { ServerManager } from './server-manager.js';
import { getConfig } from './c3d.config.js';
import { ConversationManager } from './conversation-manager.js';

// Re-export types for external use
export type { InteractiveProgress } from './interactive-ai-service.js';

export class InteractiveGenerationService {
	private aiService: InteractiveAIService;
	private serverManager: ServerManager;
	private conversationManager: ConversationManager;
	private userInputHandler?: (question: string) => Promise<string>;
	private maxInteractions: number = 20; // Prevent infinite loops
	private rl?: readline.Interface;

	constructor() {
		this.aiService = new InteractiveAIService();
		this.serverManager = new ServerManager();
		this.conversationManager = this.aiService.getConversationManager();
	}

	setUserInputHandler(handler: (question: string) => Promise<string>): void {
		this.userInputHandler = handler;
	}

	private createReadlineInterface(): readline.Interface {
		if (!this.rl) {
			this.rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});
		}
		return this.rl;
	}

	private async promptUser(question: string): Promise<string> {
		const rl = this.createReadlineInterface();
		return new Promise<string>((resolve) => {
			rl.question(`\n💬 Agent Question: ${question}\n\n🔧 Your response: `, (answer) => {
				resolve(answer.trim());
			});
		});
	}

	private closeReadline(): void {
		if (this.rl) {
			this.rl.close();
			this.rl = undefined;
		}
	}

	async generateCADInteractively(
		initialPrompt: string,
		onProgress?: (progress: InteractiveProgress) => void
	): Promise<InteractiveGenerationResult> {
		const config = getConfig();
		let interactionCount = 0;

		try {
			// Step 1: Check if model is available
			onProgress?.({
				step: 'initializing',
				message: 'Checking if C3D model is available...'
			});

			const modelAvailable = await this.aiService.checkModelAvailability();
			if (!modelAvailable) {
				onProgress?.({
					step: 'initializing',
					message: 'C3D model not found, downloading... (this may take a while)'
				});
				await this.aiService.pullModel();
			}

			// Step 2: Start server if not running
			const serverRunning = await this.serverManager.isRunning();
			if (!serverRunning) {
				await this.serverManager.start(config.defaultPort);
			}

			// Step 3: Initialize conversation with user's first prompt
			this.conversationManager.addFirstPrompt(initialPrompt);
			this.conversationManager.setCurrentTurn('description_agent');

			// Step 4: Interactive conversation loop
			while (interactionCount < this.maxInteractions) {
				interactionCount++;
				
				const currentTurn = this.conversationManager.getCurrentTurn();
				
				if (currentTurn === 'description_agent') {
					onProgress?.({
						step: 'description_thinking',
						message: 'Description agent is analyzing the request...',
						conversationTurn: currentTurn,
						currentAgent: 'Description Agent'
					});

					const context = this.conversationManager.getContextForAgent('description_agent');
					const descriptionResponse = await this.aiService.processDescriptionAgent(context);
					
					if (descriptionResponse.response_type === 'explanation') {
						// Agent provided explanation, add to conversation and move to code agent
						this.conversationManager.addDescriptionAgentMessage(
							descriptionResponse.content,
							true // This is an explanation
						);
						this.conversationManager.setCurrentTurn('code_agent');
						
					} else if (descriptionResponse.response_type === 'question_to_user') {
						// Agent has a question for user
						this.conversationManager.addDescriptionAgentQuestion(
							descriptionResponse.question || descriptionResponse.content
						);

						onProgress?.({
							step: 'waiting_for_user',
							message: `Description agent asks: ${descriptionResponse.question || descriptionResponse.content}`,
							conversationTurn: 'user',
							awaitingUserInput: true
						});

						let userResponse: string;
						if (this.userInputHandler) {
							userResponse = await this.userInputHandler(
								descriptionResponse.question || descriptionResponse.content
							);
						} else {
							userResponse = await this.promptUser(
								descriptionResponse.question || descriptionResponse.content
							);
						}
						
						this.conversationManager.addUserMessage(userResponse);
						// Stay with description agent for follow-up
						
					} else if (descriptionResponse.response_type === 'clarification') {
						// Agent provided clarification to code agent's question
						this.conversationManager.addDescriptionAgentMessage(descriptionResponse.content);
						this.conversationManager.setCurrentTurn('code_agent');
					}

				} else if (currentTurn === 'code_agent') {
					onProgress?.({
						step: 'code_thinking',
						message: 'Code agent is generating CADQuery code...',
						conversationTurn: currentTurn,
						currentAgent: 'Code Agent'
					});

					const context = this.conversationManager.getContextForAgent('code_agent');
					const codeResponse = await this.aiService.processCodeAgent(context);
					
					if (codeResponse.response_type === 'code') {
						// Agent provided code, test it
						this.conversationManager.addCodeAgentMessage(
							`Generated CADQuery code:\n\`\`\`python\n${codeResponse.cadquery_code}\n\`\`\`\n\n${codeResponse.explanation || ''}`
						);

						onProgress?.({
							step: 'testing_code',
							message: 'Testing generated code...',
							conversationTurn: currentTurn
						});

						try {
							// Create temporary script file
							const tempDir = path.join(__dirname, '../temp');
							await mkdir(tempDir, { recursive: true });
							const scriptPath = path.join(tempDir, `interactive_generation_${Date.now()}.py`);
							await writeFile(scriptPath, codeResponse.cadquery_code || '');

							// Test the code with the server
							const renderResult = await this.serverManager.render(scriptPath, 'output.stl');
							
							// Success!
							onProgress?.({
								step: 'completed',
								message: 'CAD object generated successfully!'
							});

							return {
								success: true,
								outputPath: renderResult.output_paths[0],
								workingDirectory: renderResult.workdir,
								finalCode: codeResponse.cadquery_code,
								conversation: this.conversationManager.getMessages()
							};

						} catch (error) {
							const errorMessage = error instanceof Error ? error.message : String(error);
							
							// Add error to conversation and continue
							this.conversationManager.addCodeAgentError(
								`Code execution failed: ${errorMessage}`,
								errorMessage,
								interactionCount
							);
							
							// Stay with code agent to try again or ask for help
							// The agent can decide whether to try again or ask description agent
						}
						
					} else if (codeResponse.response_type === 'question_to_description') {
						// Code agent has a question for description agent
						this.conversationManager.addCodeAgentQuestion(
							codeResponse.question || codeResponse.content
						);
						this.conversationManager.setCurrentTurn('description_agent');
						
					} else if (codeResponse.response_type === 'request_clarification') {
						// Code agent needs clarification from user
						this.conversationManager.addCodeAgentQuestion(
							codeResponse.clarification_needed || codeResponse.content
						);

						onProgress?.({
							step: 'waiting_for_user',
							message: `Code agent asks: ${codeResponse.clarification_needed || codeResponse.content}`,
							conversationTurn: 'user',
							awaitingUserInput: true
						});

						let userResponse: string;
						if (this.userInputHandler) {
							userResponse = await this.userInputHandler(
								codeResponse.clarification_needed || codeResponse.content
							);
						} else {
							userResponse = await this.promptUser(
								codeResponse.clarification_needed || codeResponse.content
							);
						}
						
						this.conversationManager.addUserMessage(userResponse);
						this.conversationManager.setCurrentTurn('description_agent');
					}

				} else if (currentTurn === 'user') {
					// This shouldn't happen in normal flow, but handle gracefully
					this.conversationManager.setCurrentTurn('description_agent');
				}
			}

			// Max interactions reached
			onProgress?.({
				step: 'failed',
				message: `Reached maximum interactions (${this.maxInteractions}) without generating valid code.`
			});

			return {
				success: false,
				error: `Reached maximum interactions (${this.maxInteractions}) without generating valid code.`,
				conversation: this.conversationManager.getMessages()
			};

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			
			onProgress?.({
				step: 'failed',
				message: `Generation failed: ${errorMessage}`
			});

			return {
				success: false,
				error: errorMessage,
				conversation: this.conversationManager.getMessages()
			};
		} finally {
			// Always clean up readline interface
			this.closeReadline();
		}
	}

	getConversationSummary(): string {
		return this.conversationManager.getConversationSummary();
	}

	exportConversation() {
		return this.conversationManager.exportConversation();
	}

	importConversation(conversationState: any) {
		this.conversationManager.importConversation(conversationState);
	}

	reset(): void {
		this.aiService.reset();
	}
}