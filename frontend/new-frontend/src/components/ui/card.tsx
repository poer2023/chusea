'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card visual variant
   */
  variant?: 'default' | 'outline' | 'filled' | 'elevated';
  /**
   * Card size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the card is interactive (clickable)
   */
  interactive?: boolean;
  /**
   * Whether the card is disabled
   */
  disabled?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to add bottom border
   */
  withBorder?: boolean;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Content-specific props can be added here in the future
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to add top border
   */
  withBorder?: boolean;
}

const cardVariantClasses = {
  default: 'bg-background border border-border',
  outline: 'bg-transparent border border-border',
  filled: 'bg-muted border border-transparent',
  elevated: 'bg-background border border-border shadow-md',
};

const cardSizeClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const cardInteractiveClasses = 'cursor-pointer hover:shadow-lg transition-shadow duration-200';

const CardBase = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      interactive = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg transition-colors',
          // Variant styles
          cardVariantClasses[variant],
          // Size styles
          cardSizeClasses[size],
          // Interactive styles
          interactive && !disabled && cardInteractiveClasses,
          // Disabled styles
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBase.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          withBorder && 'border-b border-border pb-3 mb-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, withBorder = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          withBorder && 'border-t border-border pt-3 mt-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Compound Card component with all sub-components
const Card = CardBase as typeof CardBase & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };