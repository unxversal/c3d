import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getConfig } from './c3d.config.js';
import { Ollama } from 'ollama';

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

	async generateDirectCADQueryCode(userPrompt: string): Promise<CADQueryResult> {
		const config = getConfig();
		
		console.log('🔧 Starting direct CADQuery code generation...');
		
				const systemPrompt = `You are an AI CAD assistant expert at writing CADQuery code. Your response must answer the user's prompt.

CADQuery Quick Reference:
- Import: import cadquery as cq
- Start: cq.Workplane("XY")
- Basic shapes: .box(w, d, h), .cylinder(h, r), .sphere(r)
- 2D shapes: .rect(w, h), .circle(r)
- Operations: .extrude(h), .cut(), .union(), .fillet(r)
- Positioning: .translate((x,y,z)), .rotate((0,0,1), angle)
- Export: cq.exporters.export(result, "output.stl")

Example:
import cadquery as cq
result = cq.Workplane("XY").box(10, 10, 5).fillet(1)
cq.exporters.export(result, "output.stl")

CRITICAL: You MUST respond with valid JSON in this EXACT format:
{"cadquery_code": "your_python_code_here"}

DO NOT generate any other JSON structure. DO NOT include extra fields like "parameters", "faces", or "size".
The "cadquery_code" field must contain complete, executable Python code.

Example response:
{"cadquery_code": "import cadquery as cq\\nresult = cq.Workplane(\\"XY\\").box(10, 10, 5)\\ncq.exporters.export(result, \\"output.stl\\")"}

Make sure you are conscious of every character you write because it will be run as a Python script.`;

		try {
			console.log('🔧 Making OpenAI API call for direct code generation...');
			console.log(`🔧 Using ${config.useJsonSchema ? 'JSON Schema (strict)' : 'JSON Object (simple)'} mode`);
			
			const response = await this.openai.chat.completions.create({
				model: config.ollamaModel,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: `Generate CADQuery code for: ${userPrompt}` }
				],
				response_format: config.useJsonSchema ? {
					type: 'json_schema',
					json_schema: {
						name: 'cadquery_result',
						strict: true,
						schema: zodToJsonSchema(CADQueryCodeSchema)
					}
				} : {
					type: 'json_object'
				},
				temperature: config.temperature,
				stream: false,
				max_tokens: config.maxTokens,
			});

			console.log('✅ Received response from OpenAI API');
			console.log(`📏 Response: ${JSON.stringify(response)}`);
			console.log(`📏 Response usage: completion_tokens=${response.usage?.completion_tokens}, total_tokens=${response.usage?.total_tokens}`);

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response content received from OpenAI API');
			}

			console.log(`📝 Raw response length: ${content.length} characters`);
			console.log(`📋 Raw response preview: ${content.substring(0, 200)}...`);
			console.log('🔧 Parsing JSON response...');
			
			let parsedJson;
			try {
				parsedJson = JSON.parse(content);
			} catch (error) {
				throw new Error(`Invalid JSON response: ${error}`);
			}
			
			// If not using strict schema, validate manually
			if (!config.useJsonSchema) {
				if (!parsedJson.cadquery_code || typeof parsedJson.cadquery_code !== 'string') {
					throw new Error(`Response missing 'cadquery_code' field. Got: ${JSON.stringify(parsedJson)}`);
				}
			}
			
			const parsedResult = CADQueryCodeSchema.parse(parsedJson);
			console.log('✅ Successfully parsed CADQuery code result');
			
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
		
		console.log('🔧 Starting CADQuery code generation...');
		
		const systemPrompt = `You are an expert CADQuery programmer. Generate complete, working CADQuery Python code.

CRITICAL REQUIREMENTS:
- Always import cadquery as cq
- Use cq.Workplane("XY") to start
- Assign final object to variable named "result"
- Make code complete and runnable
- Use realistic dimensions

MANDATORY FINAL LINE - COPY EXACTLY:
cq.exporters.export(result, "output.stl")

WRONG EXPORT METHODS (DO NOT USE):
- cq.exporters.stl.export() ❌
- cq.exporters.stl() ❌  
- result.exportSTL() ❌
- any other export method ❌

ONLY USE: cq.exporters.export(result, "output.stl") ✅

Example complete code:
import cadquery as cq
result = cq.Workplane("XY").box(1, 1, 1)
cq.exporters.export(result, "output.stl")

RESPONSE FORMAT: JSON with only "cadquery_code" field containing complete Python code.`;

		const userMessage = `Generate CADQuery code for: ${userPrompt}

Description: ${description.detailed_description}

Key features: ${description.key_features.join(', ')}`;

		try {
			console.log('🔧 Making OpenAI API call for code generation...');
			
			const response = await this.openai.chat.completions.create({
				model: config.ollamaModel,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userMessage }
				],
				response_format: config.useJsonSchema ? {
					type: 'json_schema',
					json_schema: {
						name: 'cadquery_result',
						strict: true,
						schema: zodToJsonSchema(CADQueryCodeSchema)
					}
				} : {
					type: 'json_object'
				},
				temperature: config.temperature,
				stream: false,
				max_tokens: config.maxTokens, // Use configured token limit
			});

			console.log('✅ Received response from OpenAI API');

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response content received from OpenAI API');
			}

			console.log('🔧 Parsing JSON response...');
			const parsedResult = CADQueryCodeSchema.parse(JSON.parse(content));
			console.log('✅ Successfully parsed CADQuery code result');
			
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
	 * Parse Python code blocks from markdown text
	 */
	private extractPythonCodeBlock(markdownText: string): string | null {
		// Look for ```python or ``` code blocks
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
		onStream?: (chunk: string) => void
	): Promise<CADQueryResult> {
		const config = getConfig();
		
		console.log('🔧 Starting streaming CADQuery code generation...');
		
		const systemPrompt = `You are an AI CAD assistant expert at writing CADQuery code. Your response must answer the user's prompt.

Write your response as natural text with explanations, but include exactly ONE Python code block containing the complete CADQuery code.

CADQuery Quick Reference:
- Import: import cadquery as cq
- Start: cq.Workplane("XY")  
- Basic shapes: .box(w, d, h), .cylinder(h, r), .sphere(r)
- 2D shapes: .rect(w, h), .circle(r)
- Operations: .extrude(h), .cut(), .union(), .fillet(r)
- Positioning: .translate((x,y,z)), .rotate((0,0,1), angle)
- Export: cq.exporters.export(result, "output.stl")

CRITICAL: Your code block must end with exactly this line:
cq.exporters.export(result, "output.stl")

Example response:
I'll create a simple cube for you. Here's the CADQuery code:

\`\`\`python
import cadquery as cq

# Create a 10x10x10 cube
result = cq.Workplane("XY").box(10, 10, 10).fillet(1)

# Export the result
cq.exporters.export(result, "output.stl")
\`\`\`

This creates a cube with rounded edges (fillet).`;

		try {
			// Initialize Ollama client for streaming
			const ollama = new Ollama({ host: config.ollamaHost });
			
			console.log('🔧 Making Ollama streaming API call...');
			
			let fullResponse = '';
			const stream = await ollama.generate({
				model: config.ollamaModel,
				prompt: `${systemPrompt}\n\nUser request: ${userPrompt}`,
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
					console.log('✅ Streaming complete');
					break;
				}
			}

			console.log(`📝 Full response length: ${fullResponse.length} characters`);
			console.log(`📋 Response preview: ${fullResponse.substring(0, 200)}...`);
			
			// Extract Python code block
			const extractedCode = this.extractPythonCodeBlock(fullResponse);
			if (!extractedCode) {
				throw new Error('No Python code block found in response');
			}

			console.log(`🔧 Extracted code length: ${extractedCode.length} characters`);
			
			// Validate that the code ends with the correct export statement
			const lines = extractedCode.split('\n');
			const lastLine = lines[lines.length - 1]?.trim() || '';
			
			if (!lastLine.includes('cq.exporters.export(result, "output.stl")')) {
				throw new Error(`Code does not end with required export statement. Last line: ${lastLine}`);
			}

			return {
				cadquery_code: extractedCode
			};

		} catch (error) {
			console.error('❌ Error in streaming CADQuery code generation:', error);
			throw error;
		}
	}
}