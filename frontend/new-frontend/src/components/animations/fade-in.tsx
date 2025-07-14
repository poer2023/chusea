'use client';

import React, { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: 'none' | 'short' | 'medium' | 'long';
  className?: string;
  asChild?: boolean;
}

const durationClasses = {
  fast: 'duration-200',
  normal: 'duration-300',
  slow: 'duration-500',
};

const delayClasses = {
  none: 'delay-0',
  short: 'delay-75',
  medium: 'delay-150',
  long: 'delay-300',
};

const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ 
    children, 
    direction = 'none', 
    duration = 'normal', 
    delay = 'none',
    className,
    asChild = false,
    ...props 
  }, ref) => {
    const getAnimationClass = () => {
      switch (direction) {
        case 'up':
          return 'animate-fade-in-up';
        case 'down':
          return 'animate-fade-in-down';
        case 'left':
          return 'animate-fade-in-left';
        case 'right':
          return 'animate-fade-in-right';
        default:
          return 'animate-fade-in';
      }
    };

    const classes = cn(
      'opacity-0',
      getAnimationClass(),
      durationClasses[duration],
      delayClasses[delay],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...(children.props as any),
        ref,
        className: cn(classes, (children.props as any).className),
        ...props,
      });
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

FadeIn.displayName = 'FadeIn';

export { FadeIn };
export type { FadeInProps };