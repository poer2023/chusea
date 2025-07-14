'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visual state of the input
   */
  state?: 'default' | 'error' | 'warning' | 'success';
  /**
   * Icon element to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon element to display on the right side
   */
  rightIcon?: React.ReactNode;
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Whether the input is required
   */
  required?: boolean;
  /**
   * Full width input
   */
  fullWidth?: boolean;
}

const inputSizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-11 px-4 text-base',
};

const inputStateClasses = {
  default: 'border-border focus:ring-ring',
  error: 'border-error focus:ring-error',
  warning: 'border-warning focus:ring-warning',
  success: 'border-success focus:ring-success',
};

const helperTextStateClasses = {
  default: 'text-muted-foreground',
  error: 'text-error',
  warning: 'text-warning',
  success: 'text-success',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      state = 'default',
      leftIcon,
      rightIcon,
      helperText,
      label,
      required = false,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            id={inputId}
            disabled={disabled}
            className={cn(
              // Base styles
              'flex w-full rounded-md border bg-input font-normal transition-colors',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Size classes
              inputSizeClasses[size],
              // State classes
              inputStateClasses[state],
              // Icon padding adjustments
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && (
          <p className={cn('text-xs', helperTextStateClasses[state])}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Specialized input components
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    return <Input ref={ref} type="password" {...props} />;
  }
);

PasswordInput.displayName = 'PasswordInput';

export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    return <Input ref={ref} type="email" {...props} />;
  }
);

EmailInput.displayName = 'EmailInput';

export const NumberInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    return <Input ref={ref} type="number" {...props} />;
  }
);

NumberInput.displayName = 'NumberInput';

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    const SearchIcon = () => (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<SearchIcon />}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';