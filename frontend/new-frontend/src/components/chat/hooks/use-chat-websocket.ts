/**
 * Chat WebSocket Hook - Real-time messaging integration
 * Handles WebSocket connections for chat functionality with workflow integration
 */

import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/lib/websocket/hooks';
import { useChatStore, useChatActions } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { ChatMessage, ChatWebSocketMessage, TypingIndicator } from '@/types/chat';
import { WebSocketMessage, MessageFilter } from '@/lib/websocket/types';

interface UseChatWebSocketOptions {
  sessionId?: string;
  workflowId?: string;
  documentId?: string;
  enableTypingIndicators?: boolean;
  enableWorkflowUpdates?: boolean;
  onMessageReceived?: (message: ChatMessage) => void;
  onTypingChange?: (indicators: TypingIndicator[]) => void;
  onWorkflowUpdate?: (update: any) => void;
  onError?: (error: Error) => void;
}

export const useChatWebSocket = (options: UseChatWebSocketOptions = {}) => {
  const {
    sessionId,
    workflowId,
    documentId,
    enableTypingIndicators = true,
    enableWorkflowUpdates = true,
    onMessageReceived,
    onTypingChange,
    onWorkflowUpdate,
    onError,
  } = options;

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingRef = useRef<number>(0);

  const { user } = useAuthStore();
  const { addMessage, updateTypingUsers, setConnectionStatus, setError } = useChatActions();
  const { currentSession, isConnected } = useChatStore();
  const workflowStore = useWorkflowStore();

  // Message filter for chat-related messages
  const messageFilter: MessageFilter = {
    types: [
      'chat_message',
      'chat_typing',
      'chat_user_joined',
      'chat_user_left',
      'workflow_update',
      'workflow_step_change',
      'workflow_progress',
      'system_message',
      'error',
    ],
    sessionIds: sessionId ? [sessionId] : undefined,
    workflowIds: workflowId ? [workflowId] : undefined,
    documentIds: documentId ? [documentId] : undefined,
  };

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    try {
      const chatMessage = message as ChatWebSocketMessage;

      switch (message.type) {
        case 'chat_message':
          if (chatMessage.data.chatMessage) {
            addMessage(chatMessage.data.chatMessage);
            onMessageReceived?.(chatMessage.data.chatMessage);
          }
          break;

        case 'chat_typing':
          if (enableTypingIndicators && chatMessage.data.typing) {
            const typingIndicator = chatMessage.data.typing;
            updateTypingUsers([typingIndicator]);
            onTypingChange?.([typingIndicator]);
          }
          break;

        case 'workflow_update':
          if (enableWorkflowUpdates && chatMessage.data.workflow) {
            const workflowUpdate = chatMessage.data.workflow;
            
            // Update workflow store
            if (workflowStore.currentWorkflow?.id === workflowUpdate.id) {
              // Handle workflow status updates in the store
            }

            // Add workflow update message to chat
            const workflowMessage: ChatMessage = {
              id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              role: 'system',
              content: `Workflow ${workflowUpdate.status}: ${workflowUpdate.id}`,
              timestamp: Date.now(),
              status: 'delivered',
              metadata: {
                type: 'workflow',
                workflowId: workflowUpdate.id,
              },
            };

            addMessage(workflowMessage);
            onWorkflowUpdate?.(workflowUpdate);
          }
          break;

        case 'workflow_step_change':
          if (enableWorkflowUpdates && chatMessage.data.workflow?.step) {
            const stepMessage: ChatMessage = {
              id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              role: 'system',
              content: `Workflow step: ${chatMessage.data.workflow.step.name}`,
              timestamp: Date.now(),
              status: 'delivered',
              metadata: {
                type: 'workflow',
                workflowId: chatMessage.data.workflow.id,
                stepId: chatMessage.data.workflow.step.id,
              },
            };

            addMessage(stepMessage);
          }
          break;

        case 'system_message':
          if (chatMessage.data.chatMessage) {
            addMessage({
              ...chatMessage.data.chatMessage,
              role: 'system',
            });
          }
          break;

        case 'error':
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'system',
            content: `Error: ${message.data.error?.message || 'Unknown error'}`,
            timestamp: Date.now(),
            status: 'delivered',
            metadata: { type: 'error' },
          };

          addMessage(errorMessage);
          onError?.(new Error(message.data.error?.message || 'Unknown error'));
          break;

        default:
          console.log('Unhandled chat WebSocket message:', message);
      }
    } catch (error) {
      console.error('Error handling chat WebSocket message:', error);
      onError?.(error as Error);
    }
  }, [
    addMessage,
    updateTypingUsers,
    onMessageReceived,
    onTypingChange,
    onWorkflowUpdate,
    onError,
    enableTypingIndicators,
    enableWorkflowUpdates,
    workflowStore.currentWorkflow?.id,
  ]);

  // WebSocket connection
  const wsUrl = sessionId 
    ? `/api/chat/ws/${sessionId}`
    : workflowId 
      ? `/api/workflow/ws/${workflowId}`
      : documentId
        ? `/api/documents/ws/${documentId}`
        : '/api/chat/ws/general';

  const { sendMessage: sendWebSocketMessage, ...websocketProps } = useWebSocket(wsUrl, {
    enabled: !!user,
    filter: messageFilter,
    onMessage: handleWebSocketMessage,
    onError: (error) => {
      setError(error.message);
      setConnectionStatus(false);
      onError?.(error);
    },
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 10000,
    },
  });

  // Update connection status in chat store
  useEffect(() => {
    setConnectionStatus(websocketProps.isConnected);
  }, [websocketProps.isConnected, setConnectionStatus]);

  // Send chat message via WebSocket
  const sendChatMessage = useCallback(async (content: string, role: 'user' | 'assistant' = 'user') => {
    if (!user || !currentSession) return false;

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
      status: 'sending',
      metadata: { type: 'text' },
    };

    const websocketMessage: ChatWebSocketMessage = {
      type: 'chat_message',
      data: {
        chatMessage: message,
        sessionId: currentSession.id,
      },
      timestamp: Date.now(),
      id: `ws-${message.id}`,
    };

    const success = sendWebSocketMessage(websocketMessage);
    
    if (success) {
      // Optimistically add message to local state
      addMessage({ ...message, status: 'sent' });
    }

    return success;
  }, [user, currentSession, sendWebSocketMessage, addMessage]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!enableTypingIndicators || !user || !currentSession) return;

    const now = Date.now();
    
    // Debounce typing indicators (send at most every 2 seconds)
    if (isTyping && now - lastTypingRef.current < 2000) return;
    
    lastTypingRef.current = now;

    const typingMessage: ChatWebSocketMessage = {
      type: 'chat_typing',
      data: {
        typing: {
          userId: user.id,
          isTyping,
          timestamp: now,
        },
        sessionId: currentSession.id,
      },
      timestamp: now,
      id: `typing-${now}`,
    };

    sendWebSocketMessage(typingMessage);

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 3000);
    }
  }, [
    enableTypingIndicators,
    user,
    currentSession,
    sendWebSocketMessage,
  ]);

  // Send workflow command
  const sendWorkflowCommand = useCallback((command: string, params: any = {}) => {
    if (!enableWorkflowUpdates || !user || !currentSession) return false;

    const commandMessage: ChatWebSocketMessage = {
      type: 'workflow_command',
      data: {
        command: {
          type: command,
          payload: params,
        },
        sessionId: currentSession.id,
        workflowId: workflowId || currentSession.workflowId,
      },
      timestamp: Date.now(),
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return sendWebSocketMessage(commandMessage);
  }, [
    enableWorkflowUpdates,
    user,
    currentSession,
    workflowId,
    sendWebSocketMessage,
  ]);

  // Join chat session
  const joinSession = useCallback((targetSessionId: string) => {
    if (!user) return false;

    const joinMessage: ChatWebSocketMessage = {
      type: 'chat_user_joined',
      data: {
        sessionId: targetSessionId,
      },
      timestamp: Date.now(),
      id: `join-${Date.now()}`,
    };

    return sendWebSocketMessage(joinMessage);
  }, [user, sendWebSocketMessage]);

  // Leave chat session
  const leaveSession = useCallback((targetSessionId: string) => {
    if (!user) return false;

    const leaveMessage: ChatWebSocketMessage = {
      type: 'chat_user_left',
      data: {
        sessionId: targetSessionId,
      },
      timestamp: Date.now(),
      id: `leave-${Date.now()}`,
    };

    return sendWebSocketMessage(leaveMessage);
  }, [user, sendWebSocketMessage]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...websocketProps,
    sendChatMessage,
    sendTypingIndicator,
    sendWorkflowCommand,
    joinSession,
    leaveSession,
    isConnected: websocketProps.isConnected,
  };
};