/**
 * Chat Interface Types
 * Defines types for AI chat components, messages, and WebSocket integration
 */

import { WebSocketMessage } from '@/lib/websocket/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  metadata?: {
    type?: 'text' | 'workflow' | 'command' | 'error';
    workflowId?: string;
    stepId?: string;
    commandType?: string;
    references?: string[];
    attachments?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  workflowId?: string;
  documentId?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: number;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

export interface ChatCommand {
  command: string;
  description: string;
  usage: string;
  category: 'workflow' | 'document' | 'general';
  handler: (args: string[]) => Promise<void>;
}

export interface ChatOptions {
  enableWorkflows: boolean;
  enableCommands: boolean;
  enableFileUploads: boolean;
  enableRealTimeCollaboration: boolean;
  maxMessageLength: number;
  autoScrollEnabled: boolean;
  showTypingIndicators: boolean;
}

export interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  typingUsers: TypingIndicator[];
  unreadCount: number;
}

export interface ChatWebSocketMessage extends WebSocketMessage {
  type: 'chat_message' | 'chat_typing' | 'chat_user_joined' | 'chat_user_left' | 'workflow_update' | 'workflow_step_change' | 'workflow_progress' | 'workflow_command' | 'system_message' | 'error';
  data: {
    chatMessage?: ChatMessage;
    sessionId?: string;
    typing?: TypingIndicator;
    command?: {
      type: string;
      payload: unknown;
    };
    workflow?: {
      id: string;
      status: string;
      step?: {
        id: string;
        name: string;
      };
    };
    error?: {
      message: string;
    };
    workflowId?: string;
  };
}

export interface SlashCommand {
  name: string;
  description: string;
  usage: string;
  category: 'workflow' | 'document' | 'ai' | 'system';
  execute: (args: string[], context: ChatCommandContext) => Promise<ChatMessage | void>;
}

export interface ChatCommandContext {
  sessionId: string;
  userId: string;
  workflowId?: string;
  documentId?: string;
  sendMessage: (message: ChatMessage) => void;
  triggerWorkflow: (workflowType: string, params: any) => Promise<void>;
}

// Assistant-UI integration types
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'ui';
    text?: string;
    ui?: React.ReactNode;
  }>;
  createdAt?: Date;
}

export interface ChatTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  message: {
    user: {
      background: string;
      text: string;
    };
    assistant: {
      background: string;
      text: string;
    };
    system: {
      background: string;
      text: string;
    };
  };
}

export interface ChatMetrics {
  messagesPerSession: number;
  averageResponseTime: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  commandsUsed: number;
  sessionDuration: number;
}