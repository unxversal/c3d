import { AIService, DescriptionResult } from './ai-service.js';
import { ServerManager } from './server-manager.js';
import { getConfig } from './c3d.config.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GenerationResult {
	success: boolean;
	outputPath?: string;
	attempts: number;
	description?: DescriptionResult;
	finalCode?: string;
	error?: string;
	workingDirectory?: string;
}

export interface GenerationProgress {
	step: 'checking_model' | 'pulling_model' | 'generating_description' | 'generating_code' | 'testing_code' | 'completed' | 'failed';
	message: string;
	attempt?: number;
	maxAttempts?: number;
	descriptionResult?: DescriptionResult;
}

export class GenerationService {
	private aiService: AIService;
	private serverManager: ServerManager;

	constructor() {
		this.aiService = new AIService();
		this.serverManager = new ServerManager();
	}

	async generateCADFromText(
		prompt: string,
		onProgress?: (progress: GenerationProgress) => void
	): Promise<GenerationResult> {
		const config = getConfig();
		let attempts = 0;
		let description: DescriptionResult | undefined;
		let lastError = '';

		try {
			// Step 1: Check if model is available
			onProgress?.({
				step: 'checking_model',
				message: 'Checking if C3D model is available...'
			});

			const modelAvailable = await this.aiService.checkModelAvailability();
			if (!modelAvailable) {
				onProgress?.({
					step: 'pulling_model',
					message: 'C3D model not found, downloading... (this may take a while)'
				});
				await this.aiService.pullModel();
			}

			// Step 2: Generate detailed description
			onProgress?.({
				step: 'generating_description',
				message: 'Generating detailed technical description...'
			});

			description = await this.aiService.generateDescription(prompt);

			// Log the first LLM response for debugging
			await this.logLLMResponse('description', description, prompt);

			// Pass the description result through the progress callback for UI display
			onProgress?.({
				step: 'generating_description',
				message: 'Generated detailed technical description',
				descriptionResult: description
			});

			// Step 3: Start server if not running
			const serverRunning = await this.serverManager.isRunning();
			if (!serverRunning) {
				await this.serverManager.start(config.defaultPort);
			}

			// Step 4: Generate and test CADQuery code with retries
			for (attempts = 1; attempts <= config.maxRetries; attempts++) {
				try {
					onProgress?.({
						step: 'generating_code',
						message: `Generating CADQuery code (attempt ${attempts}/${config.maxRetries})...`,
						attempt: attempts,
						maxAttempts: config.maxRetries
					});

					const codeResult = await this.aiService.generateCADQueryCode(prompt, description);
					
					// Log the code generation result for debugging
					await this.logLLMResponse('cadquery_code', codeResult, prompt);

					onProgress?.({
						step: 'testing_code',
						message: `Testing generated code (attempt ${attempts}/${config.maxRetries})...`,
						attempt: attempts,
						maxAttempts: config.maxRetries
					});

					// Create temporary script file
					const tempDir = path.join(__dirname, '../temp');
					await mkdir(tempDir, { recursive: true });
					const scriptPath = path.join(tempDir, `generation_${Date.now()}.py`);
					await writeFile(scriptPath, codeResult.cadquery_code);

					// Test the code with the server
					const renderResult = await this.serverManager.render(scriptPath, 'output.stl');
					
					// Success! Clean up and return result
					onProgress?.({
						step: 'completed',
						message: 'CAD object generated successfully!'
					});

					return {
						success: true,
						outputPath: renderResult.output_paths[0],
						attempts,
						description,
						finalCode: codeResult.cadquery_code,
						workingDirectory: renderResult.workdir,
					};

				} catch (error) {
					lastError = error instanceof Error ? error.message : String(error);
					
					if (attempts === config.maxRetries) {
						onProgress?.({
							step: 'failed',
							message: `Failed after ${config.maxRetries} attempts. Last error: ${lastError}`
						});
						break;
					}

					// Add context to the description for the next attempt
					description = {
						...description,
						detailed_description: description.detailed_description + 
							`\n\nPREVIOUS ATTEMPT FAILED with error: ${lastError}. Please adjust the approach to avoid this issue.`
					};
				}
			}

			return {
				success: false,
				attempts,
				description,
				error: lastError,
			};

		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			onProgress?.({
				step: 'failed',
				message: `Generation failed: ${errorMsg}`
			});

			return {
				success: false,
				attempts,
				description,
				error: errorMsg,
			};
		}
	}

	async testOllamaConnection(): Promise<boolean> {
		try {
			await this.aiService.checkModelAvailability();
			return true;
		} catch (error) {
			return false;
		}
	}

	async checkModelAvailability(): Promise<boolean> {
		return this.aiService.checkModelAvailability();
	}

	async deleteModel(): Promise<void> {
		return this.aiService.deleteModel();
	}

	private async logLLMResponse(type: string, response: any, prompt: string): Promise<void> {
		try {
			const timestamp = new Date().toISOString();
			const logDir = path.join(__dirname, '../logs');
			await mkdir(logDir, { recursive: true });
			
			const logFile = path.join(logDir, `llm-responses-${new Date().toISOString().split('T')[0]}.log`);
			
			const logLine = `=== ${type.toUpperCase()} RESPONSE ${timestamp} ===\n` +
				`Prompt: ${prompt}\n` +
				`Response JSON:\n${JSON.stringify(response, null, 2)}\n` +
				`${'='.repeat(80)}\n\n`;
			
			await writeFile(logFile, logLine, { flag: 'a' });
		} catch (error) {
			// Silently fail logging - don't interrupt generation
			console.warn('Failed to log LLM response:', error);
		}
	}
}