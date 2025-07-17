'use client';

import { ReactNode, forwardRef, HTMLAttributes, useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { animationConfig, workflowAnimations, type WorkflowStatus } from './animation-config';
import { useReducedMotion, useAnimationPerformance } from './hooks';

// Node Status Animation Component
interface WorkflowNodeProps extends HTMLAttributes<HTMLDivElement> {
  status: 'pending' | 'running' | 'pass' | 'fail';
  children: ReactNode;
  animateStatusChange?: boolean;
  className?: string;
}

const getStatusClasses = (status: WorkflowStatus, isAnimating: boolean, prefersReducedMotion: boolean) => {
  const baseClasses = {
    pending: 'node-pending',
    running: 'node-running',
    pass: 'node-pass', 
    fail: 'node-fail',
    cancelled: 'node-cancelled',
  };
  
  if (prefersReducedMotion) {
    return baseClasses[status];
  }
  
  const animationClasses = {
    pending: '',
    running: 'animate-pulse-subtle',
    pass: isAnimating ? 'animate-scale-in' : '',
    fail: isAnimating ? 'animate-shake' : '',
    cancelled: '',
  };
  
  return cn(baseClasses[status], animationClasses[status]);
};

const WorkflowNode = forwardRef<HTMLDivElement, WorkflowNodeProps>(
  ({ 
    status, 
    children, 
    animateStatusChange = true,
    className,
    ...props 
  }, ref) => {
    const [previousStatus, setPreviousStatus] = useState(status);
    const [isChanging, setIsChanging] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const { isLowPerformance } = useAnimationPerformance();

    useEffect(() => {
      if (animateStatusChange && status !== previousStatus && !prefersReducedMotion && !isLowPerformance) {
        setIsChanging(true);
        const duration = animationConfig.workflow.statusChange.duration;
        const timer = setTimeout(() => {
          setIsChanging(false);
          setPreviousStatus(status);
        }, duration);
        return () => clearTimeout(timer);
      } else {
        setPreviousStatus(status);
      }
      return undefined;
    }, [status, previousStatus, animateStatusChange, prefersReducedMotion, isLowPerformance]);

    const statusClasses = useMemo(() => 
      getStatusClasses(status, isChanging, prefersReducedMotion), 
      [status, isChanging, prefersReducedMotion]
    );

    const animationStyle = useMemo(() => {
      if (prefersReducedMotion || isLowPerformance) {
        return {};
      }
      
      const config = workflowAnimations[status];
      return {
        ...config.style,
        ...(animationConfig.performance.useGPUAcceleration && {
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
        }),
      };
    }, [status, prefersReducedMotion, isLowPerformance]);

    const classes = cn(
      'transition-all duration-300 ease-in-out',
      'rounded-lg p-4 border-2',
      statusClasses,
      isChanging && !prefersReducedMotion && 'status-change',
      animationConfig.performance.useGPUAcceleration && 'gpu-accelerated',
      className
    );

    return (
      <div 
        ref={ref} 
        className={classes} 
        style={animationStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

WorkflowNode.displayName = 'WorkflowNode';

// Connection Line Animation Component
interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  status?: 'pending' | 'active' | 'completed';
  animated?: boolean;
  className?: string;
}

const ConnectionLine = forwardRef<SVGSVGElement, ConnectionLineProps>(
  ({ 
    from, 
    to, 
    status = 'pending',
    animated = true,
    className,
    ...props 
  }, ref) => {
    const strokeClasses = {
      pending: 'stroke-gray-300',
      active: 'stroke-primary',
      completed: 'stroke-success',
    };

    // Calculate SVG viewBox to contain the line
    const minX = Math.min(from.x, to.x) - 10;
    const minY = Math.min(from.y, to.y) - 10;
    const width = Math.abs(to.x - from.x) + 20;
    const height = Math.abs(to.y - from.y) + 20;

    return (
      <svg
        ref={ref}
        className={cn('absolute top-0 left-0 pointer-events-none', className)}
        viewBox={`${minX} ${minY} ${width} ${height}`}
        style={{ 
          width: '100%', 
          height: '100%',
          overflow: 'visible'
        }}
        {...props}
      >
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          className={cn(
            'stroke-2',
            strokeClasses[status],
            animated && status === 'active' && 'connection-line'
          )}
          strokeDasharray={animated && status === 'active' ? '5,5' : 'none'}
        />
        {status === 'active' && (
          <circle
            cx={from.x}
            cy={from.y}
            r="3"
            className="fill-primary animate-ping-slow"
          />
        )}
      </svg>
    );
  }
);

ConnectionLine.displayName = 'ConnectionLine';

// Progress Indicator for Workflow Steps
interface WorkflowProgressProps extends HTMLAttributes<HTMLDivElement> {
  steps: Array<{
    id: string;
    label: string;
    status: 'pending' | 'current' | 'completed' | 'failed';
  }>;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

const WorkflowProgress = forwardRef<HTMLDivElement, WorkflowProgressProps>(
  ({ 
    steps,
    orientation = 'horizontal',
    showLabels = true,
    className,
    ...props 
  }, ref) => {
    const containerClasses = cn(
      'flex',
      orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
      className
    );

    const getStepClasses = (status: string) => {
      const baseClasses = 'rounded-full flex items-center justify-center font-medium text-sm';
      const sizeClasses = 'w-8 h-8';
      
      switch (status) {
        case 'completed':
          return cn(baseClasses, sizeClasses, 'bg-success text-white');
        case 'current':
          return cn(baseClasses, sizeClasses, 'bg-primary text-white animate-pulse-slow');
        case 'failed':
          return cn(baseClasses, sizeClasses, 'bg-error text-white');
        default:
          return cn(baseClasses, sizeClasses, 'bg-gray-200 text-gray-600');
      }
    };

    const getConnectorClasses = (prevStatus: string, currentStatus: string) => {
      const baseClasses = orientation === 'horizontal' ? 'h-0.5 flex-1' : 'w-0.5 h-8';
      
      if (prevStatus === 'completed') {
        return cn(baseClasses, 'bg-success');
      } else if (prevStatus === 'current' || currentStatus === 'current') {
        return cn(baseClasses, 'bg-primary animate-progress-indeterminate');
      } else {
        return cn(baseClasses, 'bg-gray-200');
      }
    };

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {steps.map((step, index) => (
          <div key={step.id} className={cn('flex items-center', orientation === 'vertical' && 'flex-col')}>
            <div className="relative">
              <div className={getStepClasses(step.status)}>
                {step.status === 'completed' ? '✓' : index + 1}
              </div>
              {showLabels && (
                <div className={cn(
                  'absolute text-xs font-medium whitespace-nowrap',
                  orientation === 'horizontal' ? 'top-10 left-1/2 -translate-x-1/2' : 'left-10 top-1/2 -translate-y-1/2'
                )}>
                  {step.label}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={getConnectorClasses(step.status, steps[index + 1].status)} />
            )}
          </div>
        ))}
      </div>
    );
  }
);

WorkflowProgress.displayName = 'WorkflowProgress';

// Data Loading State Animation
interface DataLoadingProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'skeleton' | 'shimmer' | 'pulse';
  lines?: number;
  className?: string;
}

const DataLoading = forwardRef<HTMLDivElement, DataLoadingProps>(
  ({ 
    variant = 'skeleton',
    lines = 3,
    className,
    ...props 
  }, ref) => {
    if (variant === 'skeleton') {
      return (
        <div ref={ref} className={cn('space-y-3', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className={cn(
                'h-4 bg-gray-200 rounded',
                i === lines - 1 ? 'w-3/4' : 'w-full'
              )} />
            </div>
          ))}
        </div>
      );
    }

    if (variant === 'shimmer') {
      return (
        <div ref={ref} className={cn('space-y-3', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="relative overflow-hidden bg-gray-200 rounded h-4">
              <div className="absolute inset-0 -translate-x-full animate-progress-indeterminate bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }
);

DataLoading.displayName = 'DataLoading';

export { 
  WorkflowNode, 
  ConnectionLine, 
  WorkflowProgress, 
  DataLoading,
  type WorkflowNodeProps,
  type ConnectionLineProps,
  type WorkflowProgressProps,
  type DataLoadingProps
};