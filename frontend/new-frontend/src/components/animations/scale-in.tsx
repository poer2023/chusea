'use client';

import React, { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ScaleInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  scale?: 'small' | 'medium' | 'large';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: 'none' | 'short' | 'medium' | 'long';
  className?: string;
  asChild?: boolean;
}

const scaleClasses = {
  small: 'scale-95',
  medium: 'scale-90',
  large: 'scale-75',
};

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

const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ 
    children, 
    scale = 'medium', 
    duration = 'normal', 
    delay = 'none',
    className,
    asChild = false,
    ...props 
  }, ref) => {
    const classes = cn(
      'opacity-0',
      scaleClasses[scale],
      'animate-scale-in',
      durationClasses[duration],
      delayClasses[delay],
      'ease-out',
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

ScaleIn.displayName = 'ScaleIn';

export { ScaleIn };
export type { ScaleInProps };