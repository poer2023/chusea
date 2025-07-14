'use client';

import React, { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BounceInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: 'gentle' | 'normal' | 'strong';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: 'none' | 'short' | 'medium' | 'long';
  className?: string;
  asChild?: boolean;
}

const intensityClasses = {
  gentle: 'animate-bounce-gentle',
  normal: 'animate-bounce',
  strong: 'animate-bounce',
};

const durationClasses = {
  fast: 'duration-300',
  normal: 'duration-500',
  slow: 'duration-700',
};

const delayClasses = {
  none: 'delay-0',
  short: 'delay-75',
  medium: 'delay-150',
  long: 'delay-300',
};

const BounceIn = forwardRef<HTMLDivElement, BounceInProps>(
  ({ 
    children, 
    intensity = 'normal', 
    duration = 'normal', 
    delay = 'none',
    className,
    asChild = false,
    ...props 
  }, ref) => {
    const classes = cn(
      'opacity-0',
      'scale-95',
      'animate-scale-in',
      intensityClasses[intensity],
      durationClasses[duration],
      delayClasses[delay],
      'ease-in-out-back',
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

BounceIn.displayName = 'BounceIn';

export { BounceIn };
export type { BounceInProps };