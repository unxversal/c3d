export interface C3DConfig {
	// AI Generation Settings
	maxRetries: number;
	ollamaModel: string;
	ollamaHost: string;
	temperature: number;
	maxTokens: number;
	useJsonSchema: boolean; // Whether to use strict JSON schema or simple JSON mode
	useStreamingMode: boolean; // Whether to use streaming markdown mode instead of JSON
	
	// Server Settings
	defaultPort: number;
	serverStartTimeout: number;
	stopServerOnQuit: boolean; // Whether pressing 'q' to quit should also stop the server
	
	// Output Settings
	defaultOutputFormat: string;
	keepWorkingDirectory: boolean;
	
	// Debug Settings
	debugLogging: boolean; // Whether to show detailed debug logs during generation
	
	// Conversation Management (for future interactive features)
	keepFirstPrompt: boolean;
	keepLatestExplanation: boolean;
	maxHistoryMessages: number;
}

export const defaultConfig: C3DConfig = {
	// AI Generation Settings
	maxRetries: 5,
	ollamaModel: 'joshuaokolo/C3Dv0',
	ollamaHost: 'http://127.0.0.1:11434',
	temperature: 1.0, // Recommended temperature for better creativity
	maxTokens: 32768, // Maximum tokens for LLM responses (match OLLAMA_CONTEXT_LENGTH)
	useJsonSchema: false, // Default to simple JSON mode for better generation
	useStreamingMode: true, // Default to streaming markdown mode
	
	// Server Settings
	defaultPort: 8765,
	serverStartTimeout: 45000, // 45 seconds
	stopServerOnQuit: false, // Don't stop server by default when quitting
	
	// Output Settings
	defaultOutputFormat: 'stl',
	keepWorkingDirectory: false,
	
	// Debug Settings
	debugLogging: false, // Default to no debug logs
	
	// Conversation Management (for future interactive features)
	keepFirstPrompt: true,
	keepLatestExplanation: true,
	maxHistoryMessages: 10,
};

let currentConfig: C3DConfig = { ...defaultConfig };

export function getConfig(): C3DConfig {
	return currentConfig;
}

export function updateConfig(updates: Partial<C3DConfig>): void {
	currentConfig = { ...currentConfig, ...updates };
}

export function resetConfig(): void {
	currentConfig = { ...defaultConfig };
}