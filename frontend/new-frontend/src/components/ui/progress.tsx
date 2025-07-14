'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value: number;
  /**
   * Maximum value (default: 100)
   */
  max?: number;
  /**
   * Progress size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color scheme
   */
  colorScheme?: 'primary' | 'success' | 'warning' | 'error';
  /**
   * Whether to show value as text
   */
  showValue?: boolean;
  /**
   * Custom label
   */
  label?: string;
  /**
   * Whether the progress is indeterminate (loading)
   */
  indeterminate?: boolean;
}

const progressSizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const progressColorClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 'md',
      colorScheme = 'primary',
      showValue = false,
      label,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Label and Value */}
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {showValue && !indeterminate && (
              <span className="text-sm text-muted-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div
          className={cn(
            'w-full rounded-full bg-muted overflow-hidden',
            progressSizeClasses[size]
          )}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemax={max}
          aria-valuemin={0}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              progressColorClasses[colorScheme],
              indeterminate && 'animate-pulse'
            )}
            style={{
              width: indeterminate ? '100%' : `${percentage}%`,
              transform: indeterminate ? 'translateX(-100%)' : undefined,
              animation: indeterminate ? 'progress-indeterminate 2s ease-in-out infinite' : undefined,
            }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value: number;
  /**
   * Maximum value (default: 100)
   */
  max?: number;
  /**
   * Size of the circular progress
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Color scheme
   */
  colorScheme?: 'primary' | 'success' | 'warning' | 'error';
  /**
   * Thickness of the progress ring
   */
  thickness?: number;
  /**
   * Whether to show value in center
   */
  showValue?: boolean;
  /**
   * Whether the progress is indeterminate (loading)
   */
  indeterminate?: boolean;
}

const circularSizes = {
  sm: { size: 40, strokeWidth: 4 },
  md: { size: 60, strokeWidth: 6 },
  lg: { size: 80, strokeWidth: 8 },
  xl: { size: 120, strokeWidth: 10 },
};

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 'md',
      colorScheme = 'primary',
      thickness,
      showValue = false,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const { size: circleSize, strokeWidth } = circularSizes[size];
    const radius = (circleSize - (thickness || strokeWidth)) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: circleSize, height: circleSize }}
        {...props}
      >
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={thickness || strokeWidth}
            fill="none"
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={thickness || strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
            className={cn(
              'transition-all duration-300 ease-in-out',
              {
                'text-primary': colorScheme === 'primary',
                'text-success': colorScheme === 'success',
                'text-warning': colorScheme === 'warning',
                'text-error': colorScheme === 'error',
              },
              indeterminate && 'animate-spin'
            )}
            style={{
              strokeDasharray: indeterminate ? `${circumference * 0.25} ${circumference}` : circumference,
            }}
          />
        </svg>

        {/* Center content */}
        {showValue && !indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';