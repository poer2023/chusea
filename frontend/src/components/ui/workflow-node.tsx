'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './badge';

export interface WorkflowNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Node status
   */
  status: 'pending' | 'running' | 'success' | 'error' | 'idle';
  /**
   * Node title
   */
  title: string;
  /**
   * Node description
   */
  description?: string;
  /**
   * Node type/category
   */
  type?: string;
  /**
   * Whether the node is selected
   */
  selected?: boolean;
  /**
   * Whether the node is clickable
   */
  interactive?: boolean;
  /**
   * Callback when node is clicked
   */
  onClick?: () => void;
  /**
   * Icon to display in the node
   */
  icon?: React.ReactNode;
  /**
   * Additional metadata to display
   */
  metadata?: Record<string, string | number>;
  /**
   * Duration or timestamp information
   */
  duration?: string;
  /**
   * Progress percentage (0-100) for running nodes
   */
  progress?: number;
}

const statusColorClasses = {
  pending: 'border-node-pending bg-node-pending',
  running: 'border-node-running bg-node-running',
  success: 'border-node-pass bg-node-pass',
  error: 'border-node-fail bg-node-fail',
  idle: 'border-border bg-muted',
};

const statusIconClasses = {
  pending: 'text-yellow-600',
  running: 'text-blue-600',
  success: 'text-green-600',
  error: 'text-red-600',
  idle: 'text-gray-500',
};

const DefaultIcon = ({ status }: { status: WorkflowNodeProps['status'] }) => {
  switch (status) {
    case 'pending':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      );
    case 'running':
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    case 'success':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
        </svg>
      );
  }
};

export const WorkflowNode = forwardRef<HTMLDivElement, WorkflowNodeProps>(
  (
    {
      className,
      status,
      title,
      description,
      type,
      selected = false,
      interactive = false,
      onClick,
      icon,
      metadata,
      duration,
      progress,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (interactive && onClick) {
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border-2 p-4 transition-all duration-200',
          statusColorClasses[status],
          interactive && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
          selected && 'ring-2 ring-ring ring-offset-2',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn('flex-shrink-0', statusIconClasses[status])}>
              {icon || <DefaultIcon status={status} />}
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">{title}</h3>
              {type && (
                <p className="text-xs text-muted-foreground">{type}</p>
              )}
            </div>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}

        {/* Progress Bar for Running Status */}
        {status === 'running' && progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="space-y-1 mb-3">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <span className="text-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {duration && (
          <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-3">
            <span>Duration</span>
            <span>{duration}</span>
          </div>
        )}
      </div>
    );
  }
);

WorkflowNode.displayName = 'WorkflowNode';