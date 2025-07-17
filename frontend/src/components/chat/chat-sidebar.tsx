'use client';

/**
 * Chat Sidebar - Session Management and Navigation
 * Provides session switching, search, and chat history management
 */

import React, { useState, useMemo } from 'react';
import { useChat, useChatActions, ChatStoreState } from '@/stores/chat-store';
import { ChatSession } from '@/types/chat';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
  MoreHorizontal,
  Plus,
  Search,
  MessageSquare,
  Workflow,
  FileText,
  Trash2,
  Edit,
} from 'lucide-react';

interface ChatSidebarProps {
  className?: string;
  onSessionSelect?: (sessionId: string) => void;
  showWorkflowSessions?: boolean;
  showDocumentSessions?: boolean;
}

const SessionItem: React.FC<{
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}> = ({ session, isActive, onSelect, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [showActions, setShowActions] = useState(false);

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== session.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
    setEditTitle(session.title);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(session.title);
    }
  };

  const getSessionIcon = () => {
    if (session.workflowId) return <Workflow className="w-4 h-4" />;
    if (session.documentId) return <FileText className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  const getLastMessagePreview = () => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return 'No messages yet';
    
    const preview = lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
    
    return `${lastMessage.role === 'user' ? 'You' : 'AI'}: ${preview}`;
  };

  return (
    <div
      className={cn(
        'p-3 rounded-lg cursor-pointer transition-colors group relative',
        isActive 
          ? 'bg-blue-50 border-blue-200 border' 
          : 'hover:bg-gray-50 border border-transparent'
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          'mt-1 flex-shrink-0',
          isActive ? 'text-blue-600' : 'text-gray-400'
        )}>
          {getSessionIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyPress={handleKeyPress}
              className="h-6 text-sm"
              autoFocus
            />
          ) : (
            <div className="font-medium text-sm truncate">{session.title}</div>
          )}
          
          <div className="text-xs text-gray-500 mt-1 truncate">
            {getLastMessagePreview()}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-400">
              {new Date(session.updatedAt).toLocaleDateString()}
            </div>
            
            <div className="flex items-center space-x-1">
              {session.workflowId && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  WF
                </Badge>
              )}
              {session.documentId && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  DOC
                </Badge>
              )}
              {session.messages.length > 0 && (
                <span className="text-xs text-gray-400">
                  {session.messages.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && !isEditing && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  className,
  onSessionSelect,
  showWorkflowSessions = true,
  showDocumentSessions = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'chat' | 'workflow' | 'document'>('all');

  const { currentSession, sessions } = useChat();
  const { createSession, setCurrentSession, deleteSession } = useChatActions() as Pick<ChatStoreState, 'createSession' | 'setCurrentSession' | 'deleteSession'>;

  // Filter sessions based on search and category
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(session => {
        switch (selectedCategory) {
          case 'workflow':
            return !!session.workflowId;
          case 'document':
            return !!session.documentId;
          case 'chat':
            return !session.workflowId && !session.documentId;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(query) ||
        session.messages.some(msg => 
          msg.content.toLowerCase().includes(query)
        )
      );
    }

    // Sort by updated date (most recent first)
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [sessions, searchQuery, selectedCategory]);

  const handleCreateNewSession = () => {
    const newSession = createSession();
    setCurrentSession(newSession.id);
    onSessionSelect?.(newSession.id);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
    onSessionSelect?.(sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      deleteSession(sessionId);
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    // TODO: Implement session renaming in store
  };

  const getCategoryCount = (category: 'all' | 'chat' | 'workflow' | 'document') => {
    switch (category) {
      case 'all':
        return sessions.length;
      case 'workflow':
        return sessions.filter(s => !!s.workflowId).length;
      case 'document':
        return sessions.filter(s => !!s.documentId).length;
      case 'chat':
        return sessions.filter(s => !s.workflowId && !s.documentId).length;
      default:
        return 0;
    }
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Chat Sessions</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNewSession}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Category Filters */}
        <div className="flex space-x-1 mt-3">
          {(['all', 'chat', 'workflow', 'document'] as const).map(category => {
            const count = getCategoryCount(category);
            const isVisible = category === 'all' || 
              (category === 'workflow' && showWorkflowSessions) ||
              (category === 'document' && showDocumentSessions) ||
              (category === 'chat');

            if (!isVisible) return null;

            return (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-7 text-xs capitalize"
              >
                {category} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">
              {searchQuery ? 'No sessions found' : 'No chat sessions yet'}
            </div>
            {!searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateNewSession}
                className="mt-2"
              >
                Start a new chat
              </Button>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={currentSession?.id === session.id}
              onSelect={() => handleSessionSelect(session.id)}
              onDelete={() => handleDeleteSession(session.id)}
              onRename={(newTitle) => handleRenameSession(session.id, newTitle)}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Total Sessions: {sessions.length}</span>
          <span>
            Messages: {sessions.reduce((sum, s) => sum + s.messages.length, 0)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ChatSidebar;