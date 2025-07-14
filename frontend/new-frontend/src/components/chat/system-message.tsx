'use client';

/**
 * System Message Component
 * Displays workflow updates, notifications, and system events
 */

import React from 'react';
import { ChatMessage } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Workflow,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Play,
  Pause,
  Square,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';

interface SystemMessageProps {
  message: ChatMessage;
  onAction?: (action: string, data?: any) => void;
  className?: string;
}

interface SystemMessageAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
}

const getSystemMessageConfig = (message: ChatMessage) => {
  const { metadata } = message;
  const type = metadata?.type;
  const workflowId = metadata?.workflowId;
  const stepId = metadata?.stepId;

  switch (type) {
    case 'workflow':
      return {
        icon: <Workflow className="w-5 h-5" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        title: 'Workflow Update',
        actions: [
          {
            id: 'view-workflow',
            label: 'View Workflow',
            icon: <ExternalLink className="w-3 h-3" />,
            variant: 'outline' as const,
          },
          ...(workflowId ? [{
            id: 'pause-workflow',
            label: 'Pause',
            icon: <Pause className="w-3 h-3" />,
            variant: 'ghost' as const,
          }] : []),
        ] as SystemMessageAction[],
      };

    case 'error':
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        title: 'Error',
        actions: [
          {
            id: 'retry',
            label: 'Retry',
            icon: <RefreshCw className="w-3 h-3" />,
            variant: 'outline' as const,
          },
        ] as SystemMessageAction[],
      };

    case 'command':
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        title: 'Command Executed',
        actions: [] as SystemMessageAction[],
      };

    default:
      return {
        icon: <Info className="w-5 h-5" />,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        iconColor: 'text-gray-600',
        title: 'System Message',
        actions: [] as SystemMessageAction[],
      };
  }
};

const WorkflowProgress: React.FC<{
  progress?: number;
  status?: string;
  currentStep?: string;
}> = ({ progress, status, currentStep }) => {
  if (!progress && !status && !currentStep) return null;

  return (
    <div className="mt-3 space-y-2">
      {progress !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {status && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {status === 'running' && <Play className="w-3 h-3 mr-1" />}
            {status === 'paused' && <Pause className="w-3 h-3 mr-1" />}
            {status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
            {status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
            {status}
          </Badge>
        </div>
      )}
      
      {currentStep && (
        <div className="text-xs text-gray-600">
          Current step: <span className="font-medium">{currentStep}</span>
        </div>
      )}
    </div>
  );
};

const DocumentInfo: React.FC<{
  documentId?: string;
  documentName?: string;
  action?: string;
}> = ({ documentId, documentName, action }) => {
  if (!documentId && !documentName) return null;

  return (
    <div className="mt-3 flex items-center space-x-3 p-3 bg-white border rounded-lg">
      <FileText className="w-4 h-4 text-gray-400" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {documentName || `Document ${documentId?.slice(-8)}`}
        </div>
        {action && (
          <div className="text-xs text-gray-500">
            Action: {action}
          </div>
        )}
      </div>
      <Button variant="ghost" size="sm">
        <ExternalLink className="w-3 h-3" />
      </Button>
    </div>
  );
};

const MessageActions: React.FC<{
  actions: SystemMessageAction[];
  onAction?: (action: string, data?: any) => void;
}> = ({ actions, onAction }) => {
  if (actions.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 mt-3">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || 'outline'}
          size="sm"
          onClick={() => onAction?.(action.id)}
          disabled={action.disabled}
          className="h-7 text-xs"
        >
          {action.icon}
          <span className="ml-1">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export const SystemMessage: React.FC<SystemMessageProps> = ({
  message,
  onAction,
  className,
}) => {
  const config = getSystemMessageConfig(message);
  const { metadata } = message;

  return (
    <div className={cn(
      'flex justify-center w-full mb-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
      className
    )}>
      <div className={cn(
        'max-w-[80%] rounded-lg border p-4',
        config.bgColor,
        config.borderColor
      )}>
        {/* Header */}
        <div className="flex items-start space-x-3">
          <div className={cn('flex-shrink-0', config.iconColor)}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900">
                {config.title}
              </h4>
              <div className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            {/* Message Content */}
            <div className="text-sm text-gray-700 mb-2">
              {message.content}
            </div>
            
            {/* Workflow-specific Info */}
            {metadata?.type === 'workflow' && (
              <WorkflowProgress
                progress={metadata.progress}
                status={metadata.status}
                currentStep={metadata.currentStep}
              />
            )}
            
            {/* Document-specific Info */}
            {metadata?.type === 'document' && (
              <DocumentInfo
                documentId={metadata.documentId}
                documentName={metadata.documentName}
                action={metadata.action}
              />
            )}
            
            {/* Metadata Tags */}
            {metadata && (
              <div className="flex items-center space-x-2 mt-2">
                {metadata.workflowId && (
                  <Badge variant="outline" className="text-xs">
                    Workflow: {metadata.workflowId.slice(-8)}
                  </Badge>
                )}
                {metadata.stepId && (
                  <Badge variant="outline" className="text-xs">
                    Step: {metadata.stepId}
                  </Badge>
                )}
                {metadata.commandType && (
                  <Badge variant="outline" className="text-xs">
                    Command: {metadata.commandType}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Actions */}
            <MessageActions actions={config.actions} onAction={onAction} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMessage;