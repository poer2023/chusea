'use client';

import React, { ReactNode, useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion, useAnimationPerformance, useResponsiveAnimation, useInView } from './hooks';
import { cn } from '@/lib/utils';
import { animationConfig, performanceUtils } from './animation-config';

// High-performance animation wrapper that respects user preferences
interface OptimizedAnimationProps {
  children: ReactNode;
  animation: string;
  duration?: number;
  delay?: number;
  fallback?: ReactNode;
  className?: string;
}

export const OptimizedAnimation: React.FC<OptimizedAnimationProps> = ({
  children,
  animation,
  duration = 300,
  delay = 0,
  fallback,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { isLowPerformance } = useAnimationPerformance();
  const { getAnimationConfig } = useResponsiveAnimation();

  const animationConfig = useMemo(() => {
    if (prefersReducedMotion || isLowPerformance) {
      return {
        animation: 'none',
        duration: 0,
        delay: 0,
      };
    }

    return getAnimationConfig({
      animation,
      duration,
      delay,
    });
  }, [prefersReducedMotion, isLowPerformance, animation, duration, delay, getAnimationConfig]);

  // If animations should be disabled, show fallback or children without animation
  if (prefersReducedMotion || isLowPerformance) {
    return fallback ? <>{fallback}</> : <>{children}</>;
  }

  const animationClasses = cn(
    animation,
    className
  );

  const animationStyle = {
    animationDuration: `${animationConfig.duration}ms`,
    animationDelay: `${animationConfig.delay}ms`,
  };

  return (
    <div className={animationClasses} style={animationStyle}>
      {children}
    </div>
  );
};

// Enhanced GPU-accelerated animation component
interface GPUAcceleratedProps {
  children: ReactNode;
  transform?: string;
  willChange?: string;
  forceGPU?: boolean;
  optimizeTouch?: boolean;
  className?: string;
}

export const GPUAccelerated: React.FC<GPUAcceleratedProps> = ({
  children,
  transform = 'translateZ(0)',
  willChange = 'transform',
  forceGPU = true,
  optimizeTouch = true,
  className,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { isLowPerformance } = useAnimationPerformance();
  
  const style = useMemo(() => {
    const baseStyle: React.CSSProperties = {};
    
    // Apply GPU acceleration if performance allows
    if (forceGPU && !isLowPerformance && animationConfig.performance.useGPUAcceleration) {
      baseStyle.transform = transform;
      baseStyle.willChange = willChange;
      baseStyle.backfaceVisibility = 'hidden';
      baseStyle.perspective = '1000px';
      baseStyle.WebkitFontSmoothing = 'antialiased';
      baseStyle.MozOsxFontSmoothing = 'grayscale';
    }
    
    // Apply touch optimizations
    if (optimizeTouch) {
      Object.assign(baseStyle, performanceUtils.optimizeForTouch());
    }
    
    return baseStyle;
  }, [transform, willChange, forceGPU, optimizeTouch, isLowPerformance]);
  
  useEffect(() => {
    if (elementRef.current && forceGPU && !isLowPerformance) {
      performanceUtils.enableGPUAcceleration(elementRef.current);
    }
  }, [forceGPU, isLowPerformance]);

  return (
    <div ref={elementRef} className={cn('gpu-accelerated', className)} style={style}>
      {children}
    </div>
  );
};

// Lazy animation component that only animates when in view
interface LazyAnimationProps {
  children: ReactNode;
  animation: string;
  threshold?: number;
  className?: string;
}

export const LazyAnimation: React.FC<LazyAnimationProps> = ({
  children,
  animation,
  threshold = 0.1,
  className,
}) => {
  const [ref, isInView] = useInView(threshold) as [React.RefObject<HTMLDivElement>, boolean];
  const prefersReducedMotion = useReducedMotion();

  const animationClasses = cn(
    isInView && !prefersReducedMotion ? animation : 'opacity-0',
    className
  );

  return (
    <div ref={ref} className={animationClasses}>
      {children}
    </div>
  );
};

// Animation manager for complex sequences
interface AnimationManagerProps {
  children: ReactNode;
  animations: Array<{
    trigger: 'immediate' | 'inView' | 'hover' | 'click';
    animation: string;
    duration: number;
    delay?: number;
  }>;
  className?: string;
}

export const AnimationManager: React.FC<AnimationManagerProps> = ({
  children,
  animations,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { isLowPerformance } = useAnimationPerformance();

  if (prefersReducedMotion || isLowPerformance) {
    return <div className={className}>{children}</div>;
  }

  // This would need more complex state management for different triggers
  // For now, just apply immediate animations
  const immediateAnimations = animations.filter(anim => anim.trigger === 'immediate');
  const animationClasses = immediateAnimations.map(anim => anim.animation).join(' ');

  return (
    <div className={cn(animationClasses, className)}>
      {children}
    </div>
  );
};

// Enhanced performance monitoring component with analytics
interface AnimationPerformanceMonitorProps {
  children: ReactNode;
  enableAnalytics?: boolean;
  onPerformanceChange?: (metrics: PerformanceMetrics) => void;
}

interface PerformanceMetrics {
  frameRate: number;
  isLowPerformance: boolean;
  animationCount: number;
  memoryUsage?: number;
  timestamp: number;
}

export const AnimationPerformanceMonitor: React.FC<AnimationPerformanceMonitorProps> = ({ 
  children, 
  enableAnalytics = false,
  onPerformanceChange 
}) => {
  const { frameRate, isLowPerformance } = useAnimationPerformance();
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const animationCountRef = useRef(0);
  
  useEffect(() => {
    const metrics: PerformanceMetrics = {
      frameRate,
      isLowPerformance,
      animationCount: animationCountRef.current,
      timestamp: Date.now(),
    };
    
    // Add memory usage if available
    if ('memory' in performance) {
      metrics.memoryUsage = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
    }
    
    // Store metrics for analytics
    if (enableAnalytics) {
      metricsRef.current.push(metrics);
      
      // Keep only last 100 measurements
      if (metricsRef.current.length > 100) {
        metricsRef.current = metricsRef.current.slice(-100);
      }
    }
    
    // Notify parent component of performance changes
    onPerformanceChange?.(metrics);
    
    // Log performance issues in development
    if (process.env.NODE_ENV === 'development' && isLowPerformance) {
      console.warn(`Low animation performance detected: ${frameRate} FPS`, metrics);
    }
    
    // Auto-disable animations if performance is critically low
    if (frameRate < 15) {
      animationConfig.performance.lowPerformanceMode = true;
      console.warn('Animations disabled due to critically low performance');
    }
  }, [frameRate, isLowPerformance, enableAnalytics, onPerformanceChange]);
  
  // Track active animations
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          if (target.style.animation || target.style.transform) {
            animationCountRef.current++;
          }
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
};

// Enhanced hook for creating performance-aware animations
export function usePerformantAnimation(baseAnimation: string, options: {
  duration?: keyof typeof animationConfig.durations;
  delay?: number;
  fallback?: string;
  easing?: keyof typeof animationConfig.easing;
  enableGPU?: boolean;
} = {}) {
  const prefersReducedMotion = useReducedMotion();
  const { isLowPerformance } = useAnimationPerformance();
  const { getAnimationConfig } = useResponsiveAnimation();
  
  return useMemo(() => {
    // Early exit for reduced motion or low performance
    if (prefersReducedMotion || isLowPerformance || !performanceUtils.shouldAnimate()) {
      return {
        animation: options.fallback || 'none',
        duration: 0,
        delay: 0,
        shouldAnimate: false,
        className: '',
        style: {},
      };
    }
    
    const duration = options.duration ? animationConfig.durations[options.duration] : 300;
    const easing = options.easing ? animationConfig.easing[options.easing] : animationConfig.easing.easeOut;
    
    const config = getAnimationConfig({
      animation: baseAnimation,
      duration,
      delay: options.delay || 0,
    });
    
    // Generate optimized styles
    const style: React.CSSProperties = {
      animation: `${baseAnimation} ${config.duration}ms ${easing} ${config.delay}ms forwards`,
    };
    
    // Add GPU acceleration if enabled
    if (options.enableGPU !== false && animationConfig.performance.useGPUAcceleration) {
      style.transform = 'translateZ(0)';
      style.willChange = 'transform, opacity';
      style.backfaceVisibility = 'hidden';
    }
    
    return {
      ...config,
      shouldAnimate: true,
      className: baseAnimation,
      style,
      easing,
    };
  }, [prefersReducedMotion, isLowPerformance, baseAnimation, options, getAnimationConfig]);
}

// New hook for animation sequences
export function useAnimationSequence(animations: Array<{
  name: string;
  duration: number;
  delay?: number;
}>, options: {
  autoStart?: boolean;
  loop?: boolean;
  onComplete?: () => void;
} = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { isLowPerformance } = useAnimationPerformance();
  
  const start = useCallback(() => {
    if (prefersReducedMotion || isLowPerformance) {
      options.onComplete?.();
      return;
    }
    
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsComplete(false);
  }, [prefersReducedMotion, isLowPerformance, options]);
  
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setIsComplete(false);
  }, []);
  
  useEffect(() => {
    if (options.autoStart) {
      start();
    }
  }, [options.autoStart, start]);
  
  useEffect(() => {
    if (!isPlaying || currentIndex >= animations.length) {
      if (currentIndex >= animations.length) {
        setIsComplete(true);
        setIsPlaying(false);
        
        if (options.loop) {
          setTimeout(() => start(), 100);
        } else {
          options.onComplete?.();
        }
      }
      return;
    }
    
    const animation = animations[currentIndex];
    const totalDuration = animation.duration + (animation.delay || 0);
    
    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, totalDuration);
    
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, animations, options, start]);
  
  return {
    currentAnimation: currentIndex < animations.length ? animations[currentIndex] : null,
    currentIndex,
    isPlaying,
    isComplete,
    start,
    stop,
    progress: animations.length > 0 ? (currentIndex / animations.length) * 100 : 0,
  };
}