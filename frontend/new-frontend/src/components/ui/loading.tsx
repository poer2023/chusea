'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Loading spinner size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Loading spinner variant
   */
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'bars';
  /**
   * Color scheme
   */
  colorScheme?: 'primary' | 'secondary' | 'neutral';
  /**
   * Text to display with the loading spinner
   */
  text?: string;
  /**
   * Whether to show as overlay (fixed position)
   */
  overlay?: boolean;
  /**
   * Custom speed (in seconds)
   */
  speed?: number;
}

const loadingSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const loadingColorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary', 
  neutral: 'text-muted-foreground',
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

// Spinner Component
const SpinnerIcon = ({ className }: { className: string }) => (
  <svg className={cn('animate-spin', className)} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Dots Component
const DotsIcon = ({ className, speed = 1.4 }: { className: string; speed?: number }) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-current rounded-full animate-bounce"
        style={{
          animationDelay: `${i * 0.1}s`,
          animationDuration: `${speed}s`,
        }}
      />
    ))}
  </div>
);

// Pulse Component
const PulseIcon = ({ className, speed = 2 }: { className: string; speed?: number }) => (
  <div
    className={cn('bg-current rounded-full animate-pulse', className)}
    style={{
      animationDuration: `${speed}s`,
    }}
  />
);

// Bounce Component
const BounceIcon = ({ className, speed = 1 }: { className: string; speed?: number }) => (
  <div
    className={cn('bg-current rounded-full animate-bounce', className)}
    style={{
      animationDuration: `${speed}s`,
    }}
  />
);

// Bars Component
const BarsIcon = ({ className, speed = 1.2 }: { className: string; speed?: number }) => (
  <div className={cn('flex space-x-1 items-end', className)}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-current animate-pulse"
        style={{
          width: '3px',
          height: `${8 + (i % 2) * 4}px`,
          animationDelay: `${i * 0.1}s`,
          animationDuration: `${speed}s`,
        }}
      />
    ))}
  </div>
);

export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      className,
      size = 'md',
      variant = 'spinner',
      colorScheme = 'primary',
      text,
      overlay = false,
      speed = 1,
      ...props
    },
    ref
  ) => {
    const renderIcon = () => {
      const iconClassName = cn(
        loadingSizeClasses[size],
        loadingColorClasses[colorScheme]
      );

      switch (variant) {
        case 'spinner':
          return <SpinnerIcon className={iconClassName} />;
        case 'dots':
          return <DotsIcon className={iconClassName} speed={speed} />;
        case 'pulse':
          return <PulseIcon className={iconClassName} speed={speed} />;
        case 'bounce':
          return <BounceIcon className={iconClassName} speed={speed} />;
        case 'bars':
          return <BarsIcon className={iconClassName} speed={speed} />;
        default:
          return <SpinnerIcon className={iconClassName} />;
      }
    };

    const content = (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        {renderIcon()}
        {text && (
          <span
            className={cn(
              'font-medium',
              textSizeClasses[size],
              loadingColorClasses[colorScheme]
            )}
          >
            {text}
          </span>
        )}
      </div>
    );

    if (overlay) {
      return (
        <div
          ref={ref}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-background/80 backdrop-blur-sm',
            className
          )}
          {...props}
        >
          <div className="p-4 rounded-lg bg-background shadow-lg border border-border">
            {content}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} {...props}>
        {content}
      </div>
    );
  }
);

Loading.displayName = 'Loading';

// Specialized loading components
export interface LoadingSpinnerProps extends Omit<LoadingProps, 'variant'> {
  // Spinner-specific props can be added here
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (props, ref) => {
    return <Loading ref={ref} variant="spinner" {...props} />;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export interface LoadingDotsProps extends Omit<LoadingProps, 'variant'> {
  // Dots-specific props can be added here
}

export const LoadingDots = forwardRef<HTMLDivElement, LoadingDotsProps>(
  (props, ref) => {
    return <Loading ref={ref} variant="dots" {...props} />;
  }
);

LoadingDots.displayName = 'LoadingDots';

export interface LoadingOverlayProps extends Omit<LoadingProps, 'overlay'> {
  // Overlay-specific props can be added here
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (props, ref) => {
    return <Loading ref={ref} overlay={true} {...props} />;
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Inline loading component for buttons
export interface InlineLoadingProps extends Omit<LoadingProps, 'text' | 'overlay'> {
  /**
   * Whether to show loading state
   */
  loading?: boolean;
  /**
   * Content to show when not loading
   */
  children?: React.ReactNode;
}

export const InlineLoading = forwardRef<HTMLDivElement, InlineLoadingProps>(
  ({ loading = false, children, size = 'sm', ...props }, ref) => {
    if (loading) {
      return <Loading ref={ref} size={size} {...props} />;
    }

    return <>{children}</>;
  }
);

InlineLoading.displayName = 'InlineLoading';