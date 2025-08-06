import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

export interface C3DConfig {
	// AI Generation Settings
	maxRetries: number;
	ollamaModel: string;
	ollamaHost: string;
	temperature: number;
	maxTokens: number;
	useJsonSchema: boolean; // Whether to use strict JSON schema or simple JSON mode
	useStreamingMode: boolean; // Whether to use streaming markdown mode instead of JSON
	repromptWithError: boolean; // Whether to include the previous error in the next prompt
	thinking: boolean; // Whether to use structured thinking prompts for better reasoning
	promptMode: 'instructional' | 'completion' | 'thinking_instructional' | 'thinking_completion'; // Prompt style to use
	errorContextResetAfter: number; // Reset error context (fresh start) after this many consecutive errors
	
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
	maxRetries: 9,
	ollamaModel: 'joshuaokolo/C3Dv0',
	ollamaHost: 'http://127.0.0.1:11434',
	temperature: 1.0, // Recommended temperature for better creativity
	maxTokens: 32768, // Maximum tokens for LLM responses (match OLLAMA_CONTEXT_LENGTH)
	useJsonSchema: false, // Default to simple JSON mode for better generation
	useStreamingMode: true, // Default to streaming markdown mode
	repromptWithError: true, // Default to reprompting with the error context
	thinking: true, // Default to using structured thinking prompts
	promptMode: 'thinking_instructional', // Default to thinking instructional prompts
	errorContextResetAfter: 2, // Reset error context after 2 consecutive errors for fresh start
	
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

// Config file location
const CONFIG_DIR = join(homedir(), '.c3d');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

let currentConfig: C3DConfig = { ...defaultConfig };

// Load config from file on startup
function loadConfigFromFile(): C3DConfig {
	try {
		if (existsSync(CONFIG_FILE)) {
			const configData = readFileSync(CONFIG_FILE, 'utf8');
			const fileConfig = JSON.parse(configData);
			// Merge with defaults to ensure all properties exist
			return { ...defaultConfig, ...fileConfig };
		}
	} catch (error) {
		console.warn('Warning: Could not load config file, using defaults:', error);
	}
	return { ...defaultConfig };
}

// Save config to file
function saveConfigToFile(config: C3DConfig): void {
	try {
		// Ensure config directory exists
		if (!existsSync(CONFIG_DIR)) {
			mkdirSync(CONFIG_DIR, { recursive: true });
		}
		
		// Write config file
		writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
	} catch (error) {
		console.error('Error: Could not save config file:', error);
		throw error;
	}
}

// Initialize config by loading from file
currentConfig = loadConfigFromFile();

export function getConfig(): C3DConfig {
	return currentConfig;
}

export function updateConfig(updates: Partial<C3DConfig>): void {
	currentConfig = { ...currentConfig, ...updates };
	// Automatically save to file when config is updated
	saveConfigToFile(currentConfig);
}

export function resetConfig(): void {
	currentConfig = { ...defaultConfig };
	// Save the reset config to file
	saveConfigToFile(currentConfig);
}