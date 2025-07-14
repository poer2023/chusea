'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Badge visual variant
   */
  variant?: 'default' | 'secondary' | 'solid' | 'outline' | 'soft';
  /**
   * Badge color scheme
   */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  /**
   * Badge size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Icon element to display before text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon element to display after text
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the badge is removable (shows close button)
   */
  removable?: boolean;
  /**
   * Callback when badge is removed
   */
  onRemove?: () => void;
}

const badgeSizeClasses = {
  sm: 'h-5 px-2 text-xs',
  md: 'h-6 px-2.5 text-xs',
  lg: 'h-7 px-3 text-sm',
};

const badgeVariantClasses = {
  default: {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    neutral: 'bg-foreground text-background',
  },
  secondary: {
    primary: 'bg-muted text-muted-foreground',
    secondary: 'bg-muted text-muted-foreground',
    success: 'bg-muted text-muted-foreground',
    warning: 'bg-muted text-muted-foreground',
    error: 'bg-muted text-muted-foreground',
    neutral: 'bg-muted text-muted-foreground',
  },
  solid: {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    neutral: 'bg-foreground text-background',
  },
  outline: {
    primary: 'border border-primary text-primary bg-transparent',
    secondary: 'border border-secondary text-secondary bg-transparent',
    success: 'border border-success text-success bg-transparent',
    warning: 'border border-warning text-warning bg-transparent',
    error: 'border border-error text-error bg-transparent',
    neutral: 'border border-border text-foreground bg-transparent',
  },
  soft: {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    neutral: 'bg-muted text-muted-foreground',
  },
};

const CloseIcon = ({ size }: { size: BadgeProps['size'] }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <svg
      className={cn('cursor-pointer hover:opacity-70', sizeClasses[size || 'md'])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      colorScheme = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1 font-medium rounded-full transition-colors',
          // Size classes
          badgeSizeClasses[size],
          // Variant and color classes
          badgeVariantClasses[variant][colorScheme],
          className
        )}
        {...props}
      >
        {leftIcon && <span className="flex items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="ml-1 flex items-center"
            aria-label="Remove badge"
          >
            <CloseIcon size={size} />
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge - specialized badge for workflow states
export interface StatusBadgeProps extends Omit<BadgeProps, 'colorScheme'> {
  /**
   * Status type that maps to predefined colors
   */
  status: 'pending' | 'running' | 'success' | 'error' | 'warning' | 'idle';
}

const statusColorMap = {
  pending: 'neutral' as const,
  running: 'primary' as const,
  success: 'success' as const,
  error: 'error' as const,
  warning: 'warning' as const,
  idle: 'secondary' as const,
};

export const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        colorScheme={statusColorMap[status]}
        {...props}
      >
        {children || status}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';