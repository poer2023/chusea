'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';
import { Loading } from './loading';

export interface ActionButtonProps extends Omit<ButtonProps, 'loading'> {
  /**
   * Action type that determines styling and behavior
   */
  action?: 'create' | 'update' | 'delete' | 'cancel' | 'confirm' | 'retry' | 'skip';
  /**
   * Loading state with optional text
   */
  loading?: boolean | string;
  /**
   * Success state
   */
  success?: boolean;
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Confirmation required before action
   */
  requireConfirmation?: boolean;
  /**
   * Confirmation message
   */
  confirmationMessage?: string;
  /**
   * Callback when action is confirmed
   */
  onConfirm?: () => void;
  /**
   * Auto-reset success/error state after delay (in ms)
   */
  autoReset?: number;
  /**
   * Success message to show briefly
   */
  successMessage?: string;
  /**
   * Error message to show briefly
   */
  errorMessage?: string;
}

const actionStyles = {
  create: {
    variant: 'solid' as const,
    colorScheme: 'primary' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  update: {
    variant: 'solid' as const,
    colorScheme: 'primary' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  delete: {
    variant: 'solid' as const,
    colorScheme: 'error' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  cancel: {
    variant: 'outline' as const,
    colorScheme: 'secondary' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  confirm: {
    variant: 'solid' as const,
    colorScheme: 'success' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  retry: {
    variant: 'outline' as const,
    colorScheme: 'warning' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  skip: {
    variant: 'ghost' as const,
    colorScheme: 'secondary' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3m-4-6l3 3-3 3" />
      </svg>
    ),
  },
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      action,
      loading = false,
      success = false,
      error = false,
      requireConfirmation = false,
      confirmationMessage,
      onConfirm,
      autoReset,
      successMessage,
      errorMessage,
      children,
      onClick,
      leftIcon,
      variant,
      colorScheme,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const [localSuccess, setLocalSuccess] = React.useState(false);
    const [localError, setLocalError] = React.useState(false);
    const [stateMessage, setStateMessage] = React.useState<string>('');

    // Get action-specific styles
    const actionConfig = action ? actionStyles[action] : null;
    const finalVariant = variant || actionConfig?.variant || 'solid';
    const finalColorScheme = colorScheme || actionConfig?.colorScheme || 'primary';
    const actionIcon = actionConfig?.icon;

    // Handle success state
    React.useEffect(() => {
      if (success) {
        setLocalSuccess(true);
        if (successMessage) {
          setStateMessage(successMessage);
        }
        
        if (autoReset) {
          const timer = setTimeout(() => {
            setLocalSuccess(false);
            setStateMessage('');
          }, autoReset);
          return () => clearTimeout(timer);
        }
      }
    }, [success, successMessage, autoReset]);

    // Handle error state
    React.useEffect(() => {
      if (error) {
        setLocalError(true);
        if (errorMessage) {
          setStateMessage(errorMessage);
        }
        
        if (autoReset) {
          const timer = setTimeout(() => {
            setLocalError(false);
            setStateMessage('');
          }, autoReset);
          return () => clearTimeout(timer);
        }
      }
    }, [error, errorMessage, autoReset]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (requireConfirmation && !showConfirmation) {
        setShowConfirmation(true);
        return;
      }

      if (showConfirmation) {
        setShowConfirmation(false);
        onConfirm?.();
      }

      onClick?.(e);
    };

    const handleCancel = () => {
      setShowConfirmation(false);
    };

    // Determine current state
    const isLoading = Boolean(loading);
    const isSuccess = success || localSuccess;
    const isError = error || localError;
    const isDisabled = disabled || isLoading;

    // Determine button content
    let buttonContent = children;
    let buttonIcon = leftIcon || actionIcon;
    let buttonVariant = finalVariant;
    let buttonColorScheme = finalColorScheme;

    if (isLoading) {
      buttonContent = typeof loading === 'string' ? loading : buttonContent;
      buttonIcon = <Loading size="sm" variant="spinner" />;
    } else if (isSuccess) {
      buttonContent = stateMessage || buttonContent;
      buttonIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
      buttonColorScheme = 'success';
    } else if (isError) {
      buttonContent = stateMessage || buttonContent;
      buttonIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
      buttonColorScheme = 'error';
    } else if (showConfirmation) {
      buttonContent = confirmationMessage || `Confirm ${action || 'action'}?`;
      buttonIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      buttonColorScheme = 'warning';
    }

    if (showConfirmation) {
      return (
        <div className="flex items-center gap-2">
          <Button
            ref={ref}
            variant={buttonVariant}
            colorScheme={buttonColorScheme}
            leftIcon={buttonIcon}
            onClick={handleClick}
            disabled={isDisabled}
            className={cn('min-w-0', className)}
            {...props}
          >
            {buttonContent}
          </Button>
          <Button
            variant="ghost"
            colorScheme="secondary"
            size={props.size}
            onClick={handleCancel}
            disabled={isDisabled}
          >
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <Button
        ref={ref}
        variant={buttonVariant}
        colorScheme={buttonColorScheme}
        leftIcon={buttonIcon}
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          // Add transition for color changes
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {buttonContent}
      </Button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

// Predefined action buttons
export const CreateButton = forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'action'>>(
  (props, ref) => <ActionButton ref={ref} action="create" {...props} />
);
CreateButton.displayName = 'CreateButton';

export const UpdateButton = forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'action'>>(
  (props, ref) => <ActionButton ref={ref} action="update" {...props} />
);
UpdateButton.displayName = 'UpdateButton';

export const DeleteButton = forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'action'>>(
  (props, ref) => <ActionButton ref={ref} action="delete" requireConfirmation {...props} />
);
DeleteButton.displayName = 'DeleteButton';

export const CancelButton = forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'action'>>(
  (props, ref) => <ActionButton ref={ref} action="cancel" {...props} />
);
CancelButton.displayName = 'CancelButton';

export const ConfirmButton = forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'action'>>(
  (props, ref) => <ActionButton ref={ref} action="confirm" {...props} />
);
ConfirmButton.displayName = 'ConfirmButton';

export const RetryButton = forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'action'>>(
  (props, ref) => <ActionButton ref={ref} action="retry" {...props} />
);
RetryButton.displayName = 'RetryButton';

export const SkipButton = forwardRef<HTMLButtonElement, Omit<ActionButtonProps, 'action'>>(
  (props, ref) => <ActionButton ref={ref} action="skip" {...props} />
);
SkipButton.displayName = 'SkipButton';