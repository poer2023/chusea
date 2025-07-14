'use client';

/**
 * Enhanced Chat Interface - Modern AI Chat Component
 * Integrates with ChUseA's WebSocket system, workflow engine, and modern chat features
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useChat, useChatActions, useChatMessages } from '@/stores/chat-store';
import { useAuth } from '@/stores/auth-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { ChatMessage, SlashCommand } from '@/types/chat';
import { useChatWebSocket } from './hooks/use-chat-websocket';

// Import modern chat components
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { SystemMessage } from './system-message';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Workflow,
  FileText,
  MessageSquare,
  Settings,
  Download,
  Share,
} from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
  workflowId?: string;
  documentId?: string;
  enableCommands?: boolean;
  enableWorkflows?: boolean;
  enableFileUpload?: boolean;
  enableVoiceInput?: boolean;
  placeholder?: string;
  welcomeMessage?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

// Connection status component
const ConnectionStatus: React.FC<{ 
  isConnected: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  latency?: number;
}> = ({ isConnected, connectionQuality = 'good', latency }) => {
  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-500';
    switch (connectionQuality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    return `Connected${latency ? ` (${latency}ms)` : ''}`;
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b text-sm">
      <div className={cn('w-2 h-2 rounded-full', getStatusColor())}></div>
      <span className="text-gray-600">{getStatusText()}</span>
      {connectionQuality && isConnected && (
        <Badge variant="outline" className="text-xs capitalize">
          {connectionQuality}
        </Badge>
      )}
    </div>
  );
};

// Chat header component
const ChatHeader: React.FC<{
  currentSession?: any;
  workflowStore: any;
  workflowId?: string;
  documentId?: string;
  onExport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
}> = ({ 
  currentSession, 
  workflowStore, 
  workflowId, 
  documentId, 
  onExport, 
  onShare, 
  onSettings 
}) => {
  const getSessionIcon = () => {
    if (workflowId) return <Workflow className="w-5 h-5" />;
    if (documentId) return <FileText className="w-5 h-5" />;
    return <MessageSquare className="w-5 h-5" />;
  };

  const getSessionType = () => {
    if (workflowId) return 'Workflow Assistant';
    if (documentId) return 'Document Assistant';
    return 'AI Assistant';
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-3">
        <div className="text-blue-600">
          {getSessionIcon()}
        </div>
        <div>
          <h3 className="font-semibold text-lg">
            {currentSession?.title || getSessionType()}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{getSessionType()}</span>
            {workflowId && workflowStore.currentWorkflow && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  {workflowStore.currentWorkflow.type}
                </Badge>
                <Badge 
                  variant={workflowStore.currentWorkflow.status === 'running' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {workflowStore.currentWorkflow.status}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {currentSession && (
          <>
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share className="w-4 h-4" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={onSettings}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Welcome message component
const WelcomeMessage: React.FC<{
  message: string;
  enableCommands: boolean;
  workflowId?: string;
  documentId?: string;
}> = ({ message, enableCommands, workflowId, documentId }) => {
  const getWelcomeIcon = () => {
    if (workflowId) return '⚡';
    if (documentId) return '📄';
    return '👋';
  };

  return (
    <div className="text-center text-gray-500 mt-8 px-4">
      <div className="text-4xl mb-4">{getWelcomeIcon()}</div>
      <div className="text-lg font-medium mb-2">{message}</div>
      {enableCommands && (
        <div className="text-sm mt-4 space-y-2">
          <div>
            Type <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">/help</kbd> to see available commands
          </div>
          <div className="flex justify-center space-x-4 text-xs">
            <span><code>/workflow</code> - Manage workflows</span>
            <span><code>/clear</code> - Clear chat</span>
            <span><code>/help</code> - Show help</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main chat interface component
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className,
  workflowId,
  documentId,
  enableCommands = true,
  enableWorkflows = true,
  enableFileUpload = true,
  enableVoiceInput = false,
  placeholder = 'Type a message...',
  welcomeMessage = 'Welcome to ChUseA AI Assistant! How can I help you today?',
  showHeader = true,
  maxHeight = 'h-full',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const { user } = useAuth();
  const { currentSession, isConnected, isLoading, error } = useChat();
  const { createSession, sendMessage, connect, executeCommand, addMessage, updateMessage, deleteMessage, retryMessage } = useChatActions();
  const { messages } = useChatMessages();
  const workflowStore = useWorkflowStore();

  // WebSocket integration
  const {
    sendChatMessage,
    sendTypingIndicator,
    sendWorkflowCommand,
    isConnected: wsConnected,
    ...wsProps
  } = useChatWebSocket({
    sessionId: currentSession?.id,
    workflowId: workflowId || currentSession?.workflowId,
    documentId: documentId || currentSession?.documentId,
    enableTypingIndicators: true,
    enableWorkflowUpdates: enableWorkflows,
    onMessageReceived: (message) => {
      console.log('WebSocket message received:', message);
    },
    onWorkflowUpdate: (update) => {
      console.log('Workflow update received:', update);
    },
    onError: (error) => {
      console.error('Chat WebSocket error:', error);
    },
  });

  // Available commands
  const commands: SlashCommand[] = [
    {
      name: 'help',
      description: 'Show available commands and usage',
      usage: '/help [command]',
      category: 'system',
      execute: async () => {},
    },
    {
      name: 'clear',
      description: 'Clear current chat session',
      usage: '/clear',
      category: 'system',
      execute: async () => {},
    },
    {
      name: 'export',
      description: 'Export chat history',
      usage: '/export [format]',
      category: 'system',
      execute: async () => {},
    },
    ...(enableWorkflows ? [
      {
        name: 'workflow',
        description: 'Start, stop, or manage workflows',
        usage: '/workflow [start|stop|status|list] [type]',
        category: 'workflow' as const,
        execute: async () => {},
      },
      {
        name: 'step',
        description: 'Navigate workflow steps',
        usage: '/step [next|prev|goto] [step]',
        category: 'workflow' as const,
        execute: async () => {},
      }
    ] : []),
    ...(documentId ? [
      {
        name: 'analyze',
        description: 'Analyze the current document',
        usage: '/analyze [type]',
        category: 'document' as const,
        execute: async () => {},
      },
      {
        name: 'summarize',
        description: 'Summarize document content',
        usage: '/summarize [length]',
        category: 'document' as const,
        execute: async () => {},
      }
    ] : []),
  ];

  // Initialize chat session
  useEffect(() => {
    if (!currentSession && user) {
      createSession(
        workflowId ? 'Workflow Assistant' : documentId ? 'Document Assistant' : 'AI Assistant',
        workflowId,
        documentId
      );
    }
  }, [currentSession, user, workflowId, documentId, createSession]);

  // Connect to WebSocket
  useEffect(() => {
    if (user && !isConnected) {
      connect();
    }
  }, [user, isConnected, connect]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  }, []);

  const handleSendMessage = useCallback(async (content: string, type?: 'text' | 'command') => {
    if (!content.trim() || isLoading) return;

    // Send typing indicator
    sendTypingIndicator(false);

    if (type === 'command' || (content.startsWith('/') && enableCommands)) {
      const [command, ...args] = content.slice(1).split(' ');
      await executeCommand(command, args);
    } else {
      // Use WebSocket for real-time messaging
      if (wsConnected) {
        await sendChatMessage(content);
      } else {
        // Fallback to store method
        await sendMessage(content);
      }
    }
  }, [isLoading, enableCommands, executeCommand, sendMessage, sendChatMessage, sendTypingIndicator, wsConnected]);

  const handleTypingChange = useCallback((isTyping: boolean) => {
    sendTypingIndicator(isTyping);
  }, [sendTypingIndicator]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    // TODO: Implement file upload functionality
    console.log('Files uploaded:', files);
  }, []);

  const handleMessageEdit = useCallback(async (messageId: string, newContent: string) => {
    updateMessage(messageId, { content: newContent });
  }, [updateMessage]);

  const handleMessageDelete = useCallback(async (messageId: string) => {
    deleteMessage(messageId);
  }, [deleteMessage]);

  const handleMessageRetry = useCallback(async (messageId: string) => {
    await retryMessage(messageId);
  }, [retryMessage]);

  const handleSystemAction = useCallback((action: string, data?: any) => {
    switch (action) {
      case 'view-workflow':
        // TODO: Navigate to workflow view
        console.log('View workflow:', data);
        break;
      case 'pause-workflow':
        // TODO: Pause workflow
        if (wsConnected) {
          sendWorkflowCommand('pause', data);
        }
        break;
      case 'retry':
        // TODO: Retry action
        console.log('Retry action:', data);
        break;
      default:
        console.log('Unknown action:', action, data);
    }
  }, [wsConnected, sendWorkflowCommand]);

  if (!user) {
    return (
      <Card className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center p-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">AI Chat Assistant</h3>
          <p className="text-gray-600 mb-4">Please log in to start chatting with the AI assistant</p>
        </div>
      </Card>
    );
  }

  const typingUsers = wsProps.typingUsers || [];
  const activeTypingUsers = typingUsers.filter(t => t.isTyping);

  return (
    <Card className={cn('flex flex-col', maxHeight, className)}>
      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={wsConnected || isConnected} 
        connectionQuality={wsProps.connectionQuality}
        latency={wsProps.latency}
      />

      {/* Chat Header */}
      {showHeader && (
        <ChatHeader
          currentSession={currentSession}
          workflowStore={workflowStore}
          workflowId={workflowId}
          documentId={documentId}
          onExport={() => console.log('Export chat')}
          onShare={() => console.log('Share chat')}
          onSettings={() => console.log('Chat settings')}
        />
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <WelcomeMessage
            message={welcomeMessage}
            enableCommands={enableCommands}
            workflowId={workflowId}
            documentId={documentId}
          />
        ) : (
          <>
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              
              if (message.role === 'system') {
                return (
                  <SystemMessage
                    key={message.id}
                    message={message}
                    onAction={handleSystemAction}
                    className="mb-4"
                  />
                );
              }
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={true}
                  showTimestamp={true}
                  isLast={isLast}
                  onEdit={handleMessageEdit}
                  onDelete={handleMessageDelete}
                  onRetry={handleMessageRetry}
                  className="mb-4"
                />
              );
            })}
            
            {/* Typing Indicator */}
            {activeTypingUsers.length > 0 && (
              <TypingIndicator
                typingUsers={activeTypingUsers}
                showAvatars={true}
                className="mb-4"
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <div className="font-medium">Error</div>
          <div>{error}</div>
        </div>
      )}

      {/* Auto-scroll indicator */}
      {!autoScroll && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAutoScroll(true);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs"
          >
            Scroll to bottom
          </Button>
        </div>
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
        onFileUpload={enableFileUpload ? handleFileUpload : undefined}
        placeholder={placeholder}
        disabled={isLoading}
        isLoading={isLoading}
        enableCommands={enableCommands}
        enableFileUpload={enableFileUpload}
        enableVoiceInput={enableVoiceInput}
        commands={commands}
        className="border-t"
      />
    </Card>
  );
};

export default ChatInterface;