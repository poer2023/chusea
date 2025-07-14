'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Whether clicking overlay closes modal
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether ESC key closes modal
   */
  closeOnEscape?: boolean;
  /**
   * Custom class for modal content
   */
  contentClassName?: string;
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  // Header-specific props can be added here in the future
}
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  // Body-specific props can be added here in the future
}
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  // Footer-specific props can be added here in the future
}

const modalSizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

const ModalBase = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      open,
      onClose,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      contentClassName,
      children,
      ...props
    },
    _ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape && open) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
      
      return undefined;
    }, [open, closeOnEscape, onClose]);

    // Focus management
    useEffect(() => {
      if (open) {
        previousFocusRef.current = document.activeElement as HTMLElement;
        modalRef.current?.focus();
      } else {
        previousFocusRef.current?.focus();
      }
    }, [open]);

    // Body scroll lock
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'unset';
        };
      }
      
      return undefined;
    }, [open]);

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    };

    if (!open) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'bg-black/50 backdrop-blur-sm',
          'animate-in fade-in-0 duration-200',
          className
        )}
        onClick={handleOverlayClick}
        {...props}
      >
        <div
          ref={modalRef}
          className={cn(
            'relative w-full bg-background rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            'focus:outline-none',
            modalSizeClasses[size],
            contentClassName
          )}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    );
  }
);

ModalBase.displayName = 'Modal';

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-6 border-b border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    >
      {children}
    </h2>
  );
});

ModalTitle.displayName = 'ModalTitle';

export const ModalCloseButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onClose: () => void }
>(({ className, onClose, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      className={cn(
        'rounded-sm opacity-70 ring-offset-background transition-opacity',
        'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:pointer-events-none',
        className
      )}
      {...props}
    >
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <span className="sr-only">Close</span>
    </button>
  );
});

ModalCloseButton.displayName = 'ModalCloseButton';

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-2 p-6 border-t border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

// Compound Modal component with all sub-components
const Modal = ModalBase as typeof ModalBase & {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  CloseButton: typeof ModalCloseButton;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
};

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.CloseButton = ModalCloseButton;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export { Modal };