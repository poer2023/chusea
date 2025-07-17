'use client';

import React, { ReactNode, forwardRef, HTMLAttributes, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Animated Button Component
interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-white hover:bg-secondary/90',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-primary hover:bg-primary/10',
};

const sizeClasses = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg',
};

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    className,
    ...props 
  }, ref) => {
    const classes = cn(
      'relative inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'active:scale-95',
      'hover:transform hover:-translate-y-0.5 hover:shadow-lg',
      variantClasses[variant],
      sizeClasses[size],
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
      loading && 'pointer-events-none',
      className
    );

    return (
      <button 
        ref={ref} 
        className={classes} 
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {children}
        </span>
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Animated Card Component
interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    children, 
    hoverable = true,
    clickable = false,
    className,
    ...props 
  }, ref) => {
    const classes = cn(
      'rounded-lg border bg-background p-6',
      'transition-all duration-200 ease-in-out',
      hoverable && 'hover-lift',
      clickable && 'cursor-pointer',
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Modal Animation Component
interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  overlayClassName?: string;
}

const sizeClassesModal = {
  small: 'max-w-md',
  medium: 'max-w-lg',
  large: 'max-w-2xl',
  full: 'max-w-7xl',
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    isOpen,
    onClose,
    children,
    size = 'medium',
    className,
    overlayClassName,
    ...props 
  }, ref) => {
    if (!isOpen) return null;

    return (
      <div 
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'animate-fade-in'
        )}
      >
        {/* Overlay */}
        <div 
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm',
            'animate-fade-in',
            overlayClassName
          )}
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div 
          ref={ref}
          className={cn(
            'relative bg-background rounded-lg shadow-xl max-h-[90vh] overflow-auto',
            'animate-scale-in',
            sizeClassesModal[size],
            'mx-4 w-full',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

// Toast Notification Component
interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  isVisible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

const toastTypeClasses = {
  success: 'bg-success text-white',
  error: 'bg-error text-white',
  warning: 'bg-warning text-white',
  info: 'bg-primary text-white',
};

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    isVisible,
    type = 'info',
    children,
    className,
    ...props 
  }, ref) => {
    if (!isVisible) return null;

    return (
      <div 
        ref={ref}
        className={cn(
          'fixed top-4 right-4 z-50',
          'px-4 py-3 rounded-lg shadow-lg',
          'toast-enter',
          toastTypeClasses[type],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Animated Input Component
interface AnimatedInputProps extends HTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ 
    label,
    error,
    className,
    inputClassName,
    ...props 
  }, ref) => {
    return (
      <div className={cn('relative', className)}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input 
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'hover:border-primary/50',
            error && 'border-error focus:ring-error',
            inputClassName
          )}
          {...props}
        />
        {error && (
          <div className="mt-1 text-sm text-error animate-fade-in-up">
            {error}
          </div>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

// Page Transition Component
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <div className={cn('animate-fade-in-up', className)}>
      {children}
    </div>
  );
};

// Stagger Container for animating children with delays
interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  staggerDelay?: number; // in milliseconds
  className?: string;
}

const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ 
    children,
    staggerDelay = 100,
    className,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {React.Children.map(children, (child, index) => (
          <div 
            style={{ animationDelay: `${index * staggerDelay}ms` }}
            className="animate-fade-in-up"
          >
            {child}
          </div>
        ))}
      </div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

export { 
  AnimatedButton,
  AnimatedCard,
  Modal,
  Toast,
  AnimatedInput,
  PageTransition,
  StaggerContainer,
  type AnimatedButtonProps,
  type AnimatedCardProps,
  type ModalProps,
  type ToastProps,
  type AnimatedInputProps,
  type PageTransitionProps,
  type StaggerContainerProps
};