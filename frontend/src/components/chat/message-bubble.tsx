'use client';

/**
 * Enhanced Message Bubble Component
 * Modern message display with rich content support, reactions, and animations
 */

import React, { useState, useCallback, memo } from 'react';
import { ChatMessage } from '@/types/chat';
import { useAuth } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Copy,
  MoreHorizontal,
  Trash2,
  Edit,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Workflow,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Send
} from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  isLast?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
  onReaction?: (messageId: string, reaction: string) => void;
  className?: string;
}

interface MessageActionsProps {
  message: ChatMessage;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
  onCopy: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ 
  message, 
  onEdit, 
  onDelete, 
  onRetry, 
  onCopy 
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowActions(!showActions)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreHorizontal className="w-3 h-3" />
      </Button>
      
      {showActions && (
        <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
          <button
            onClick={onCopy}
            className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 flex items-center space-x-2"
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>
          
          {message.role === 'user' && onEdit && (
            <button
              onClick={() => {
                onEdit(message.id, message.content);
                setShowActions(false);
              }}
              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
          
          {message.status === 'failed' && onRetry && (
            <button
              onClick={() => {
                onRetry(message.id);
                setShowActions(false);
              }}
              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => {
                onDelete(message.id);
                setShowActions(false);
              }}
              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const MessageStatus: React.FC<{ status?: ChatMessage['status'] }> = ({ status }) => {
  if (!status) return null;

  const statusConfig = {
    sending: { icon: Clock, color: 'text-gray-400', label: 'Sending...' },
    sent: { icon: Send, color: 'text-blue-500', label: 'Sent' },
    delivered: { icon: CheckCircle, color: 'text-green-500', label: 'Delivered' },
    failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center space-x-1 text-xs', config.color)} title={config.label}>
      <Icon className="w-3 h-3" />
    </div>
  );
};

const MessageMetadata: React.FC<{ message: ChatMessage }> = ({ message }) => {
  if (!message.metadata) return null;

  const { type, workflowId, stepId, commandType } = message.metadata;

  return (
    <div className="flex items-center space-x-2 mt-1">
      {type === 'workflow' && (
        <Badge variant="secondary" className="text-xs flex items-center space-x-1">
          <Workflow className="w-3 h-3" />
          <span>Workflow</span>
          {workflowId && <span className="text-gray-500">#{workflowId.slice(-4)}</span>}
        </Badge>
      )}
      
      {type === 'command' && (
        <Badge variant="outline" className="text-xs">
          Command: {commandType}
        </Badge>
      )}
      
      {type === 'error' && (
        <Badge variant="outline" className="text-xs flex items-center space-x-1 text-red-600 border-red-200">
          <AlertCircle className="w-3 h-3" />
          <span>Error</span>
        </Badge>
      )}
    </div>
  );
};

const MessageContent: React.FC<{ content: string; type?: string }> = ({ content, type }) => {
  // Handle different content types
  if (type === 'workflow') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Workflow className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Workflow Update</span>
        </div>
        <div className="text-sm text-blue-700">{content}</div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">Error</span>
        </div>
        <div className="text-sm text-red-700">{content}</div>
      </div>
    );
  }

  // Handle code blocks and markdown-like formatting
  const formatContent = (text: string) => {
    // Simple code block detection
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let formattedText = text;
    
    // Replace code blocks
    formattedText = formattedText.replace(codeBlockRegex, (match, code) => {
      return `<pre class="bg-gray-100 rounded p-2 my-2 text-sm font-mono overflow-x-auto"><code>${code.trim()}</code></pre>`;
    });
    
    // Replace inline code
    formattedText = formattedText.replace(inlineCodeRegex, (match, code) => {
      return `<code class="bg-gray-100 px-1 rounded text-sm font-mono">${code}</code>`;
    });
    
    return formattedText;
  };

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({
  message,
  showAvatar = true,
  showTimestamp = true,
  isLast = false,
  onEdit,
  onDelete,
  onRetry,
  onReaction,
  className,
}) => {
  const { user } = useAuth();
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isOwn = isUser && user?.id;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
  }, [message.content]);

  const getUserAvatar = () => {
    if (isSystem) {
      return (
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">SYS</span>
        </div>
      );
    }
    
    if (isUser) {
      return (
        <Avatar className="w-8 h-8">
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
      );
    }
    
    return (
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-medium">AI</span>
      </div>
    );
  };

  return (
    <div className={cn(
      'group flex w-full mb-4 animate-in slide-in-from-bottom-2 duration-300',
      isUser ? 'justify-end' : 'justify-start',
      className
    )}>
      <div className={cn(
        'flex space-x-3 max-w-[85%]',
        isUser && 'flex-row-reverse space-x-reverse'
      )}>
        {/* Avatar */}
        {showAvatar && !isUser && (
          <div className="flex-shrink-0">
            {getUserAvatar()}
          </div>
        )}
        
        {/* Message Content */}
        <div className={cn(
          'flex flex-col',
          isUser && 'items-end'
        )}>
          {/* Message Bubble */}
          <div className={cn(
            'relative rounded-lg px-4 py-3 shadow-sm',
            isUser 
              ? 'bg-blue-600 text-white' 
              : isSystem 
                ? 'bg-gray-100 text-gray-800 border'
                : 'bg-white border text-gray-800',
            message.status === 'failed' && 'border-red-300 bg-red-50'
          )}>
            {/* Message Actions */}
            <div className="absolute -top-2 right-2">
              <MessageActions
                message={message}
                onEdit={onEdit}
                onDelete={onDelete}
                onRetry={onRetry}
                onCopy={handleCopy}
              />
            </div>
            
            {/* Content */}
            <MessageContent 
              content={message.content} 
              type={message.metadata?.type}
            />
            
            {/* Metadata */}
            <MessageMetadata message={message} />
          </div>
          
          {/* Timestamp and Status */}
          {(showTimestamp || message.status) && (
            <div className={cn(
              'flex items-center space-x-2 mt-1 text-xs text-gray-500',
              isUser && 'flex-row-reverse space-x-reverse'
            )}>
              {showTimestamp && (
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
              <MessageStatus status={message.status} />
            </div>
          )}
        </div>
        
        {/* User Avatar (right side) */}
        {showAvatar && isUser && (
          <div className="flex-shrink-0">
            {getUserAvatar()}
          </div>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;