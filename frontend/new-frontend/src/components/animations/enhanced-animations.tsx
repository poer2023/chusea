'use client';

import React, { ReactNode, forwardRef, HTMLAttributes, useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { animationConfig, performanceUtils, generateAnimationClasses } from './animation-config';
import { useReducedMotion, useAnimationPerformance, useInView, useStaggeredAnimation } from './hooks';

// Enhanced Fade Animation with Multiple Directions
interface FadeAnimationProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'in';
  duration?: keyof typeof animationConfig.durations;
  delay?: number;
  triggerOnView?: boolean;
  className?: string;
}

export const FadeAnimation = forwardRef<HTMLDivElement, FadeAnimationProps>(
  ({
    children,
    direction = 'in',
    duration = 'normal',
    delay = 0,
    triggerOnView = false,
    className,
    ...props
  }, ref) => {
    const [hasAnimated, setHasAnimated] = useState(!triggerOnView);
    const [viewRef, isInView] = useInView(0.1);
    const prefersReducedMotion = useReducedMotion();
    const { isLowPerformance } = useAnimationPerformance();

    useEffect(() => {
      if (triggerOnView && isInView && !hasAnimated) {
        setHasAnimated(true);
      }
    }, [isInView, triggerOnView, hasAnimated]);

    const animationClasses = useMemo(() => {
      if (prefersReducedMotion || isLowPerformance || !hasAnimated) {
        return '';
      }

      const directionClasses = {
        up: 'animate-fade-in-up',
        down: 'animate-fade-in-down',
        left: 'animate-fade-in-left',
        right: 'animate-fade-in-right',
        in: 'animate-fade-in',
      };

      return directionClasses[direction];
    }, [direction, prefersReducedMotion, isLowPerformance, hasAnimated]);

    const animationStyle = useMemo(() => {
      if (prefersReducedMotion || isLowPerformance) {
        return {};
      }

      return {
        animationDuration: `${animationConfig.durations[duration]}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        ...(animationConfig.performance.useGPUAcceleration && {
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }),
      };
    }, [duration, delay, prefersReducedMotion, isLowPerformance]);

    const combinedRef = (node: HTMLDivElement | null) => {
      if (triggerOnView) {
        (viewRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          animationClasses,
          !hasAnimated && triggerOnView && 'opacity-0',
          className
        )}
        style={animationStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FadeAnimation.displayName = 'FadeAnimation';

// Enhanced Scale Animation with Bounce Effect
interface ScaleAnimationProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'in' | 'out' | 'bounce' | 'pulse';
  duration?: keyof typeof animationConfig.durations;
  delay?: number;
  triggerOnView?: boolean;
  className?: string;
}

export const ScaleAnimation = forwardRef<HTMLDivElement, ScaleAnimationProps>(
  ({
    children,
    variant = 'in',
    duration = 'normal',
    delay = 0,
    triggerOnView = false,
    className,
    ...props
  }, ref) => {
    const [hasAnimated, setHasAnimated] = useState(!triggerOnView);
    const [viewRef, isInView] = useInView(0.1);
    const prefersReducedMotion = useReducedMotion();
    const { isLowPerformance } = useAnimationPerformance();

    useEffect(() => {
      if (triggerOnView && isInView && !hasAnimated) {
        setHasAnimated(true);
      }
    }, [isInView, triggerOnView, hasAnimated]);

    const animationClasses = useMemo(() => {
      if (prefersReducedMotion || isLowPerformance || !hasAnimated) {
        return '';
      }

      const variantClasses = {
        in: 'animate-scale-in',
        out: 'animate-scale-out',
        bounce: 'animate-bounce-gentle',
        pulse: 'animate-pulse-subtle',
      };

      return variantClasses[variant];
    }, [variant, prefersReducedMotion, isLowPerformance, hasAnimated]);

    const animationStyle = useMemo(() => {
      if (prefersReducedMotion || isLowPerformance) {
        return {};
      }

      const style: React.CSSProperties = {
        animationDuration: `${animationConfig.durations[duration]}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      };

      if (variant === 'bounce') {
        style.animationTimingFunction = animationConfig.easing.bounce;
      }

      if (animationConfig.performance.useGPUAcceleration) {
        style.willChange = 'transform, opacity';
        style.transform = 'translateZ(0)';
      }

      return style;
    }, [variant, duration, delay, prefersReducedMotion, isLowPerformance]);

    const combinedRef = (node: HTMLDivElement | null) => {
      if (triggerOnView) {
        (viewRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          animationClasses,
          !hasAnimated && triggerOnView && 'opacity-0 scale-95',
          className
        )}
        style={animationStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScaleAnimation.displayName = 'ScaleAnimation';

// Enhanced Stagger Container with Better Performance
interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  staggerDelay?: number;
  direction?: 'normal' | 'reverse';
  triggerOnView?: boolean;
  maxItems?: number;
  className?: string;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({
    children,
    staggerDelay = 100,
    direction = 'normal',
    triggerOnView = true,
    maxItems = 10,
    className,
    ...props
  }, ref) => {
    const [hasTriggered, setHasTriggered] = useState(!triggerOnView);
    const [viewRef, isInView] = useInView(0.1);
    const prefersReducedMotion = useReducedMotion();
    const { isLowPerformance } = useAnimationPerformance();

    const childrenArray = React.Children.toArray(children);
    const itemCount = Math.min(childrenArray.length, maxItems);
    const delays = useStaggeredAnimation(itemCount, staggerDelay, hasTriggered && !prefersReducedMotion);

    useEffect(() => {
      if (triggerOnView && isInView && !hasTriggered) {
        setHasTriggered(true);
      }
    }, [isInView, triggerOnView, hasTriggered]);

    const combinedRef = (node: HTMLDivElement | null) => {
      if (triggerOnView) {
        (viewRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div ref={combinedRef} className={className} {...props}>
        {childrenArray.map((child, index) => {
          if (index >= maxItems) return child;

          const delay = direction === 'reverse' 
            ? delays[itemCount - 1 - index] 
            : delays[index];

          const shouldAnimate = hasTriggered && !prefersReducedMotion && !isLowPerformance;

          return (
            <div
              key={index}
              className={cn(
                shouldAnimate && 'stagger-item',
                !shouldAnimate && triggerOnView && !hasTriggered && 'opacity-0 translate-y-4'
              )}
              style={shouldAnimate ? {
                animationDelay: `${delay}ms`,
                ...(animationConfig.performance.useGPUAcceleration && {
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                }),
              } : {}}
            >
              {child}
            </div>
          );
        })}
      </div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

// Micro-interaction Animation for Buttons and Cards
interface MicroInteractionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  type?: 'lift' | 'scale' | 'glow' | 'bounce';
  intensity?: 'subtle' | 'normal' | 'strong';
  disabled?: boolean;
  className?: string;
}

export const MicroInteraction = forwardRef<HTMLDivElement, MicroInteractionProps>(
  ({
    children,
    type = 'lift',
    intensity = 'normal',
    disabled = false,
    className,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const { isLowPerformance } = useAnimationPerformance();

    const interactionClasses = useMemo(() => {
      if (prefersReducedMotion || isLowPerformance || disabled) {
        return '';
      }

      const intensityMultiplier = {
        subtle: 0.5,
        normal: 1,
        strong: 1.5,
      };

      const multiplier = intensityMultiplier[intensity];

      const typeClasses = {
        lift: 'hover:transform hover:-translate-y-1 hover:shadow-lg',
        scale: 'hover:scale-105 active:scale-95',
        glow: 'hover:shadow-glow transition-shadow',
        bounce: 'hover:animate-bounce-gentle',
      };

      return cn(
        'transition-all duration-200 ease-out',
        typeClasses[type],
        animationConfig.performance.useGPUAcceleration && 'will-change-transform'
      );
    }, [type, intensity, prefersReducedMotion, isLowPerformance, disabled]);

    const style = useMemo(() => {
      if (animationConfig.performance.useGPUAcceleration && !prefersReducedMotion && !isLowPerformance) {
        return {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden' as const,
        };
      }
      return {};
    }, [prefersReducedMotion, isLowPerformance]);

    return (
      <div
        ref={ref}
        className={cn(interactionClasses, className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MicroInteraction.displayName = 'MicroInteraction';

// Enhanced Loading Animation
interface LoadingAnimationProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export const LoadingAnimation = forwardRef<HTMLDivElement, LoadingAnimationProps>(
  ({
    variant = 'spinner',
    size = 'medium',
    color = 'currentColor',
    className,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const { isLowPerformance } = useAnimationPerformance();

    const sizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-8 h-8',
      large: 'w-12 h-12',
    };

    const renderVariant = () => {
      if (prefersReducedMotion || isLowPerformance) {
        return <div className={cn('rounded-full border-2 border-current', sizeClasses[size])} />;
      }

      switch (variant) {
        case 'spinner':
          return (
            <div 
              className={cn(
                'rounded-full border-2 border-current border-t-transparent animate-spin',
                sizeClasses[size]
              )}
              style={{ 
                color,
                ...(animationConfig.performance.useGPUAcceleration && {
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                }),
              }}
            />
          );

        case 'dots':
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn('rounded-full bg-current', size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-2 h-2' : 'w-3 h-3')}
                  style={{
                    color,
                    animation: `bounce-gentle 1.4s ease-in-out ${i * 0.16}s infinite both`,
                  }}
                />
              ))}
            </div>
          );

        case 'pulse':
          return (
            <div 
              className={cn('rounded-full bg-current animate-pulse-subtle', sizeClasses[size])}
              style={{ color }}
            />
          );

        case 'skeleton':
          return (
            <div className="space-y-2 w-full">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn('h-4 bg-current rounded animate-pulse', i === 2 && 'w-3/4')}
                  style={{ color: color === 'currentColor' ? '#e5e7eb' : color }}
                />
              ))}
            </div>
          );

        case 'wave':
          return (
            <div className="flex space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-current rounded-full"
                  style={{
                    height: size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px',
                    color,
                    animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite`,
                    transformOrigin: 'bottom',
                  }}
                />
              ))}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {renderVariant()}
      </div>
    );
  }
);

LoadingAnimation.displayName = 'LoadingAnimation';

// Add keyframes for wave animation
const waveKeyframes = `
@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}
`;

// Inject keyframes into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = waveKeyframes;
  document.head.appendChild(style);
}