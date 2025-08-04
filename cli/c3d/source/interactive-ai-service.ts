import { Ollama } from 'ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getConfig } from './c3d.config.js';
import { ConversationManager, Message } from './conversation-manager.js';

// Schema for description agent responses
const DescriptionAgentResponseSchema = z.object({
	response_type: z.enum(['explanation', 'question_to_user', 'clarification']).describe('Type of response from the description agent'),
	content: z.string().describe('The main content of the response'),
	technical_description: z.string().optional().describe('Technical description if providing explanation'),
	key_features: z.array(z.string()).optional().describe('Key features if providing explanation'),
	dimensions_guidance: z.string().optional().describe('Dimension guidance if providing explanation'),
	material_considerations: z.string().optional().describe('Material considerations if providing explanation'),
	question: z.string().optional().describe('Question to ask user if response_type is question_to_user'),
});

// Schema for code agent responses
const CodeAgentResponseSchema = z.object({
	response_type: z.enum(['code', 'question_to_description', 'request_clarification']).describe('Type of response from the code agent'),
	content: z.string().describe('The main content of the response'),
	cadquery_code: z.string().optional().describe('CADQuery Python code if providing code'),
	explanation: z.string().optional().describe('Explanation of the code approach'),
	estimated_complexity: z.enum(['simple', 'moderate', 'complex']).optional().describe('Complexity estimate'),
	question: z.string().optional().describe('Question to ask description agent if response_type is question_to_description'),
	clarification_needed: z.string().optional().describe('What clarification is needed'),
});

export type DescriptionAgentResponse = z.infer<typeof DescriptionAgentResponseSchema>;
export type CodeAgentResponse = z.infer<typeof CodeAgentResponseSchema>;

export interface InteractiveProgress {
	step: 'initializing' | 'description_thinking' | 'code_thinking' | 'waiting_for_user' | 'testing_code' | 'completed' | 'failed';
	message: string;
	conversationTurn?: 'user' | 'description_agent' | 'code_agent';
	currentAgent?: string;
	awaitingUserInput?: boolean;
}

export interface InteractiveGenerationResult {
	success: boolean;
	outputPath?: string;
	workingDirectory?: string;
	finalCode?: string;
	conversation: Message[];
	error?: string;
}

export class InteractiveAIService {
	private ollama: Ollama;
	private conversationManager: ConversationManager;

	constructor() {
		const config = getConfig();
		this.ollama = new Ollama({ 
			host: config.ollamaHost 
		});
		this.conversationManager = new ConversationManager();
	}

	async processDescriptionAgent(contextMessages: Message[]): Promise<DescriptionAgentResponse> {
		const config = getConfig();
		
		const systemPrompt = `You are an expert CAD designer and mechanical engineer. You work collaboratively with a CADQuery programming agent to create CAD objects from user requests.

Your responsibilities:
1. Create detailed technical descriptions from user requests
2. Answer questions from the CADQuery programming agent
3. Ask clarifying questions to users when needed
4. Provide guidance on dimensions, materials, and manufacturing

Guidelines:
- Focus on geometric properties, dimensions, and technical specifications
- Consider manufacturing constraints and real-world practicality
- Be specific about shapes, measurements, and relationships between components
- Think about how the object would be constructed step-by-step
- Include details about holes, fillets, chamfers, and other features
- Consider the object's intended use and structural requirements

Response types:
- explanation: Provide a complete technical description
- question_to_user: Ask the user for clarification
- clarification: Respond to questions from the code agent

You must respond with structured JSON.`;

		// Build conversation context
		let conversationContext = 'Conversation history:\n';
		contextMessages.forEach(msg => {
			const roleLabel = {
				user: 'User',
				description_agent: 'You (Description Agent)',
				code_agent: 'CADQuery Agent',
				system: 'System'
			}[msg.role];
			conversationContext += `${roleLabel}: ${msg.content}\n`;
		});

		const response = await this.ollama.chat({
			model: config.ollamaModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: conversationContext }
			],
			format: zodToJsonSchema(DescriptionAgentResponseSchema),
			options: {
				temperature: config.temperature,
			},
		});

		return DescriptionAgentResponseSchema.parse(JSON.parse(response.message.content));
	}

	async processCodeAgent(contextMessages: Message[]): Promise<CodeAgentResponse> {
		const config = getConfig();
		
		const systemPrompt = `You are an expert CADQuery programmer. You work collaboratively with a description agent to create CAD objects from user requests.

Your responsibilities:
1. Generate clean, efficient CADQuery Python code
2. Ask questions to the description agent when you need clarification
3. Handle complex geometries by breaking into simpler operations
4. Ensure code is complete and runnable

CADQuery Guidelines:
- Always import cadquery as cq at the top
- Start with cq.Workplane() and build geometrically
- Use proper method chaining for efficiency
- Include appropriate fillets, chamfers, and finishing operations
- Always end with cq.exporters.export(result, "output.stl")
- Make dimensions realistic and proportional
- Use clear variable names and add brief comments
- Ensure the code is complete and runnable

Code Structure:
\`\`\`python
import cadquery as cq

# Create the main object
result = (
    cq.Workplane("XY")
    .method_chain()
    .operation()
)

# Export to STL
cq.exporters.export(result, "output.stl")
\`\`\`

Response types:
- code: Provide complete CADQuery code
- question_to_description: Ask the description agent for clarification
- request_clarification: Request more details about the requirements

You must respond with structured JSON.`;

		// Build conversation context
		let conversationContext = 'Conversation history:\n';
		contextMessages.forEach(msg => {
			const roleLabel = {
				user: 'User',
				description_agent: 'Description Agent',
				code_agent: 'You (CADQuery Agent)',
				system: 'System'
			}[msg.role];
			conversationContext += `${roleLabel}: ${msg.content}\n`;
		});

		const response = await this.ollama.chat({
			model: config.ollamaModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: conversationContext }
			],
			format: zodToJsonSchema(CodeAgentResponseSchema),
			options: {
				temperature: config.temperature,
			},
		});

		return CodeAgentResponseSchema.parse(JSON.parse(response.message.content));
	}

	getConversationManager(): ConversationManager {
		return this.conversationManager;
	}

	async checkModelAvailability(): Promise<boolean> {
		try {
			const config = getConfig();
			const models = await this.ollama.list();
			return models.models.some(model => model.name.includes(config.ollamaModel));
		} catch (error) {
			return false;
		}
	}

	async pullModel(): Promise<void> {
		const config = getConfig();
		await this.ollama.pull({ 
			model: config.ollamaModel,
			stream: false 
		});
	}

	reset(): void {
		this.conversationManager.reset();
	}
}