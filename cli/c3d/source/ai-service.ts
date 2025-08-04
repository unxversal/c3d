import { Ollama } from 'ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getConfig } from './c3d.config.js';

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
	explanation: z.string().describe('Brief explanation of the approach taken'),
	estimated_complexity: z.enum(['simple', 'moderate', 'complex']).describe('Complexity level of the generated object'),
});

export type DescriptionResult = z.infer<typeof DescriptionSchema>;
export type CADQueryResult = z.infer<typeof CADQueryCodeSchema>;

export class AIService {
	private ollama: Ollama;

	constructor() {
		const config = getConfig();
		this.ollama = new Ollama({ 
			host: config.ollamaHost 
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

		const response = await this.ollama.chat({
			model: config.ollamaModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: `Generate a detailed technical description for: ${userPrompt}` }
			],
			format: zodToJsonSchema(DescriptionSchema),
			options: {
				temperature: config.temperature,
			},
		});

		return DescriptionSchema.parse(JSON.parse(response.message.content));
	}

	async generateCADQueryCode(userPrompt: string, description: DescriptionResult): Promise<CADQueryResult> {
		const config = getConfig();
		
		const systemPrompt = `You are an expert CADQuery programmer. You generate clean, efficient CADQuery Python code that creates 3D CAD objects and exports them to STL files.

CADQuery Guidelines:
- Always import cadquery as cq at the top
- Start with cq.Workplane() and build geometrically
- Use proper method chaining for efficiency
- Include appropriate fillets, chamfers, and finishing operations
- Always end with cq.exporters.export(result, "output.stl")
- Make dimensions realistic and proportional
- Use clear variable names and add brief comments
- Handle complex geometries by breaking into simpler operations
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

You must respond with structured JSON containing the complete CADQuery code, explanation, and complexity estimate.`;

		const userMessage = `Original request: "${userPrompt}"

Technical description: ${description.detailed_description}

Key features: ${description.key_features.join(', ')}

Dimensions guidance: ${description.dimensions_guidance}

Material considerations: ${description.material_considerations}

Generate complete CADQuery Python code for this object.`;

		const response = await this.ollama.chat({
			model: config.ollamaModel,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userMessage }
			],
			format: zodToJsonSchema(CADQueryCodeSchema),
			options: {
				temperature: config.temperature,
			},
		});

		return CADQueryCodeSchema.parse(JSON.parse(response.message.content));
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

	async deleteModel(): Promise<void> {
		const config = getConfig();
		await this.ollama.delete({ 
			model: config.ollamaModel 
		});
	}
}