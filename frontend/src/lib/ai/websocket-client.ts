/**
 * WebSocket AI Client for Real-time Communication
 * Handles streaming AI responses and real-time chat functionality
 */

import { ChUseAWebSocketClient, createDefaultConfig } from '@/lib/websocket/client';
import { WebSocketMessage, WebSocketEventHandlers } from '@/lib/websocket/types';
import { SlashCommandResult, SlashCommandContext, slashCommandParser } from './slash-commands';

export interface AIWebSocketMessage extends WebSocketMessage {
  type: 'ai_request' | 'ai_response' | 'ai_stream' | 'ai_error' | 'ai_complete' | 'ai_cancel';
  data: any;
}

export interface AIStreamChunk {
  id: string;
  content: string;
  isComplete: boolean;
  metadata?: {
    model?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    command?: string;
    progress?: number;
  };
}

export interface AIRequest {
  id: string;
  type: 'chat' | 'command' | 'completion';
  content: string;
  context?: SlashCommandContext;
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    system_prompt?: string;
  };
  metadata?: Record<string, any>;
}

export interface AIResponse {
  id: string;
  request_id: string;
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  error?: string;
  metadata?: {
    model?: string;
    usage?: any;
    command?: string;
    execution_time?: number;
  };
}

export interface AIConnectionState {
  isConnected: boolean;
  isProcessing: boolean;
  activeRequests: Map<string, AIRequest>;
  lastError?: string;
  modelStatus?: {
    available: boolean;
    current_model: string;
    supported_models: string[];
  };
}

export class AIWebSocketClient {
  private wsClient: ChUseAWebSocketClient;
  private state: AIConnectionState;
  private eventHandlers: Map<string, Function[]> = new Map();
  private pendingRequests: Map<string, {
    resolve: (value: AIResponse) => void;
    reject: (error: Error) => void;
    onStream?: (chunk: AIStreamChunk) => void;
    timeout?: NodeJS.Timeout;
  }> = new Map();

  constructor(url: string, options: { userId?: string; sessionId?: string } = {}) {
    this.state = {
      isConnected: false,
      isProcessing: false,
      activeRequests: new Map(),
    };

    // Configure WebSocket client
    const config = createDefaultConfig(url);
    config.protocols = ['ai-chat'];
    
    const eventHandlers: WebSocketEventHandlers = {
      onOpen: () => {
        this.state.isConnected = true;
        this.emit('connection_changed', this.state);
        this.emit('connected');
      },
      onClose: () => {
        this.state.isConnected = false;
        this.emit('connection_changed', this.state);
        this.emit('disconnected');
        // Reject all pending requests
        this.pendingRequests.forEach(({ reject }) => {
          reject(new Error('WebSocket connection closed'));
        });
        this.pendingRequests.clear();
      },
      onError: (error) => {
        this.state.lastError = 'WebSocket connection error';
        this.emit('error', error);
      },
      onMessage: (message) => {
        this.handleMessage(message as AIWebSocketMessage);
      }
    };

    this.wsClient = new ChUseAWebSocketClient(config, eventHandlers);
  }

  /**
   * Connect to AI WebSocket server
   */
  async connect(): Promise<void> {
    await this.wsClient.connect();
  }

  /**
   * Disconnect from AI WebSocket server
   */
  disconnect(): void {
    this.wsClient.disconnect();
  }

  /**
   * Send a chat message to AI
   */
  async sendChatMessage(
    message: string,
    context?: SlashCommandContext,
    options?: {
      onStream?: (chunk: AIStreamChunk) => void;
      model?: string;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateId(),
      type: 'chat',
      content: message,
      context,
      options: {
        stream: !!options?.onStream,
        model: options?.model || 'gpt-4o-mini',
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 1000,
      }
    };

    return this.sendRequest(request, options?.onStream);
  }

  /**
   * Execute a slash command
   */
  async executeCommand(
    command: string,
    context: SlashCommandContext,
    options?: {
      onStream?: (chunk: AIStreamChunk) => void;
      onProgress?: (progress: number) => void;
    }
  ): Promise<SlashCommandResult> {
    // Parse the command
    const parsed = slashCommandParser.parse(command);
    
    if (!parsed.isValid) {
      return {
        success: false,
        error: `Command parse error: ${parsed.errors.join(', ')}`,
        showInChat: true,
        chatMessage: `❌ Error: ${parsed.errors.join(', ')}`
      };
    }

    // Validate context
    if (parsed.matchedCommand) {
      const contextValidation = slashCommandParser.validateContext(parsed.matchedCommand, context);
      if (!contextValidation.isValid) {
        return {
          success: false,
          error: contextValidation.errors.join(', '),
          showInChat: true,
          chatMessage: `❌ Error: ${contextValidation.errors.join(', ')}`
        };
      }
    }

    // Handle help command locally
    if (parsed.command === 'help') {
      const helpContent = parsed.args.command 
        ? this.getCommandHelp(parsed.args.command)
        : this.getAllCommandsHelp();
      
      return {
        success: true,
        showInChat: true,
        chatMessage: helpContent
      };
    }

    // Send command to AI
    const request: AIRequest = {
      id: this.generateId(),
      type: 'command',
      content: command,
      context,
      options: {
        stream: !!options?.onStream,
        model: 'gpt-4o-mini',
        temperature: 0.3, // Lower temperature for commands
        max_tokens: 2000,
      },
      metadata: {
        command: parsed.command,
        args: parsed.args,
        requiresSelection: parsed.matchedCommand?.requiresSelection || false
      }
    };

    try {
      const response = await this.sendRequest(request, options?.onStream);
      
      return {
        success: true,
        data: response,
        shouldReplaceSelection: parsed.matchedCommand?.requiresSelection && !!context.selectedText,
        shouldInsertText: !parsed.matchedCommand?.requiresSelection,
        insertText: response.content,
        replaceText: response.content,
        showInChat: true,
        chatMessage: `✅ ${parsed.matchedCommand?.name || 'Command'} completed`,
        metadata: response.metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        showInChat: true,
        chatMessage: `❌ Error executing command: ${error.message}`
      };
    }
  }

  /**
   * Get text completion suggestions
   */
  async getCompletion(
    text: string,
    context: SlashCommandContext,
    options?: {
      maxSuggestions?: number;
      onStream?: (chunk: AIStreamChunk) => void;
    }
  ): Promise<string[]> {
    const request: AIRequest = {
      id: this.generateId(),
      type: 'completion',
      content: text,
      context,
      options: {
        stream: !!options?.onStream,
        model: 'gpt-4o-mini',
        temperature: 0.8,
        max_tokens: 100,
      },
      metadata: {
        max_suggestions: options?.maxSuggestions || 3,
        completion_mode: true
      }
    };

    try {
      const response = await this.sendRequest(request, options?.onStream);
      // Parse completions from response
      const completions = response.content.split('\n').filter(line => line.trim().length > 0);
      return completions.slice(0, options?.maxSuggestions || 3);
    } catch (error) {
      console.error('Completion error:', error);
      return [];
    }
  }

  /**
   * Cancel an active request
   */
  cancelRequest(requestId: string): void {
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      if (pending.timeout) {
        clearTimeout(pending.timeout);
      }
      pending.reject(new Error('Request cancelled'));
      this.pendingRequests.delete(requestId);
    }

    // Send cancel message to server
    this.wsClient.sendMessage({
      type: 'ai_cancel',
      data: { request_id: requestId },
      timestamp: Date.now(),
      id: this.generateId()
    });

    // Update state
    this.state.activeRequests.delete(requestId);
    this.state.isProcessing = this.state.activeRequests.size > 0;
    this.emit('request_cancelled', requestId);
  }

  /**
   * Get current connection state
   */
  getState(): AIConnectionState {
    return { ...this.state };
  }

  /**
   * Add event listener
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }
  }

  /**
   * Send request and handle response
   */
  private async sendRequest(
    request: AIRequest,
    onStream?: (chunk: AIStreamChunk) => void
  ): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      // Add to active requests
      this.state.activeRequests.set(request.id, request);
      this.state.isProcessing = true;

      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        this.state.activeRequests.delete(request.id);
        this.state.isProcessing = this.state.activeRequests.size > 0;
        reject(new Error('Request timeout'));
      }, 30000); // 30 second timeout

      // Store pending request
      this.pendingRequests.set(request.id, {
        resolve,
        reject,
        onStream,
        timeout
      });

      // Send request
      const success = this.wsClient.sendMessage({
        type: 'ai_request',
        data: request,
        timestamp: Date.now(),
        id: this.generateId()
      });

      if (!success) {
        clearTimeout(timeout);
        this.pendingRequests.delete(request.id);
        this.state.activeRequests.delete(request.id);
        this.state.isProcessing = this.state.activeRequests.size > 0;
        reject(new Error('Failed to send request'));
      }

      this.emit('request_sent', request);
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: AIWebSocketMessage): void {
    switch (message.type) {
      case 'ai_response':
        this.handleAIResponse(message.data);
        break;
      case 'ai_stream':
        this.handleAIStream(message.data);
        break;
      case 'ai_complete':
        this.handleAIComplete(message.data);
        break;
      case 'ai_error':
        this.handleAIError(message.data);
        break;
      default:
        console.warn('Unknown AI message type:', message.type);
    }
  }

  /**
   * Handle AI response
   */
  private handleAIResponse(data: AIResponse): void {
    const pending = this.pendingRequests.get(data.request_id);
    if (pending) {
      if (data.isComplete) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(data.request_id);
        this.state.activeRequests.delete(data.request_id);
        this.state.isProcessing = this.state.activeRequests.size > 0;
        pending.resolve(data);
      }
    }
    this.emit('ai_response', data);
  }

  /**
   * Handle AI stream chunk
   */
  private handleAIStream(data: AIStreamChunk): void {
    const pending = this.pendingRequests.get(data.id);
    if (pending && pending.onStream) {
      pending.onStream(data);
    }
    this.emit('ai_stream', data);
  }

  /**
   * Handle AI completion
   */
  private handleAIComplete(data: { request_id: string; final_response: AIResponse }): void {
    const pending = this.pendingRequests.get(data.request_id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(data.request_id);
      this.state.activeRequests.delete(data.request_id);
      this.state.isProcessing = this.state.activeRequests.size > 0;
      pending.resolve(data.final_response);
    }
    this.emit('ai_complete', data);
  }

  /**
   * Handle AI error
   */
  private handleAIError(data: { request_id: string; error: string }): void {
    const pending = this.pendingRequests.get(data.request_id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(data.request_id);
      this.state.activeRequests.delete(data.request_id);
      this.state.isProcessing = this.state.activeRequests.size > 0;
      pending.reject(new Error(data.error));
    }
    this.emit('ai_error', data);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get help for a specific command
   */
  private getCommandHelp(commandName: string): string {
    const command = slashCommandParser.getCommand(commandName);
    if (!command) {
      return `❌ Unknown command: ${commandName}`;
    }

    let help = `## /${command.name}\n\n`;
    help += `${command.description}\n\n`;
    help += `**Usage:** ${command.usage}\n\n`;
    
    if (command.parameters.length > 0) {
      help += '**Parameters:**\n';
      command.parameters.forEach(param => {
        help += `• **${param.name}** (${param.type}${param.required ? ', required' : ', optional'}): ${param.description}\n`;
        if (param.options) {
          help += `  Options: ${param.options.map(opt => opt.label).join(', ')}\n`;
        }
      });
      help += '\n';
    }

    if (command.aliases.length > 1) {
      help += `**Aliases:** ${command.aliases.join(', ')}\n`;
    }

    return help;
  }

  /**
   * Get help for all commands
   */
  private getAllCommandsHelp(): string {
    let help = '# Available AI Commands\n\n';
    help += 'Use these commands to interact with the AI assistant:\n\n';

    const categories = {
      'Writing': ['rewrite', 'expand'],
      'Editing': ['improve', 'grammar'],
      'Analysis': ['summarize', 'analyze'],
      'Translation': ['translate'],
      'Research': ['cite'],
      'Formatting': ['format'],
      'Other': ['help']
    };

    Object.entries(categories).forEach(([category, commands]) => {
      help += `## ${category}\n\n`;
      commands.forEach(cmdName => {
        const command = slashCommandParser.getCommand(cmdName);
        if (command) {
          help += `• **/${command.name}** - ${command.description}\n`;
        }
      });
      help += '\n';
    });

    help += 'Use `/help [command]` to get detailed help for a specific command.\n\n';
    help += '💡 **Tip:** Select text before using commands like /rewrite, /expand, /improve, etc.';

    return help;
  }

  /**
   * Destroy the client
   */
  destroy(): void {
    // Cancel all pending requests
    this.pendingRequests.forEach(({ reject, timeout }) => {
      if (timeout) clearTimeout(timeout);
      reject(new Error('Client destroyed'));
    });
    this.pendingRequests.clear();

    // Clear state
    this.state.activeRequests.clear();
    this.state.isProcessing = false;
    this.eventHandlers.clear();

    // Destroy WebSocket client
    this.wsClient.destroy();
  }
}

// Factory function
export const createAIWebSocketClient = (
  url: string = '/api/chat/ws',
  options: { userId?: string; sessionId?: string } = {}
): AIWebSocketClient => {
  return new AIWebSocketClient(url, options);
};