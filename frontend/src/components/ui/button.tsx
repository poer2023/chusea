'use client';

import React, { forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Button visual variant
   */
  variant?: 'default' | 'solid' | 'outline' | 'ghost' | 'link';
  /**
   * Button color scheme
   */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon element to display before text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon element to display after text
   */
  rightIcon?: React.ReactNode;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
  /**
   * ARIA describedby for accessibility
   */
  'aria-describedby'?: string;
  /**
   * Render as a child component (for composition with other components)
   */
  asChild?: boolean;
}

const buttonSizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  xl: 'h-12 px-8 text-base',
};

const buttonVariantClasses = {
  default: {
    primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/95',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/95',
    success: 'bg-success text-white hover:bg-success/90 active:bg-success/95',
    warning: 'bg-warning text-white hover:bg-warning/90 active:bg-warning/95',
    error: 'bg-error text-white hover:bg-error/90 active:bg-error/95',
  },
  solid: {
    primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/95',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/95',
    success: 'bg-success text-white hover:bg-success/90 active:bg-success/95',
    warning: 'bg-warning text-white hover:bg-warning/90 active:bg-warning/95',
    error: 'bg-error text-white hover:bg-error/90 active:bg-error/95',
  },
  outline: {
    primary: 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white',
    secondary: 'border border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white',
    success: 'border border-success text-success bg-transparent hover:bg-success hover:text-white',
    warning: 'border border-warning text-warning bg-transparent hover:bg-warning hover:text-white',
    error: 'border border-error text-error bg-transparent hover:bg-error hover:text-white',
  },
  ghost: {
    primary: 'text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20',
    secondary: 'text-secondary bg-transparent hover:bg-secondary/10 active:bg-secondary/20',
    success: 'text-success bg-transparent hover:bg-success/10 active:bg-success/20',
    warning: 'text-warning bg-transparent hover:bg-warning/10 active:bg-warning/20',
    error: 'text-error bg-transparent hover:bg-error/10 active:bg-error/20',
  },
  link: {
    primary: 'text-primary bg-transparent hover:underline p-0 h-auto',
    secondary: 'text-secondary bg-transparent hover:underline p-0 h-auto',
    success: 'text-success bg-transparent hover:underline p-0 h-auto',
    warning: 'text-warning bg-transparent hover:underline p-0 h-auto',
    error: 'text-error bg-transparent hover:underline p-0 h-auto',
  },
};

const LoadingSpinner = memo(({ size }: { size: ButtonProps['size'] }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size || 'md'])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      colorScheme = 'primary',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonClasses = cn(
      // Base styles
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      // Size classes
      buttonSizeClasses[size],
      // Variant and color classes
      buttonVariantClasses[variant][colorScheme],
      // Width classes
      fullWidth && 'w-full',
      className
    );

    const buttonContent = (
      <>
        {loading && <LoadingSpinner size={size} />}
        {!loading && leftIcon && (
          <span className="flex items-center">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        className: cn(buttonClasses, (children.props as any).className),
        ref,
        disabled: isDisabled,
        'aria-label': props['aria-label'],
        'aria-describedby': props['aria-describedby'],
        'aria-disabled': isDisabled,
      } as any);
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={buttonClasses}
        aria-label={props['aria-label']}
        aria-describedby={props['aria-describedby']}
        aria-disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';