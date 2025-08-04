import { getConfig } from './c3d.config.js';

export interface Message {
	id: string;
	role: 'user' | 'description_agent' | 'code_agent' | 'system';
	content: string;
	timestamp: Date;
	type?: 'question' | 'response' | 'code' | 'error';
	metadata?: {
		isFirstPrompt?: boolean;
		isLatestExplanation?: boolean;
		attemptNumber?: number;
		error?: string;
	};
}

export interface ConversationState {
	messages: Message[];
	firstPrompt?: Message;
	latestExplanation?: Message;
	currentTurn: 'user' | 'description_agent' | 'code_agent';
}

export class ConversationManager {
	private state: ConversationState;
	private messageIdCounter: number = 0;

	constructor() {
		this.state = {
			messages: [],
			currentTurn: 'user',
		};
	}

	addMessage(role: Message['role'], content: string, type?: Message['type'], metadata?: Message['metadata']): Message {
		const message: Message = {
			id: `msg_${++this.messageIdCounter}`,
			role,
			content,
			timestamp: new Date(),
			type,
			metadata,
		};

		// Handle special messages
		if (metadata?.isFirstPrompt) {
			this.state.firstPrompt = message;
		}
		if (metadata?.isLatestExplanation) {
			this.state.latestExplanation = message;
		}

		this.state.messages.push(message);
		this.trimHistory();
		
		return message;
	}

	addUserMessage(content: string): Message {
		return this.addMessage('user', content, 'response');
	}

	addDescriptionAgentMessage(content: string, isExplanation: boolean = false): Message {
		return this.addMessage('description_agent', content, 'response', {
			isLatestExplanation: isExplanation
		});
	}

	addDescriptionAgentQuestion(content: string): Message {
		this.state.currentTurn = 'user';
		return this.addMessage('description_agent', content, 'question');
	}

	addCodeAgentMessage(content: string): Message {
		return this.addMessage('code_agent', content, 'code');
	}

	addCodeAgentQuestion(content: string): Message {
		this.state.currentTurn = 'description_agent';
		return this.addMessage('code_agent', content, 'question');
	}

	addCodeAgentError(content: string, error: string, attemptNumber: number): Message {
		return this.addMessage('code_agent', content, 'error', {
			error,
			attemptNumber
		});
	}

	addFirstPrompt(content: string): Message {
		return this.addMessage('user', content, 'response', { isFirstPrompt: true });
	}

	getMessages(): Message[] {
		return [...this.state.messages];
	}

	getCurrentTurn(): ConversationState['currentTurn'] {
		return this.state.currentTurn;
	}

	setCurrentTurn(turn: ConversationState['currentTurn']): void {
		this.state.currentTurn = turn;
	}

	getContextForAgent(_agentRole: 'description_agent' | 'code_agent'): Message[] {
		const config = getConfig();
		const contextMessages: Message[] = [];

		// Always include first prompt if it exists
		if (config.keepFirstPrompt && this.state.firstPrompt) {
			contextMessages.push(this.state.firstPrompt);
		}

		// Always include latest explanation if it exists
		if (config.keepLatestExplanation && this.state.latestExplanation) {
			contextMessages.push(this.state.latestExplanation);
		}

		// Add recent conversation history (excluding already added messages)
		const recentMessages = this.state.messages
			.slice(-config.maxHistoryMessages)
			.filter(msg => 
				(!config.keepFirstPrompt || msg.id !== this.state.firstPrompt?.id) &&
				(!config.keepLatestExplanation || msg.id !== this.state.latestExplanation?.id)
			);

		contextMessages.push(...recentMessages);

		// Sort by timestamp to maintain chronological order
		return contextMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	}

	getConversationSummary(): string {
		const messages = this.getMessages();
		if (messages.length === 0) return 'No conversation yet.';

		let summary = 'Conversation Summary:\n';
		messages.forEach((msg, index) => {
			const roleIcon = {
				user: '👤',
				description_agent: '📝',
				code_agent: '💻',
				system: '🔧'
			}[msg.role];
			
			const typeIcon = msg.type ? {
				question: '❓',
				response: '💬',
				code: '📄',
				error: '❌'
			}[msg.type] : '';

			summary += `${index + 1}. ${roleIcon} ${msg.role.toUpperCase()}${typeIcon ? ` ${typeIcon}` : ''}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
		});

		return summary;
	}

	private trimHistory(): void {
		const config = getConfig();
		
		// Don't trim if we're under the limit
		if (this.state.messages.length <= config.maxHistoryMessages) {
			return;
		}

		// Create a set of protected message IDs
		const protectedIds = new Set<string>();
		if (config.keepFirstPrompt && this.state.firstPrompt) {
			protectedIds.add(this.state.firstPrompt.id);
		}
		if (config.keepLatestExplanation && this.state.latestExplanation) {
			protectedIds.add(this.state.latestExplanation.id);
		}

		// Separate protected and non-protected messages
		const protectedMessages = this.state.messages.filter(msg => protectedIds.has(msg.id));
		const nonProtectedMessages = this.state.messages.filter(msg => !protectedIds.has(msg.id));

		// Keep only the most recent non-protected messages
		const maxNonProtected = config.maxHistoryMessages - protectedMessages.length;
		const trimmedNonProtected = nonProtectedMessages.slice(-maxNonProtected);

		// Combine and sort by timestamp
		this.state.messages = [...protectedMessages, ...trimmedNonProtected]
			.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	}

	reset(): void {
		this.state = {
			messages: [],
			currentTurn: 'user',
		};
		this.messageIdCounter = 0;
	}

	exportConversation(): ConversationState {
		return JSON.parse(JSON.stringify(this.state));
	}

	importConversation(state: ConversationState): void {
		this.state = state;
		// Update counter to avoid ID conflicts
		this.messageIdCounter = Math.max(
			...this.state.messages.map(msg => parseInt(msg.id.replace('msg_', '')) || 0),
			0
		);
	}
}