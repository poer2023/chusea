'use client';

import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the dropdown is open
   */
  open?: boolean;
  /**
   * Callback when dropdown open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Position of the dropdown relative to trigger
   */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /**
   * Trigger element
   */
  trigger: React.ReactNode;
  /**
   * Whether to close dropdown when clicking outside
   */
  closeOnClickOutside?: boolean;
  /**
   * Whether to close dropdown when pressing escape
   */
  closeOnEscape?: boolean;
}

export interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icon to display before the item text
   */
  icon?: React.ReactNode;
  /**
   * Whether the item is destructive (danger style)
   */
  destructive?: boolean;
  /**
   * Whether the item is disabled
   */
  disabled?: boolean;
}

export interface DropdownSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Separator-specific props can be added here in the future
}

const placementClasses = {
  'bottom-start': 'top-full mt-1 left-0',
  'bottom-end': 'top-full mt-1 right-0',
  'top-start': 'bottom-full mb-1 left-0',
  'top-end': 'bottom-full mb-1 right-0',
};

const DropdownBase = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      className,
      open: controlledOpen,
      onOpenChange,
      placement = 'bottom-start',
      trigger,
      closeOnClickOutside = true,
      closeOnEscape = true,
      children,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = useCallback((open: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    }, [controlledOpen, onOpenChange]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          closeOnClickOutside &&
          isOpen &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
      
      return undefined;
    }, [isOpen, closeOnClickOutside, setIsOpen]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape && isOpen) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
      
      return undefined;
    }, [isOpen, closeOnEscape, setIsOpen]);

    const handleTriggerClick = () => {
      setIsOpen(!isOpen);
    };

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          ref={triggerRef}
          onClick={handleTriggerClick}
          className="cursor-pointer"
        >
          {trigger}
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background shadow-lg',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              placementClasses[placement]
            )}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="p-1">{children}</div>
          </div>
        )}
      </div>
    );
  }
);

DropdownBase.displayName = 'Dropdown';

export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  (
    {
      className,
      icon,
      destructive = false,
      disabled = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onClick?.(e);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          'focus:bg-muted focus:text-foreground',
          destructive
            ? 'text-error hover:bg-error hover:text-white focus:bg-error focus:text-white'
            : 'hover:bg-muted hover:text-foreground',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
        {children}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

export const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-border', className)}
        role="separator"
        {...props}
      />
    );
  }
);

DropdownSeparator.displayName = 'DropdownSeparator';

export const DropdownLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold text-muted-foreground', className)}
      {...props}
    />
  );
});

DropdownLabel.displayName = 'DropdownLabel';

// Compound Dropdown component with all sub-components
const Dropdown = DropdownBase as typeof DropdownBase & {
  Item: typeof DropdownItem;
  Separator: typeof DropdownSeparator;
  Label: typeof DropdownLabel;
};

Dropdown.Item = DropdownItem;
Dropdown.Separator = DropdownSeparator;
Dropdown.Label = DropdownLabel;

export { Dropdown };