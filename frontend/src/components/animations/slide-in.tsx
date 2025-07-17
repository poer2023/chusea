'use client';

import React, { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SlideInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction: 'up' | 'down' | 'left' | 'right';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: 'none' | 'short' | 'medium' | 'long';
  className?: string;
  asChild?: boolean;
}

const durationClasses = {
  fast: 'duration-200',
  normal: 'duration-400',
  slow: 'duration-600',
};

const delayClasses = {
  none: 'delay-0',
  short: 'delay-75',
  medium: 'delay-150',
  long: 'delay-300',
};

const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ 
    children, 
    direction, 
    duration = 'normal', 
    delay = 'none',
    className,
    asChild = false,
    ...props 
  }, ref) => {
    const getAnimationClass = () => {
      switch (direction) {
        case 'up':
          return 'animate-slide-in-up';
        case 'down':
          return 'animate-slide-in-down';
        case 'left':
          return 'animate-slide-in-left';
        case 'right':
          return 'animate-slide-in-right';
        default:
          return 'animate-slide-in-up';
      }
    };

    const getInitialTransform = () => {
      switch (direction) {
        case 'up':
          return 'translate-y-full';
        case 'down':
          return '-translate-y-full';
        case 'left':
          return '-translate-x-full';
        case 'right':
          return 'translate-x-full';
        default:
          return 'translate-y-full';
      }
    };

    const classes = cn(
      getInitialTransform(),
      getAnimationClass(),
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

SlideIn.displayName = 'SlideIn';

export { SlideIn };
export type { SlideInProps };