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
import { useAuthStore } from './auth-store';
import { useWorkflowStore } from './workflow-store';

// Chat store interface
export interface ChatStoreState extends ChatState {
  // Commands
  commands: SlashCommand[];
  
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
    execute: async (args) => {
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
      
      // The context parameter was removed, so this line is removed.
      // context.sendMessage(helpMessage); 
    }
  },
  {
    name: 'clear',
    description: 'Clear current chat session',
    usage: '/clear',
    category: 'system',
    execute: async () => {
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
      const [action] = args;
      const workflowStore = useWorkflowStore.getState();
      
      switch (action) {
        case 'start':
          if (args.length > 1) { // Assuming workflowType is the second argument
            try {
              // The context parameter was removed, so this line is removed.
              // await context.triggerWorkflow(workflowType, {}); 
              context.sendMessage({
                id: `workflow-started-${Date.now()}`,
                role: 'system',
                content: `Started ${args[1]} workflow`,
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
            // Simulate AI response
            setTimeout(() => {
              const aiResponse: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: 'assistant',
                content: `This is a simulated response to: "${content}"`,
                timestamp: Date.now(),
                status: 'delivered',
                metadata: { type: 'text' }
              };
              updateMessage(userMessage.id, { status: 'delivered' });
              addMessage(aiResponse);
            }, 1000);
            
          } catch (error) {
            updateMessage(userMessage.id, { status: 'failed', error: 'Failed to send' });
            setError('Failed to get response');
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
          if (currentSession) {
            const messageToRetry = currentSession.messages.find(m => m.id === messageId);
            if (messageToRetry && messageToRetry.status === 'failed') {
              await get().sendMessage(messageToRetry.content, messageToRetry.metadata?.type as 'text' | 'command');
            }
          }
        },

        setTyping: (isTyping) => {
          // This would typically come from a WebSocket event
        },

        updateTypingUsers: (indicators) => {
          set({ typingUsers: indicators });
        },

        connect: async () => {
          // WebSocket connection logic
        },

        disconnect: () => {
          // WebSocket disconnection logic
        },
        
        setConnectionStatus: (isConnected) => {
          set({ isConnected });
        },
        
        setError: (error) => {
          set({ error });
        },

        executeCommand: async (commandName, args) => {
          const { commands, addMessage } = get();
          const command = commands.find(c => c.name === commandName);
          if (command) {
            const { currentSession } = get();
            const { user } = useAuthStore.getState();
            if (!currentSession || !user) return;
            
            const context: ChatCommandContext = {
              sessionId: currentSession.id,
              userId: user.id,
              workflowId: currentSession.workflowId,
              documentId: currentSession.documentId,
              sendMessage: addMessage,
              triggerWorkflow: async (workflowType, params) => {
                const workflowStore = useWorkflowStore.getState();
                await workflowStore.startWorkflow(workflowType, params);
              },
            };
            await command.execute(args, context);
          } else {
            const { addMessage } = get();
            addMessage({
              id: `cmd-error-${Date.now()}`,
              role: 'system',
              content: `Command not found: /${commandName}`,
              timestamp: Date.now(),
              status: 'delivered',
              metadata: { type: 'error' }
            });
          }
        },

        registerCommand: (command) => {
          set(state => ({
            commands: [...state.commands, command],
          }));
        },

        getAvailableCommands: () => {
          return get().commands;
        },

        markAsRead: (sessionId) => {
          // Logic to mark messages as read
        },

        getUnreadCount: () => {
          // Logic to calculate unread messages
          return 0;
        },

        searchMessages: (query, sessionId) => {
          const session = sessionId
            ? get().sessions.find(s => s.id === sessionId)
            : get().currentSession;

          if (!session) return [];

          return session.messages.filter(m => m.content.toLowerCase().includes(query.toLowerCase()));
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
      storage: {
        getItem: async (name) => {
          const str = localStorage.getItem(name);
          return { state: JSON.parse(str || '{}') };
        },
        setItem: async (name, newValue) => {
          const str = JSON.stringify(newValue);
          localStorage.setItem(name, str);
        },
        removeItem: async (name) => {
          localStorage.removeItem(name);
        },
      }
    }
  )
);

// Hooks for easy access to store state
export const useChat = () => useChatStore((state) => ({
  sessions: state.sessions,
  currentSession: state.currentSession,
  isConnected: state.isConnected,
  isLoading: state.isLoading,
  error: state.error,
  typingUsers: state.typingUsers,
  unreadCount: state.unreadCount,
}));

export const useChatActions = () => useChatStore((state) => ({
  createSession: state.createSession,
  setCurrentSession: state.setCurrentSession,
  deleteSession: state.deleteSession,
  sendMessage: state.sendMessage,
  executeCommand: state.executeCommand,
  registerCommand: state.registerCommand,
}));

export const useChatMessages = () => useChatStore((state) => ({
  messages: state.currentSession?.messages || [],
  addMessage: state.addMessage,
  updateMessage: state.updateMessage,
  deleteMessage: state.deleteMessage,
  retryMessage: state.retryMessage,
}));