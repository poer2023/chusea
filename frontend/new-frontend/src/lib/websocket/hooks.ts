/**
 * React Hooks for WebSocket Integration in ChUseA
 * Provides hooks for WebSocket connections, workflow updates, and document collaboration
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  WebSocketConfig, 
  WebSocketMessage, 
  ConnectionStatus, 
  UseWebSocketOptions,
  WebSocketHookReturn,
  WorkflowUpdateMessage,
  WorkflowStepChangeMessage,
  WorkflowProgressMessage,
  DocumentChangeMessage,
  DocumentCollaborationMessage,
  UserPresenceMessage,
  NotificationMessage,
  MessageFilter,
  PerformanceMetrics
} from './types';
import { ChUseAWebSocketClient, createDefaultConfig, createAuthenticatedConfig } from './client';
import { createDefaultMiddlewareChain } from './middleware';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkflowStore } from '@/stores/workflow-store';

// Core WebSocket hook
export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): WebSocketHookReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    connectionTime: 0,
    messageLatency: [],
    messagesReceived: 0,
    messagesSent: 0,
    reconnections: 0,
    bytesReceived: 0,
    bytesSent: 0,
    errors: [],
  });

  const clientRef = useRef<ChUseAWebSocketClient | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();

  // Create WebSocket client configuration
  const config = useMemo(() => {
    const baseConfig = isAuthenticated && accessToken
      ? createAuthenticatedConfig(url, async () => accessToken)
      : createDefaultConfig(url);

    return {
      ...baseConfig,
      ...options,
      reconnect: { ...baseConfig.reconnect, ...options.reconnect },
      heartbeat: { ...baseConfig.heartbeat, ...options.heartbeat },
      messageQueue: { ...baseConfig.messageQueue, ...options.messageQueue },
    };
  }, [url, options, isAuthenticated, accessToken]);

  // Initialize WebSocket client
  useEffect(() => {
    if (!options.enabled) return;

    const eventHandlers = {
      onOpen: () => {
        setIsConnected(true);
        setConnectionStatus('connected');
      },
      onClose: () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      },
      onError: (error: Event) => {
        options.onError?.(new Error('WebSocket error'));
      },
      onMessage: (message: WebSocketMessage) => {
        setLastMessage(message);
        options.onMessage?.(message);
      },
      onReconnect: (attempt: number) => {
        setConnectionStatus('reconnecting');
      },
      onReconnectFailed: () => {
        setConnectionStatus('failed');
      },
      onAuthRequired: () => {
        setConnectionStatus('disconnected');
      },
    };

    clientRef.current = new ChUseAWebSocketClient(config, eventHandlers);

    // Add middleware
    const middlewareChain = createDefaultMiddlewareChain();
    if (options.middleware) {
      middlewareChain.add(options.middleware);
    }

    // Add filters
    if (options.filter) {
      clientRef.current.addMessageFilter(options.filter);
    }

    // Connect
    clientRef.current.connect().catch((error) => {
      console.error('Failed to connect WebSocket:', error);
      options.onError?.(error);
    });

    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, [config, options]);

  // Update metrics periodically
  useEffect(() => {
    if (!clientRef.current) return;

    const updateMetrics = () => {
      if (clientRef.current) {
        setMetrics(clientRef.current.getMetrics());
      }
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update connection status
  useEffect(() => {
    if (!clientRef.current) return;

    const updateStatus = () => {
      if (clientRef.current) {
        const state = clientRef.current.getConnectionState();
        setConnectionStatus(state.status);
        setIsConnected(clientRef.current.isConnected());
      }
    };

    const interval = setInterval(updateStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    return clientRef.current?.sendMessage(message) || false;
  }, []);

  const connect = useCallback(() => {
    clientRef.current?.connect().catch(console.error);
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    clientRef.current?.disconnect();
    setTimeout(() => clientRef.current?.connect().catch(console.error), 1000);
  }, []);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnect,
    metrics,
  };
}

// Workflow-specific WebSocket hook
export function useWorkflowUpdates(workflowId?: string) {
  const workflowStore = useWorkflowStore();
  const [workflowMessages, setWorkflowMessages] = useState<WorkflowUpdateMessage[]>([]);
  const [lastStepChange, setLastStepChange] = useState<WorkflowStepChangeMessage | null>(null);
  const [progress, setProgress] = useState<WorkflowProgressMessage | null>(null);

  const filter: MessageFilter = useMemo(() => ({
    types: ['workflow_update', 'workflow_step_change', 'workflow_progress', 'workflow_error'],
    workflowIds: workflowId ? [workflowId] : undefined,
  }), [workflowId]);

  const handleWorkflowMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'workflow_update':
        const updateMessage = message.data as WorkflowUpdateMessage;
        setWorkflowMessages(prev => [updateMessage, ...prev.slice(0, 99)]); // Keep last 100
        
        // Update store if this is our current workflow
        if (workflowStore.currentWorkflow?.id === updateMessage.workflowId) {
          // Update workflow state based on the message
          if (updateMessage.newStatus) {
            // Handle workflow status updates
          }
        }
        break;

      case 'workflow_step_change':
        const stepMessage = message.data as WorkflowStepChangeMessage;
        setLastStepChange(stepMessage);
        
        // Update current step in store
        if (workflowStore.currentWorkflow?.id === stepMessage.workflowId) {
          workflowStore.goToStep(stepMessage.currentStep);
          
          // Update step progress
          if (stepMessage.stepProgress !== undefined) {
            // Note: The store doesn't have setStepProgress, but we can track it locally
          }
        }
        break;

      case 'workflow_progress':
        const progressMessage = message.data as WorkflowProgressMessage;
        setProgress(progressMessage);
        
        // Update progress in store
        if (workflowStore.currentWorkflow?.id === progressMessage.workflowId) {
          // The store calculates its own progress, but we could sync real-time updates
          workflowStore.calculateProgress();
        }
        break;

      case 'workflow_error':
        // Handle workflow errors
        const errorMessage = message.data;
        if (workflowStore.currentWorkflow?.id === errorMessage.workflowId) {
          workflowStore.setError(errorMessage.error.message);
        }
        break;
    }
  }, [workflowStore]);

  const { isConnected, sendMessage, ...websocketProps } = useWebSocket(
    `/api/workflow/ws/${workflowId || 'general'}`,
    {
      enabled: true,
      filter,
      onMessage: handleWorkflowMessage,
    }
  );

  const sendWorkflowUpdate = useCallback((update: Partial<WorkflowUpdateMessage>) => {
    if (!workflowId) return;

    const message: WebSocketMessage = {
      type: 'workflow_update',
      data: {
        workflowId,
        ...update,
      },
      timestamp: Date.now(),
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return sendMessage(message);
  }, [workflowId, sendMessage]);

  return {
    isConnected,
    workflowMessages,
    lastStepChange,
    progress,
    sendWorkflowUpdate,
    ...websocketProps,
  };
}

// Document collaboration WebSocket hook
export function useDocumentCollaboration(documentId?: string) {
  const [collaborators, setCollaborators] = useState<UserPresenceMessage[]>([]);
  const [documentChanges, setDocumentChanges] = useState<DocumentChangeMessage[]>([]);
  const [collaborationEvents, setCollaborationEvents] = useState<DocumentCollaborationMessage[]>([]);

  const filter: MessageFilter = useMemo(() => ({
    types: ['document_change', 'document_collaboration', 'user_presence'],
    documentIds: documentId ? [documentId] : undefined,
  }), [documentId]);

  const handleCollaborationMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'document_change':
        const changeMessage = message.data as DocumentChangeMessage;
        setDocumentChanges(prev => [changeMessage, ...prev.slice(0, 99)]);
        break;

      case 'document_collaboration':
        const collabMessage = message.data as DocumentCollaborationMessage;
        setCollaborationEvents(prev => [collabMessage, ...prev.slice(0, 99)]);
        break;

      case 'user_presence':
        const presenceMessage = message.data as UserPresenceMessage;
        setCollaborators(prev => {
          const filtered = prev.filter(c => c.userId !== presenceMessage.userId);
          if (presenceMessage.status !== 'offline') {
            return [presenceMessage, ...filtered];
          }
          return filtered;
        });
        break;
    }
  }, []);

  const { isConnected, sendMessage, ...websocketProps } = useWebSocket(
    `/api/documents/ws/${documentId || 'general'}`,
    {
      enabled: !!documentId,
      filter,
      onMessage: handleCollaborationMessage,
    }
  );

  const sendDocumentChange = useCallback((changes: any[], changeType: 'insert' | 'delete' | 'replace' | 'format' | 'move' | 'metadata') => {
    if (!documentId) return;

    const { user } = useAuthStore.getState();
    if (!user) return;

    const message: WebSocketMessage = {
      type: 'document_change',
      data: {
        documentId,
        userId: user.id,
        userName: user.name,
        changeType,
        changes,
        version: Date.now(), // Should be actual document version
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      id: `doc-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return sendMessage(message);
  }, [documentId, sendMessage]);

  const sendPresenceUpdate = useCallback((action: 'join' | 'leave' | 'cursor_move' | 'selection_change' | 'typing_start' | 'typing_stop', data?: any) => {
    if (!documentId) return;

    const { user } = useAuthStore.getState();
    if (!user) return;

    const message: WebSocketMessage = {
      type: 'document_collaboration',
      data: {
        documentId,
        userId: user.id,
        userName: user.name,
        action,
        ...data,
      },
      timestamp: Date.now(),
      id: `presence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return sendMessage(message);
  }, [documentId, sendMessage]);

  const sendCursorPosition = useCallback((position: { line: number; column: number; selectionStart?: number; selectionEnd?: number }) => {
    return sendPresenceUpdate('cursor_move', { cursor: { ...position, documentId } });
  }, [sendPresenceUpdate, documentId]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    return sendPresenceUpdate(isTyping ? 'typing_start' : 'typing_stop');
  }, [sendPresenceUpdate]);

  return {
    isConnected,
    collaborators,
    documentChanges,
    collaborationEvents,
    sendDocumentChange,
    sendPresenceUpdate,
    sendCursorPosition,
    sendTypingStatus,
    ...websocketProps,
  };
}

// Real-time notifications hook
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const filter: MessageFilter = useMemo(() => ({
    types: ['notification', 'system_message'],
  }), []);

  const handleNotificationMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'notification') {
      const notification = message.data as NotificationMessage;
      setNotifications(prev => [notification, ...prev.slice(0, 99)]);
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const { isConnected, sendMessage, ...websocketProps } = useWebSocket(
    '/api/notifications/ws',
    {
      enabled: true,
      filter,
      onMessage: handleNotificationMessage,
    }
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    ...websocketProps,
  };
}

// Connection status hook
export function useConnectionStatus(url?: string) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [latency, setLatency] = useState<number>(0);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [lastConnected, setLastConnected] = useState<number | null>(null);

  const { connectionStatus, metrics } = useWebSocket(url || '/api/ws/status', {
    enabled: true,
    onConnectionChange: setStatus,
  });

  useEffect(() => {
    setStatus(connectionStatus);
  }, [connectionStatus]);

  useEffect(() => {
    if (metrics.messageLatency.length > 0) {
      const avgLatency = metrics.messageLatency.reduce((sum, lat) => sum + lat, 0) / metrics.messageLatency.length;
      setLatency(avgLatency);
    }
    setReconnectAttempts(metrics.reconnections);
  }, [metrics]);

  useEffect(() => {
    if (status === 'connected') {
      setLastConnected(Date.now());
    }
  }, [status]);

  const isOnline = status === 'connected';
  const isReconnecting = status === 'reconnecting';
  const hasError = status === 'failed' || status === 'rate_limited';

  return {
    status,
    isOnline,
    isReconnecting,
    hasError,
    latency,
    reconnectAttempts,
    lastConnected,
    metrics,
  };
}

// Utility hook for WebSocket message batching
export function useMessageBatch<T = any>(
  sendFunction: (message: WebSocketMessage) => boolean,
  options: { 
    batchSize?: number; 
    flushInterval?: number; 
    priority?: 'high' | 'medium' | 'low' 
  } = {}
) {
  const { batchSize = 10, flushInterval = 100, priority = 'medium' } = options;
  const batchRef = useRef<WebSocketMessage[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flush = useCallback(() => {
    if (batchRef.current.length === 0) return;

    // Create batch message
    const batchMessage: WebSocketMessage = {
      type: 'batch',
      data: {
        messages: batchRef.current,
        priority,
        count: batchRef.current.length,
      },
      timestamp: Date.now(),
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    sendFunction(batchMessage);
    batchRef.current = [];

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [sendFunction, priority]);

  const addToBatch = useCallback((message: WebSocketMessage) => {
    batchRef.current.push(message);

    // Flush if batch is full
    if (batchRef.current.length >= batchSize) {
      flush();
      return;
    }

    // Set timeout for batch flush if not already set
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(flush, flushInterval);
    }
  }, [batchSize, flushInterval, flush]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { addToBatch, flush };
}

// Hook for monitoring WebSocket performance
export function useWebSocketPerformance(websocketMetrics: PerformanceMetrics) {
  const [averageLatency, setAverageLatency] = useState(0);
  const [messageRate, setMessageRate] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  useEffect(() => {
    // Calculate average latency
    if (websocketMetrics.messageLatency.length > 0) {
      const avg = websocketMetrics.messageLatency.reduce((sum, lat) => sum + lat, 0) / websocketMetrics.messageLatency.length;
      setAverageLatency(avg);
    }

    // Calculate message rate (messages per second)
    const rate = websocketMetrics.messagesReceived + websocketMetrics.messagesSent;
    setMessageRate(rate);

    // Calculate error rate
    const totalMessages = websocketMetrics.messagesReceived + websocketMetrics.messagesSent;
    const errorRate = totalMessages > 0 ? (websocketMetrics.errors.length / totalMessages) * 100 : 0;
    setErrorRate(errorRate);

    // Determine connection quality
    let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    
    if (averageLatency > 1000 || errorRate > 5 || websocketMetrics.reconnections > 3) {
      quality = 'poor';
    } else if (averageLatency > 500 || errorRate > 2 || websocketMetrics.reconnections > 1) {
      quality = 'fair';
    } else if (averageLatency > 200 || errorRate > 0.5) {
      quality = 'good';
    }

    setConnectionQuality(quality);
  }, [websocketMetrics, averageLatency]);

  return {
    averageLatency,
    messageRate,
    errorRate,
    connectionQuality,
    totalBytes: websocketMetrics.bytesReceived + websocketMetrics.bytesSent,
    totalMessages: websocketMetrics.messagesReceived + websocketMetrics.messagesSent,
    totalErrors: websocketMetrics.errors.length,
    reconnections: websocketMetrics.reconnections,
  };
}