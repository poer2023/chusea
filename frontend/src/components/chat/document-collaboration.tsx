'use client';

/**
 * Document Collaboration Component
 * Demonstrates integration between chat and document editing
 */

import React, { useState, useEffect } from 'react';
import { useChatActions } from '@/stores/chat-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  FileText,
  Users,
  Edit3,
  Eye,
  MessageSquare,
  Share2,
  Download,
  History,
  Save,
  Undo,
  Redo,
  Settings,
} from 'lucide-react';

interface DocumentCollaborationProps {
  documentId?: string;
  className?: string;
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  currentSelection?: { start: number; end: number };
  lastSeen: number;
}

interface DocumentChange {
  id: string;
  type: 'insert' | 'delete' | 'format' | 'comment';
  userId: string;
  userName: string;
  timestamp: number;
  content: string;
  position?: number;
}

export const DocumentCollaboration: React.FC<DocumentCollaborationProps> = ({
  documentId,
  className,
}) => {
  const { addMessage } = useChatActions() as any;
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<Collaborator[]>([
    {
      id: 'user1',
      name: 'Alice Johnson',
      status: 'online',
      currentSelection: { start: 150, end: 200 },
      lastSeen: Date.now(),
    },
    {
      id: 'user2',
      name: 'Bob Smith',
      status: 'online',
      lastSeen: Date.now() - 30000,
    },
    {
      id: 'user3',
      name: 'Carol Davis',
      status: 'away',
      lastSeen: Date.now() - 300000,
    },
  ]);
  
  const [recentChanges, setRecentChanges] = useState<DocumentChange[]>([
    {
      id: 'change1',
      type: 'insert',
      userId: 'user1',
      userName: 'Alice Johnson',
      timestamp: Date.now() - 120000,
      content: 'Added introduction paragraph',
      position: 0,
    },
    {
      id: 'change2',
      type: 'format',
      userId: 'user2',
      userName: 'Bob Smith',
      timestamp: Date.now() - 300000,
      content: 'Applied heading formatting',
      position: 50,
    },
    {
      id: 'change3',
      type: 'comment',
      userId: 'user3',
      userName: 'Carol Davis',
      timestamp: Date.now() - 600000,
      content: 'Please review this section',
      position: 100,
    },
  ]);

  // Mock document data
  const document = {
    id: documentId || 'demo-doc-456',
    title: 'Product Requirements Document',
    type: 'PRD',
    lastModified: Date.now() - 60000,
    wordCount: 2847,
    version: '1.4',
    status: 'draft',
  };

  const handleDocumentAction = async (action: string, data?: any) => {
    setIsProcessing(true);
    
    try {
      // Simulate document action
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add system message to chat
      addMessage({
        id: `document-${Date.now()}`,
        role: 'system',
        content: `Document ${action}: ${document.title}`,
        timestamp: Date.now(),
        status: 'delivered',
        metadata: {
          type: 'document',
          documentId: document.id,
          action,
          documentName: document.title,
        },
      });
      
      // Simulate adding a new change
      if (action === 'edit' || action === 'comment') {
        const newChange: DocumentChange = {
          id: `change-${Date.now()}`,
          type: action as any,
          userId: 'current-user',
          userName: 'You',
          timestamp: Date.now(),
          content: `${action} operation completed`,
        };
        setRecentChanges(prev => [newChange, ...prev.slice(0, 4)]);
      }
      
    } catch (error) {
      console.error('Document action failed:', error);
      addMessage({
        id: `document-error-${Date.now()}`,
        role: 'system',
        content: `Document ${action} failed: ${error}`,
        timestamp: Date.now(),
        status: 'delivered',
        metadata: {
          type: 'error',
          documentId: document.id,
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'insert':
        return <Edit3 className="w-3 h-3 text-green-600" />;
      case 'delete':
        return <Edit3 className="w-3 h-3 text-red-600" />;
      case 'format':
        return <Edit3 className="w-3 h-3 text-blue-600" />;
      case 'comment':
        return <MessageSquare className="w-3 h-3 text-purple-600" />;
      default:
        return <Edit3 className="w-3 h-3 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!document) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2" />
          <p>No document selected</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => handleDocumentAction('create')}
          >
            Create Document
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      {/* Document Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-sm">{document.title}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{document.wordCount} words</span>
              <span>•</span>
              <span>v{document.version}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {document.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Active Collaborators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Collaborators ({activeCollaborators.filter(c => c.status === 'online').length})</span>
          </h4>
        </div>
        
        <div className="flex -space-x-2">
          {activeCollaborators.map((collaborator) => (
            <div key={collaborator.id} className="relative">
              <Avatar className="w-8 h-8 border-2 border-white">
                <div className="bg-gradient-to-br from-blue-400 to-purple-500 w-full h-full rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {collaborator.name.charAt(0)}
                </div>
              </Avatar>
              <div className={cn(
                'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
                getStatusColor(collaborator.status)
              )} />
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500">
          {activeCollaborators.map((c, i) => (
            <span key={c.id}>
              {c.name}
              {c.status === 'online' && ' (editing)'}
              {i < activeCollaborators.length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Changes */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <History className="w-4 h-4" />
          <span>Recent Changes</span>
        </h4>
        
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {recentChanges.map((change) => (
            <div key={change.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
              {getChangeIcon(change.type)}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{change.userName}</div>
                <div className="text-xs text-gray-600 truncate">{change.content}</div>
                <div className="text-xs text-gray-400">{formatTimeAgo(change.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Actions */}
      <div className="space-y-2 pt-2 border-t">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDocumentAction('edit')}
            disabled={isProcessing}
            className="text-xs"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDocumentAction('comment')}
            disabled={isProcessing}
            className="text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Comment
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDocumentAction('share')}
            disabled={isProcessing}
            className="text-xs"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDocumentAction('export')}
            disabled={isProcessing}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDocumentAction('analyze')}
            className="text-xs h-6"
          >
            AI Analysis
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDocumentAction('summarize')}
            className="text-xs h-6"
          >
            Summarize
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDocumentAction('version-history')}
            className="text-xs h-6"
          >
            History
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentCollaboration;