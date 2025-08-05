export interface C3DConfig {
	// AI Generation Settings
	maxRetries: number;
	ollamaModel: string;
	ollamaHost: string;
	temperature: number;
	maxTokens: number;
	
	// Server Settings
	defaultPort: number;
	serverStartTimeout: number;
	stopServerOnQuit: boolean; // Whether pressing 'q' to quit should also stop the server
	
	// Output Settings
	defaultOutputFormat: string;
	keepWorkingDirectory: boolean;
	
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
	temperature: 0.9, // Low temperature for more deterministic output
	maxTokens: 32768, // Maximum tokens for LLM responses
	
	// Server Settings
	defaultPort: 8765,
	serverStartTimeout: 45000, // 45 seconds
	stopServerOnQuit: false, // Don't stop server by default when quitting
	
	// Output Settings
	defaultOutputFormat: 'stl',
	keepWorkingDirectory: false,
	
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