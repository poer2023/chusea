'use client';

/**
 * Chat Layout - Complete AI Chat Interface Layout
 * Combines sidebar, main chat interface, and workflow integration
 */

import React, { useState, useEffect } from 'react';
import { ChatInterface } from './chat-interface';
import { ChatSidebar } from './chat-sidebar';
import { useChatWebSocket } from './hooks/use-chat-websocket';
import { useChat, useChatActions } from '@/stores/chat-store';
import { useAuth } from '@/stores/auth-store';
import { useWorkflowStore } from '@/stores/workflow-store';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Download,
  Share,
  Workflow,
  FileText,
  MessageSquare,
} from 'lucide-react';

interface ChatLayoutProps {
  className?: string;
  workflowId?: string;
  documentId?: string;
  defaultSidebarOpen?: boolean;
  enableWorkflows?: boolean;
  enableDocuments?: boolean;
  showHeader?: boolean;
  customHeader?: React.ReactNode;
}

const ChatHeader: React.FC<{
  currentSession: any;
  workflowStore: any;
  onExport: () => void;
  onShare: () => void;
  onSettings: () => void;
}> = ({ currentSession, workflowStore, onExport, onShare, onSettings }) => {
  const getSessionIcon = () => {
    if (currentSession?.workflowId) return <Workflow className="w-5 h-5" />;
    if (currentSession?.documentId) return <FileText className="w-5 h-5" />;
    return <MessageSquare className="w-5 h-5" />;
  };

  const getSessionType = () => {
    if (currentSession?.workflowId) return 'Workflow Chat';
    if (currentSession?.documentId) return 'Document Chat';
    return 'AI Assistant';
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-3">
        <div className="text-blue-600">
          {getSessionIcon()}
        </div>
        <div>
          <h1 className="text-lg font-semibold">
            {currentSession?.title || getSessionType()}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{getSessionType()}</span>
            {currentSession?.workflowId && workflowStore.currentWorkflow && (
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

const ChatMetrics: React.FC<{
  isConnected: boolean;
  messageCount: number;
  averageResponseTime?: number;
}> = ({ isConnected, messageCount, averageResponseTime }) => {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
      <div className="flex items-center space-x-1">
        <div className={cn(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )}></div>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      <div>Messages: {messageCount}</div>
      
      {averageResponseTime && (
        <div>Avg Response: {averageResponseTime}ms</div>
      )}
    </div>
  );
};

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  className,
  workflowId,
  documentId,
  defaultSidebarOpen = true,
  enableWorkflows = true,
  enableDocuments = true,
  showHeader = true,
  customHeader,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { user } = useAuth();
  const { currentSession, isConnected, sessions } = useChat();
  const { createSession, setCurrentSession } = useChatActions();
  const workflowStore = useWorkflowStore();

  // Initialize WebSocket connection
  const {
    sendChatMessage,
    sendTypingIndicator,
    sendWorkflowCommand,
    isConnected: wsConnected,
  } = useChatWebSocket({
    sessionId: currentSession?.id,
    workflowId: workflowId || currentSession?.workflowId,
    documentId: documentId || currentSession?.documentId,
    enableTypingIndicators: true,
    enableWorkflowUpdates: enableWorkflows,
    onMessageReceived: (message) => {
      console.log('Message received:', message);
    },
    onWorkflowUpdate: (update) => {
      console.log('Workflow update:', update);
    },
    onError: (error) => {
      console.error('Chat WebSocket error:', error);
    },
  });

  // Create initial session if needed
  useEffect(() => {
    if (user && !currentSession && sessions.length === 0) {
      const newSession = createSession(
        workflowId ? 'Workflow Assistant' : documentId ? 'Document Assistant' : 'AI Assistant',
        workflowId,
        documentId
      );
      setCurrentSession(newSession.id);
    }
  }, [user, currentSession, sessions.length, workflowId, documentId, createSession, setCurrentSession]);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentSession(sessionId);
  };

  const handleExportChat = () => {
    if (!currentSession) return;

    const chatData = {
      session: currentSession,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentSession.title}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareChat = () => {
    if (!currentSession) return;
    
    // TODO: Implement chat sharing functionality
    console.log('Share chat:', currentSession.id);
  };

  const handleSettings = () => {
    // TODO: Open chat settings modal
    console.log('Open chat settings');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return (
      <Card className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">AI Chat Assistant</h3>
          <p className="text-gray-600 mb-4">Please log in to start chatting</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('flex h-full bg-gray-50', className)}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 flex-shrink-0 border-r bg-white">
          <ChatSidebar
            onSessionSelect={handleSessionSelect}
            showWorkflowSessions={enableWorkflows}
            showDocumentSessions={enableDocuments}
            className="h-full border-none"
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {showHeader && (
          <>
            {customHeader || (
              <ChatHeader
                currentSession={currentSession}
                workflowStore={workflowStore}
                onExport={handleExportChat}
                onShare={handleShareChat}
                onSettings={handleSettings}
              />
            )}
            
            {/* Sidebar Toggle */}
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </Button>
            </div>
          </>
        )}

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            workflowId={workflowId}
            documentId={documentId}
            enableCommands={true}
            enableWorkflows={enableWorkflows}
            className="h-full border-none rounded-none"
            placeholder="Type your message... (use / for commands)"
            welcomeMessage={
              workflowId 
                ? "Welcome to the Workflow Assistant! I can help you manage and execute workflows."
                : documentId
                  ? "Welcome to the Document Assistant! I can help you with document analysis and editing."
                  : "Welcome to ChUseA AI Assistant! How can I help you today?"
            }
          />
        </div>

        {/* Footer Metrics */}
        <ChatMetrics
          isConnected={wsConnected}
          messageCount={currentSession?.messages.length || 0}
        />
      </div>
    </div>
  );
};

export default ChatLayout;