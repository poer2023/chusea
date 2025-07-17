'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
};

const speedClasses = {
  slow: 'animate-spin-slow',
  normal: 'animate-spin',
  fast: 'animate-spin duration-500',
};

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    size = 'medium', 
    variant = 'spinner',
    speed = 'normal',
    className,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      sizeClasses[size],
      className
    );

    if (variant === 'spinner') {
      return (
        <div
          ref={ref}
          className={cn(
            baseClasses,
            speedClasses[speed],
            'border-2 border-gray-200 border-t-primary rounded-full'
          )}
          {...props}
        />
      );
    }

    if (variant === 'dots') {
      return (
        <div 
          ref={ref}
          className={cn('flex space-x-1', className)}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-primary rounded-full animate-bounce',
                sizeClasses[size].replace('w-', 'w-').replace('h-', 'h-'),
                `animation-delay-${i * 150}ms`
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div
          ref={ref}
          className={cn(
            baseClasses,
            'bg-primary rounded-full animate-pulse'
          )}
          {...props}
        />
      );
    }

    if (variant === 'bars') {
      return (
        <div 
          ref={ref}
          className={cn('flex items-end space-x-1', className)}
          {...props}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-primary animate-bounce',
                size === 'small' ? 'w-1 h-4' : size === 'medium' ? 'w-1.5 h-6' : 'w-2 h-8'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      );
    }

    return null;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
export type { LoadingSpinnerProps };