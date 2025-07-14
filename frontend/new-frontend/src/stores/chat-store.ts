/**
 * Chat Store - AI Chat Interface State Management
 * Handles chat sessions, messages, WebSocket integration, and slash commands
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';
import { 
  ChatMessage, 
  ChatSession, 
  ChatState, 
  TypingIndicator, 
  SlashCommand,
  ChatCommandContext 
} from '@/types/chat';
import { useWebSocket } from '@/lib/websocket/hooks';
import { useAuthStore } from './auth-store';
import { useWorkflowStore } from './workflow-store';

// Chat store interface
export interface ChatStoreState extends ChatState {
  // Actions
  createSession: (title?: string, workflowId?: string, documentId?: string) => ChatSession;
  setCurrentSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessions: () => void;
  
  // Message actions
  sendMessage: (content: string, type?: 'text' | 'command') => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
  
  // Real-time actions
  setTyping: (isTyping: boolean) => void;
  updateTypingUsers: (indicators: TypingIndicator[]) => void;
  
  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => void;
  setConnectionStatus: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  
  // Command actions
  executeCommand: (command: string, args: string[]) => Promise<void>;
  registerCommand: (command: SlashCommand) => void;
  getAvailableCommands: () => SlashCommand[];
  
  // Utils
  markAsRead: (sessionId?: string) => void;
  getUnreadCount: () => number;
  searchMessages: (query: string, sessionId?: string) => ChatMessage[];
}

// Built-in slash commands
const defaultCommands: SlashCommand[] = [
  {
    name: 'help',
    description: 'Show available commands',
    usage: '/help [command]',
    category: 'system',
    execute: async (args, context) => {
      const commands = useChatStore.getState().getAvailableCommands();
      const helpText = args.length > 0 
        ? commands.find(cmd => cmd.name === args[0])?.description || `Command "${args[0]}" not found`
        : commands.map(cmd => `/${cmd.name} - ${cmd.description}`).join('\n');
      
      const helpMessage: ChatMessage = {
        id: `help-${Date.now()}`,
        role: 'system',
        content: helpText,
        timestamp: Date.now(),
        status: 'delivered',
        metadata: { type: 'command' }
      };
      
      context.sendMessage(helpMessage);
    }
  },
  {
    name: 'clear',
    description: 'Clear current chat session',
    usage: '/clear',
    category: 'system',
    execute: async (args, context) => {
      const store = useChatStore.getState();
      if (store.currentSession) {
        store.currentSession.messages = [];
        store.addMessage({
          id: `cleared-${Date.now()}`,
          role: 'system',
          content: 'Chat cleared',
          timestamp: Date.now(),
          status: 'delivered',
          metadata: { type: 'command' }
        });
      }
    }
  },
  {
    name: 'workflow',
    description: 'Start or manage a workflow',
    usage: '/workflow [start|stop|status] [workflow-type]',
    category: 'workflow',
    execute: async (args, context) => {
      const [action, workflowType] = args;
      const workflowStore = useWorkflowStore.getState();
      
      switch (action) {
        case 'start':
          if (workflowType) {
            try {
              await context.triggerWorkflow(workflowType, {});
              context.sendMessage({
                id: `workflow-started-${Date.now()}`,
                role: 'system',
                content: `Started ${workflowType} workflow`,
                timestamp: Date.now(),
                status: 'delivered',
                metadata: { type: 'workflow', workflowId: workflowStore.currentWorkflow?.id }
              });
            } catch (error) {
              context.sendMessage({
                id: `workflow-error-${Date.now()}`,
                role: 'system',
                content: `Failed to start workflow: ${error}`,
                timestamp: Date.now(),
                status: 'delivered',
                metadata: { type: 'error' }
              });
            }
          }
          break;
        case 'status':
          const currentWorkflow = workflowStore.currentWorkflow;
          const statusMessage = currentWorkflow 
            ? `Current workflow: ${currentWorkflow.type} (${currentWorkflow.status})`
            : 'No active workflow';
          
          context.sendMessage({
            id: `workflow-status-${Date.now()}`,
            role: 'system',
            content: statusMessage,
            timestamp: Date.now(),
            status: 'delivered',
            metadata: { type: 'workflow' }
          });
          break;
        default:
          context.sendMessage({
            id: `workflow-help-${Date.now()}`,
            role: 'system',
            content: 'Usage: /workflow [start|stop|status] [workflow-type]',
            timestamp: Date.now(),
            status: 'delivered',
            metadata: { type: 'command' }
          });
      }
    }
  }
];

// Initial state
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isConnected: false,
  isLoading: false,
  error: null,
  typingUsers: [],
  unreadCount: 0,
};

// Create the chat store
export const useChatStore = create<ChatStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        commands: defaultCommands,

        createSession: (title, workflowId, documentId) => {
          const newSession: ChatSession = {
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title || `Chat ${new Date().toLocaleTimeString()}`,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: false,
            workflowId,
            documentId,
          };

          set(state => ({
            sessions: [...state.sessions, newSession],
            currentSession: newSession,
          }));

          return newSession;
        },

        setCurrentSession: (sessionId) => {
          const session = get().sessions.find(s => s.id === sessionId);
          if (session) {
            set(state => ({
              currentSession: session,
              sessions: state.sessions.map(s => ({
                ...s,
                isActive: s.id === sessionId
              }))
            }));
          }
        },

        deleteSession: (sessionId) => {
          set(state => ({
            sessions: state.sessions.filter(s => s.id !== sessionId),
            currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
          }));
        },

        clearSessions: () => {
          set({ sessions: [], currentSession: null });
        },

        sendMessage: async (content, type = 'text') => {
          const { currentSession, addMessage, updateMessage, setError } = get();
          if (!currentSession) return;

          const { user } = useAuthStore.getState();
          if (!user) return;

          // Check if it's a command
          if (content.startsWith('/')) {
            const [command, ...args] = content.slice(1).split(' ');
            await get().executeCommand(command, args);
            return;
          }

          const userMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'user',
            content,
            timestamp: Date.now(),
            status: 'sending',
            metadata: { type }
          };

          addMessage(userMessage);

          try {
            // Send to AI service using modern streaming API
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: [
                  ...currentSession.messages
                    .filter(msg => msg.role !== 'system') // Exclude system messages from API call
                    .map(msg => ({
                      role: msg.role,
                      content: msg.content,
                    })),
                  {
                    role: 'user',
                    content,
                  },
                ],
                model: 'gpt-4o-mini',
                stream: true,
                workflowContext: currentSession.workflowId ? {
                  workflowId: currentSession.workflowId,
                } : undefined,
                documentContext: currentSession.documentId ? {
                  documentId: currentSession.documentId,
                } : undefined,
                userRole: user.role,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Update user message status
            updateMessage(userMessage.id, { status: 'sent' });

            // Create assistant message for streaming response
            const assistantMessage: ChatMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
              status: 'sending',
              metadata: { type: 'text' }
            };

            addMessage(assistantMessage);

            // Handle response (demo mode uses JSON, real mode could use streaming)
            const data = await response.json();
            
            if (data.message) {
              updateMessage(assistantMessage.id, {
                content: data.message.content,
                status: 'delivered',
                metadata: {
                  ...assistantMessage.metadata,
                  demo: data.demo || false,
                  usage: data.usage,
                },
              });
              
              // Add demo notice if in demo mode
              if (data.demo) {
                setTimeout(() => {
                  addMessage({
                    id: `demo-notice-${Date.now()}`,
                    role: 'system',
                    content: '💡 Demo mode active. Add API keys to .env.local for full AI functionality.',
                    timestamp: Date.now(),
                    status: 'delivered',
                    metadata: { type: 'system' },
                  });
                }, 500);
              }
            } else {
              throw new Error('Invalid response format');
            }

          } catch (error) {
            console.error('Send message error:', error);
            updateMessage(userMessage.id, { status: 'failed' });
            setError(error instanceof Error ? error.message : 'Failed to send message');
          }
        },

        addMessage: (message) => {
          set(state => {
            const session = state.currentSession;
            if (!session) return state;

            const updatedSession = {
              ...session,
              messages: [...session.messages, message],
              updatedAt: Date.now(),
            };

            return {
              currentSession: updatedSession,
              sessions: state.sessions.map(s => 
                s.id === session.id ? updatedSession : s
              ),
            };
          });
        },

        updateMessage: (messageId, updates) => {
          set(state => {
            const session = state.currentSession;
            if (!session) return state;

            const updatedSession = {
              ...session,
              messages: session.messages.map(msg =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: Date.now(),
            };

            return {
              currentSession: updatedSession,
              sessions: state.sessions.map(s => 
                s.id === session.id ? updatedSession : s
              ),
            };
          });
        },

        deleteMessage: (messageId) => {
          set(state => {
            const session = state.currentSession;
            if (!session) return state;

            const updatedSession = {
              ...session,
              messages: session.messages.filter(msg => msg.id !== messageId),
              updatedAt: Date.now(),
            };

            return {
              currentSession: updatedSession,
              sessions: state.sessions.map(s => 
                s.id === session.id ? updatedSession : s
              ),
            };
          });
        },

        retryMessage: async (messageId) => {
          const { currentSession, updateMessage } = get();
          if (!currentSession) return;

          const message = currentSession.messages.find(m => m.id === messageId);
          if (!message || message.role !== 'user') return;

          updateMessage(messageId, { status: 'sending' });
          
          try {
            // Retry sending the message
            await get().sendMessage(message.content, message.metadata?.type as any);
          } catch (error) {
            updateMessage(messageId, { status: 'failed' });
          }
        },

        setTyping: (isTyping) => {
          // TODO: Send typing indicator via WebSocket
        },

        updateTypingUsers: (indicators) => {
          set({ typingUsers: indicators });
        },

        connect: async () => {
          set({ isLoading: true, error: null });
          try {
            // Test API connectivity
            const response = await fetch('/api/chat', {
              method: 'GET',
            });
            
            if (response.ok) {
              set({ isConnected: true, isLoading: false });
            } else {
              throw new Error('API not reachable');
            }
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Connection failed' 
            });
          }
        },

        disconnect: () => {
          set({ isConnected: false });
        },

        setConnectionStatus: (isConnected) => {
          set({ isConnected });
        },

        setError: (error) => {
          set({ error });
        },

        executeCommand: async (command, args) => {
          const commands = get().getAvailableCommands();
          const cmd = commands.find(c => c.name === command);
          
          if (!cmd) {
            get().addMessage({
              id: `unknown-cmd-${Date.now()}`,
              role: 'system',
              content: `Unknown command: /${command}. Type /help for available commands.`,
              timestamp: Date.now(),
              status: 'delivered',
              metadata: { type: 'error' }
            });
            return;
          }

          const { currentSession } = get();
          const { user } = useAuthStore.getState();
          
          if (!currentSession || !user) return;

          const context: ChatCommandContext = {
            sessionId: currentSession.id,
            userId: user.id,
            workflowId: currentSession.workflowId,
            documentId: currentSession.documentId,
            sendMessage: get().addMessage,
            triggerWorkflow: async (workflowType, params) => {
              const workflowStore = useWorkflowStore.getState();
              // TODO: Implement workflow triggering
            }
          };

          try {
            await cmd.execute(args, context);
          } catch (error) {
            get().addMessage({
              id: `cmd-error-${Date.now()}`,
              role: 'system',
              content: `Command failed: ${error}`,
              timestamp: Date.now(),
              status: 'delivered',
              metadata: { type: 'error' }
            });
          }
        },

        registerCommand: (command) => {
          // TODO: Add to commands array
        },

        getAvailableCommands: () => {
          return defaultCommands;
        },

        markAsRead: (sessionId) => {
          if (sessionId) {
            // Mark specific session as read
            set(state => ({
              sessions: state.sessions.map(s => 
                s.id === sessionId ? { ...s, unreadCount: 0 } : s
              )
            }));
          } else {
            // Mark all as read
            set({ unreadCount: 0 });
          }
        },

        getUnreadCount: () => {
          return get().unreadCount;
        },

        searchMessages: (query, sessionId) => {
          const { sessions, currentSession } = get();
          const targetSession = sessionId 
            ? sessions.find(s => s.id === sessionId)
            : currentSession;
          
          if (!targetSession) return [];

          return targetSession.messages.filter(msg =>
            msg.content.toLowerCase().includes(query.toLowerCase())
          );
        },
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          sessions: state.sessions,
          currentSession: state.currentSession,
        }),
      }
    ),
    {
      name: 'chat-store',
    }
  )
);

// Selectors for common use cases
export const useChat = () => useChatStore((state) => ({
  currentSession: state.currentSession,
  sessions: state.sessions,
  isConnected: state.isConnected,
  isLoading: state.isLoading,
  error: state.error,
  typingUsers: state.typingUsers,
}));

export const useChatActions = () => useChatStore((state) => ({
  createSession: state.createSession,
  setCurrentSession: state.setCurrentSession,
  sendMessage: state.sendMessage,
  connect: state.connect,
  disconnect: state.disconnect,
  executeCommand: state.executeCommand,
}));

export const useChatMessages = () => useChatStore((state) => ({
  messages: state.currentSession?.messages || [],
  addMessage: state.addMessage,
  updateMessage: state.updateMessage,
  deleteMessage: state.deleteMessage,
  retryMessage: state.retryMessage,
}));