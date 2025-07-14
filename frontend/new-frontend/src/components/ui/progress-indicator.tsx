'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Progress, CircularProgress } from './progress';
import { StatusBadge } from './badge';

export interface ProgressStep {
  /**
   * Unique identifier for the step
   */
  id: string;
  /**
   * Step title
   */
  title: string;
  /**
   * Step description
   */
  description?: string;
  /**
   * Step status
   */
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  /**
   * Progress percentage for running steps
   */
  progress?: number;
  /**
   * Optional icon for the step
   */
  icon?: React.ReactNode;
  /**
   * Error message if step failed
   */
  errorMessage?: string;
  /**
   * Whether step is optional
   */
  optional?: boolean;
}

export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of progress steps
   */
  steps: ProgressStep[];
  /**
   * Current active step index
   */
  currentStep?: number;
  /**
   * Orientation of the progress indicator
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show progress percentage
   */
  showProgress?: boolean;
  /**
   * Whether to show step descriptions
   */
  showDescriptions?: boolean;
  /**
   * Whether to show completion indicators
   */
  showCompletionStatus?: boolean;
  /**
   * Custom step renderer
   */
  renderStep?: (step: ProgressStep, index: number, isActive: boolean) => React.ReactNode;
}

const stepSizeClasses = {
  sm: {
    container: 'gap-2',
    step: 'w-6 h-6 text-xs',
    title: 'text-sm',
    description: 'text-xs',
    line: 'h-0.5',
  },
  md: {
    container: 'gap-4',
    step: 'w-8 h-8 text-sm',
    title: 'text-base',
    description: 'text-sm',
    line: 'h-0.5',
  },
  lg: {
    container: 'gap-6',
    step: 'w-10 h-10 text-base',
    title: 'text-lg',
    description: 'text-base',
    line: 'h-1',
  },
};

const statusColors = {
  pending: 'bg-muted text-muted-foreground border-muted',
  running: 'bg-primary text-white border-primary',
  success: 'bg-success text-white border-success',
  error: 'bg-error text-white border-error',
  skipped: 'bg-muted text-muted-foreground border-muted',
};

const StepIcon = ({ step, index, size }: { step: ProgressStep; index: number; size: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = stepSizeClasses[size].step;
  
  if (step.icon) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full border-2',
        sizeClass,
        statusColors[step.status]
      )}>
        {step.icon}
      </div>
    );
  }

  // Default icons based on status
  const defaultIcon = () => {
    switch (step.status) {
      case 'success':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'running':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'skipped':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return <span className="font-semibold">{index + 1}</span>;
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full border-2',
      sizeClass,
      statusColors[step.status]
    )}>
      {defaultIcon()}
    </div>
  );
};

export const ProgressIndicator = forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  (
    {
      className,
      steps,
      currentStep = 0,
      orientation = 'horizontal',
      size = 'md',
      showProgress = true,
      showDescriptions = true,
      showCompletionStatus = true,
      renderStep,
      ...props
    },
    ref
  ) => {
    const sizeConfig = stepSizeClasses[size];
    const isHorizontal = orientation === 'horizontal';

    const renderStepContent = (step: ProgressStep, index: number) => {
      const isActive = index === currentStep;
      const isCompleted = index < currentStep || step.status === 'success';
      const hasError = step.status === 'error';

      if (renderStep) {
        return renderStep(step, index, isActive);
      }

      return (
        <div className={cn(
          'flex items-center',
          isHorizontal ? 'flex-col text-center' : 'flex-row space-x-3'
        )}>
          <StepIcon step={step} index={index} size={size} />
          
          <div className={cn(
            'flex flex-col',
            isHorizontal ? 'items-center mt-2' : 'flex-1'
          )}>
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-medium',
                sizeConfig.title,
                isActive ? 'text-foreground' : 'text-muted-foreground',
                hasError && 'text-error'
              )}>
                {step.title}
                {step.optional && (
                  <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                )}
              </h3>
              
              {showCompletionStatus && (
                <StatusBadge 
                  status={step.status === 'skipped' ? 'idle' : step.status}
                  size="sm"
                />
              )}
            </div>
            
            {showDescriptions && step.description && (
              <p className={cn(
                'mt-1',
                sizeConfig.description,
                'text-muted-foreground'
              )}>
                {step.description}
              </p>
            )}
            
            {hasError && step.errorMessage && (
              <p className={cn(
                'mt-1',
                sizeConfig.description,
                'text-error'
              )}>
                {step.errorMessage}
              </p>
            )}
            
            {showProgress && step.status === 'running' && step.progress !== undefined && (
              <div className={cn('mt-2', isHorizontal ? 'w-full' : 'w-32')}>
                <Progress 
                  value={step.progress} 
                  size={size === 'lg' ? 'md' : 'sm'}
                  showValue
                />
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderConnector = (index: number) => {
      if (index === steps.length - 1) return null;
      
      const nextStep = steps[index + 1];
      const isCompleted = index < currentStep;
      const isNextCompleted = index + 1 < currentStep || nextStep?.status === 'success';
      
      return (
        <div className={cn(
          'flex-1',
          isHorizontal ? 'h-0.5 mx-4' : 'w-0.5 my-4 ml-4',
          sizeConfig.line,
          isCompleted || isNextCompleted ? 'bg-success' : 'bg-muted'
        )} />
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          isHorizontal ? 'flex-row items-start' : 'flex-col',
          sizeConfig.container,
          className
        )}
        {...props}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={cn(
              isHorizontal ? 'flex-1' : 'flex items-start'
            )}>
              {renderStepContent(step, index)}
            </div>
            {isHorizontal && renderConnector(index)}
            {!isHorizontal && renderConnector(index)}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

ProgressIndicator.displayName = 'ProgressIndicator';

// Simplified workflow progress component
export interface WorkflowProgressProps extends Omit<ProgressIndicatorProps, 'steps'> {
  /**
   * Total number of steps
   */
  totalSteps: number;
  /**
   * Current step (1-based)
   */
  currentStep: number;
  /**
   * Overall progress percentage
   */
  progress?: number;
  /**
   * Current step title
   */
  currentStepTitle?: string;
  /**
   * Show as circular progress
   */
  circular?: boolean;
}

export const WorkflowProgress = forwardRef<HTMLDivElement, WorkflowProgressProps>(
  (
    {
      totalSteps,
      currentStep,
      progress,
      currentStepTitle,
      circular = false,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const progressPercentage = progress ?? Math.round(((currentStep - 1) / totalSteps) * 100);

    if (circular) {
      return (
        <div 
          ref={ref}
          className={cn('flex flex-col items-center gap-4', className)}
          {...props}
        >
          <CircularProgress
            value={progressPercentage}
            size={size}
            showValue
            colorScheme="primary"
          />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {totalSteps}
            </p>
            {currentStepTitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {currentStepTitle}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div 
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {currentStepTitle || `Step ${currentStep} of ${totalSteps}`}
          </span>
          <span className="text-sm text-muted-foreground">
            {progressPercentage}%
          </span>
        </div>
        <Progress
          value={progressPercentage}
          size={size}
          colorScheme="primary"
        />
      </div>
    );
  }
);

WorkflowProgress.displayName = 'WorkflowProgress';