import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getConfig } from './c3d.config.js';
import { Ollama } from 'ollama';
import { PromptLibrary, type ErrorContext } from './prompt-library.js';

// Schema for the description generation phase
const DescriptionSchema = z.object({
	detailed_description: z.string().describe('A detailed, technical description of the CAD object to be created'),
	key_features: z.array(z.string()).describe('List of key features and specifications'),
	dimensions_guidance: z.string().describe('Guidance on dimensions and proportions'),
	material_considerations: z.string().describe('Considerations for material and manufacturing'),
});

// Schema for the CADQuery code generation phase
const CADQueryCodeSchema = z.object({
	cadquery_code: z.string().describe('Complete CADQuery Python code that generates the object'),
	thinking: z.string().optional().describe("Your thought process for generating the code."),
	description: z.string().optional().describe("A description of the part you've designed."),
	explanation: z.string().optional().describe("An explanation of the generated code.")
});

export type DescriptionResult = z.infer<typeof DescriptionSchema>;
export type CADQueryResult = z.infer<typeof CADQueryCodeSchema>;

export class AIService {
	private openai: OpenAI;

	constructor() {
		const config = getConfig();
		this.openai = new OpenAI({
			baseURL: `${config.ollamaHost}/v1`,
			apiKey: 'ollama', // Required but ignored by Ollama
		});
	}

	async generateDescription(userPrompt: string): Promise<DescriptionResult> {
		const config = getConfig();
		
		const systemPrompt = `You are an expert CAD designer and mechanical engineer. Your job is to take a user's request for a CAD object and create a detailed, technical description that can be used to generate CADQuery code.

Guidelines:
- Focus on geometric properties, dimensions, and technical specifications
- Consider manufacturing constraints and real-world practicality
- Be specific about shapes, measurements, and relationships between components
- Think about how the object would be constructed step-by-step
- Include details about holes, fillets, chamfers, and other features
- Consider the object's intended use and structural requirements

You must respond with structured JSON containing a detailed description, key features, dimension guidance, and material considerations.`;

		const response = await this.openai.chat.completions.create({
			model: config.ollamaModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: `Generate a detailed technical description for: ${userPrompt}` }
			],
			response_format: config.useJsonSchema ? {
				type: 'json_schema',
				json_schema: {
					name: 'description_result',
					strict: true,
					schema: zodToJsonSchema(DescriptionSchema)
				}
			} : {
				type: 'json_object'
			},
			temperature: config.temperature,
			stream: false,
			// max_tokens: config.maxTokens, // Use configured token limit
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error('No response content received from OpenAI API');
		}

		return DescriptionSchema.parse(JSON.parse(content));
	}

	async generateDirectCADQueryCode(userPrompt: string, errorContext?: ErrorContext): Promise<CADQueryResult> {
		const config = getConfig();
		
		if (config.debugLogging) {
			console.log('🔧 Starting direct CADQuery code generation...');
		}
		
		// Use the prompt library to generate prompts based on config
		const prompts = PromptLibrary.generateDirectPrompts(
			userPrompt,
			config.promptMode,
			errorContext
		);

		try {
			if (config.debugLogging) {
				console.log('🔧 Making OpenAI API call for direct code generation...');
				console.log(`🔧 Using ${config.useJsonSchema ? 'JSON Schema (strict)' : 'JSON Object (simple)'} mode`);
			}
			
			const response = await this.openai.chat.completions.create({
				model: config.ollamaModel,
				messages: [
					{ role: 'system', content: prompts.systemPrompt },
					{ role: 'user', content: prompts.userPrompt }
				],
				response_format: { type: 'json_object' },
				temperature: config.temperature,
				stream: false,
				max_tokens: config.maxTokens,
			});

			if (config.debugLogging) {
				if (config.debugLogging) {
				console.log('✅ Received response from OpenAI API');
			}
				console.log(`📏 Response: ${JSON.stringify(response)}`);
				console.log(`📏 Response usage: completion_tokens=${response.usage?.completion_tokens}, total_tokens=${response.usage?.total_tokens}`);
			}

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response content received from OpenAI API');
			}

			if (config.debugLogging) {
				console.log(`📝 Raw response length: ${content.length} characters`);
				console.log(`📋 Raw response preview: ${content.substring(0, 200)}...`);
				if (config.debugLogging) {
				console.log('🔧 Parsing JSON response...');
			}
			}
			
			let parsedJson;
			try {
				// For completion mode, we may need to add the opening brace
				let jsonString = content;
				if (config.promptMode === 'completion' || config.promptMode === 'thinking_completion') {
					jsonString = '{' + content;
				}
				parsedJson = JSON.parse(jsonString);
			} catch (error) {
				throw new Error(`Invalid JSON response: ${error}. Raw content: ${content}`);
			}
			
			// Manual validation
			if (!parsedJson.cadquery_code || typeof parsedJson.cadquery_code !== 'string') {
				throw new Error(`Response missing 'cadquery_code' field. Got: ${JSON.stringify(parsedJson)}`);
			}
			
			const parsedResult = CADQueryCodeSchema.parse(parsedJson);
			if (config.debugLogging) {
				console.log('✅ Successfully parsed CADQuery code result');
			}
			
			return parsedResult;
			
		} catch (error) {
			console.error('❌ Error in direct CADQuery code generation:', error);
			if (error instanceof Error) {
				console.error('Error message:', error.message);
				console.error('Error stack:', error.stack);
			}
			throw error;
		}
	}

	async generateCADQueryCode(userPrompt: string, description: DescriptionResult): Promise<CADQueryResult> {
		const config = getConfig();
		
		if (config.debugLogging) {
			console.log('🔧 Starting CADQuery code generation with description...');
		}
		
		// Use the prompt library to generate prompts based on config
		const prompts = PromptLibrary.generateTwoStagePrompts(
			userPrompt,
			description,
			config.promptMode
		);

		try {
			if (config.debugLogging) {
				console.log('🔧 Making OpenAI API call for code generation...');
			}
			
			const response = await this.openai.chat.completions.create({
				model: config.ollamaModel,
				messages: [
					{ role: 'system', content: prompts.systemPrompt },
					{ role: 'user', content: prompts.userPrompt }
				],
				response_format: { type: 'json_object' },
				temperature: config.temperature,
				stream: false,
				max_tokens: config.maxTokens, // Use configured token limit
			});

			if (config.debugLogging) {
				if (config.debugLogging) {
				console.log('✅ Received response from OpenAI API');
			}
			}

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response content received from OpenAI API');
			}

			if (config.debugLogging) {
				if (config.debugLogging) {
				console.log('🔧 Parsing JSON response...');
			}
			}

			// Handle JSON parsing based on prompt mode
			let parsedJson;
			if (config.promptMode === 'completion' || config.promptMode === 'thinking_completion') {
				// For completion mode, we may need to add the opening brace
				const fullJsonString = '{' + content;
				parsedJson = JSON.parse(fullJsonString);
			} else {
				// For instructional mode, parse as-is
				parsedJson = JSON.parse(content);
			}

			const parsedResult = CADQueryCodeSchema.parse(parsedJson);

			if (config.debugLogging) {
				if (config.debugLogging) {
				console.log('✅ Successfully parsed CADQuery code result');
			}
			}
			
			return parsedResult;
			
		} catch (error) {
			console.error('❌ Error in CADQuery code generation:', error);
			if (error instanceof Error) {
				console.error('Error message:', error.message);
				console.error('Error stack:', error.stack);
			}
			throw error;
		}
	}

	async checkModelAvailability(): Promise<boolean> {
		try {
			const config = getConfig();
			const models = await this.openai.models.list();
			return models.data.some((model: any) => model.id.includes(config.ollamaModel));
		} catch (error) {
			return false;
		}
	}

	async pullModel(): Promise<void> {
		const config = getConfig();
		// OpenAI compatibility API doesn't support model pulling
		// Fall back to direct Ollama HTTP API call
		try {
			const response = await fetch(`${config.ollamaHost}/api/pull`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: config.ollamaModel,
					stream: false
				})
			});
			
			if (!response.ok) {
				throw new Error(`Failed to pull model: ${response.statusText}`);
			}
		} catch (error) {
			throw new Error(`Failed to pull model: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	async deleteModel(): Promise<void> {
		const config = getConfig();
		// OpenAI compatibility API doesn't support model deletion
		// Fall back to direct Ollama HTTP API call
		try {
			const response = await fetch(`${config.ollamaHost}/api/delete`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: config.ollamaModel
				})
			});
			
			if (!response.ok) {
				throw new Error(`Failed to delete model: ${response.statusText}`);
			}
		} catch (error) {
			throw new Error(`Failed to delete model: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Parse Python code blocks from markdown text (supports both thinking format and regular format)
	 */
	private extractPythonCodeBlock(markdownText: string): string | null {
		const config = getConfig();
		
		// If thinking mode is enabled, try to extract from <code> tags first
		if (config.thinking) {
			const codeTagRegex = /<code>\s*```(?:python)?\n([\s\S]*?)\n```\s*<\/code>/g;
			const codeTagMatches = [...markdownText.matchAll(codeTagRegex)];
			
			if (codeTagMatches.length > 0 && codeTagMatches[0] && codeTagMatches[0][1]) {
				return codeTagMatches[0][1].trim();
			}
		}
		
		// Fallback to regular code block extraction
		const pythonBlockRegex = /```(?:python)?\n([\s\S]*?)\n```/g;
		const matches = [...markdownText.matchAll(pythonBlockRegex)];
		
		if (matches.length === 0) {
			// Also try looking for single backtick blocks
			const singleBacktickRegex = /`([^`\n]+)`/g;
			const singleMatches = [...markdownText.matchAll(singleBacktickRegex)];
			if (singleMatches.length > 0 && singleMatches[0] && singleMatches[0][1]) {
				return singleMatches[0][1];
			}
			return null;
		}
		
		if (matches.length > 1) {
			console.warn(`Found ${matches.length} code blocks, using the first one`);
		}
		
		const firstMatch = matches[0];
		if (!firstMatch || !firstMatch[1]) {
			return null;
		}
		
		return firstMatch[1].trim();
	}

	/**
	 * Generate CADQuery code using streaming markdown mode
	 */
	async generateStreamingCADQueryCode(
		userPrompt: string, 
		onStream?: (chunk: string) => void,
		errorContext?: ErrorContext
	): Promise<CADQueryResult> {
		const config = getConfig();
		
		if (config.debugLogging) {
			console.log('🔧 Starting streaming CADQuery code generation...');
		}
		
		// Use the prompt library to generate prompts based on config
		const prompts = PromptLibrary.generateStreamingPrompts(
			userPrompt,
			config.promptMode,
			config.thinking,
			errorContext
		);

		try {
			// Initialize Ollama client for streaming
			const ollama = new Ollama({ host: config.ollamaHost });
			
			if (config.debugLogging) {
				console.log('🔧 Making Ollama streaming API call...');
			}
			
			let fullResponse = '';
			// Use the generated prompts
			const stream = await ollama.generate({
				model: config.ollamaModel,
				prompt: `${prompts.systemPrompt}\n\n${prompts.userPrompt}`,
				stream: true,
				options: {
					temperature: config.temperature,
					num_predict: config.maxTokens,
				}
			});

			for await (const chunk of stream) {
				if (chunk.response) {
					fullResponse += chunk.response;
					onStream?.(chunk.response);
				}
				
				if (chunk.done) {
					if (config.debugLogging) {
						console.log('✅ Streaming complete');
					}
					break;
				}
			}

			if (config.debugLogging) {
				console.log(`📝 Full response length: ${fullResponse.length} characters`);
				console.log(`📋 Response preview: ${fullResponse.substring(0, 200)}...`);
			}
			
			// Extract Python code block
			const extractedCode = this.extractPythonCodeBlock(fullResponse);
			if (!extractedCode) {
				throw new Error('No Python code block found in response');
			}

			if (config.debugLogging) {
				console.log(`🔧 Extracted code length: ${extractedCode.length} characters`);
			}
			
			// No strict validation needed - let the server handle execution

			return {
				cadquery_code: extractedCode
			};

		} catch (error) {
			console.error('❌ Error in streaming CADQuery code generation:', error);
			throw error;
		}
	}
}