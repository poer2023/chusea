'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  variant?: 'determinate' | 'indeterminate';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  className?: string;
  barClassName?: string;
}

const sizeClasses = {
  small: 'h-1',
  medium: 'h-2',
  large: 'h-3',
};

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    value = 0,
    variant = 'determinate',
    size = 'medium',
    color = 'primary',
    showValue = false,
    className,
    barClassName,
    ...props 
  }, ref) => {
    const containerClasses = cn(
      'progress-bar',
      sizeClasses[size],
      'relative',
      className
    );

    const barClasses = cn(
      'progress-bar-fill',
      colorClasses[color],
      barClassName
    );

    if (variant === 'indeterminate') {
      return (
        <div ref={ref} className={containerClasses} {...props}>
          <div className={cn('progress-bar-indeterminate', sizeClasses[size])}>
            <div className={cn('absolute inset-0', colorClasses[color])} />
          </div>
          {showValue && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              Loading...
            </div>
          )}
        </div>
      );
    }

    const clampedValue = Math.max(0, Math.min(100, value));

    return (
      <div className="relative">
        <div ref={ref} className={containerClasses} {...props}>
          <div 
            className={barClasses}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {Math.round(clampedValue)}%
          </div>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
export type { ProgressBarProps };