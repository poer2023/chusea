'use client';

import { useEffect, useState, useRef, RefObject } from 'react';

// Hook for detecting when an element enters the viewport
export function useInView(
  threshold: number = 0.1,
  rootMargin: string = '0px'
): [RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return [ref, isInView];
}

// Hook for detecting user's motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Hook for creating staggered animations
export function useStaggeredAnimation(
  itemCount: number,
  delay: number = 100,
  enabled: boolean = true
): number[] {
  const [delays, setDelays] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled) {
      setDelays(Array(itemCount).fill(0));
      return;
    }

    const newDelays = Array.from({ length: itemCount }, (_, index) => index * delay);
    setDelays(newDelays);
  }, [itemCount, delay, enabled]);

  return delays;
}

// Hook for toggling animations based on reduced motion preference
export function useAnimationConfig(defaultConfig: Record<string, any>) {
  const prefersReducedMotion = useReducedMotion();

  return prefersReducedMotion 
    ? { ...defaultConfig, duration: 0, delay: 0 }
    : defaultConfig;
}

// Hook for managing animation states
export function useAnimationState(initialState: string = 'idle') {
  const [state, setState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = (newState: string, duration: number = 300) => {
    setIsAnimating(true);
    setState(newState);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  };

  const resetAnimation = () => {
    setState(initialState);
    setIsAnimating(false);
  };

  return {
    state,
    isAnimating,
    startAnimation,
    resetAnimation,
  };
}

// Hook for creating a sequence of animations
export function useAnimationSequence(
  steps: Array<{ state: string; duration: number }>,
  autoStart: boolean = false
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const start = () => {
    setCurrentStep(0);
    setIsRunning(true);
    setIsComplete(false);
  };

  const stop = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsRunning(false);
    setIsComplete(false);
  };

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart]);

  useEffect(() => {
    if (!isRunning || currentStep >= steps.length) {
      if (currentStep >= steps.length) {
        setIsComplete(true);
        setIsRunning(false);
      }
      return;
    }

    const currentStepConfig = steps[currentStep];
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, currentStepConfig.duration);

    return () => clearTimeout(timer);
  }, [currentStep, isRunning, steps]);

  return {
    currentStep: currentStep < steps.length ? steps[currentStep] : null,
    stepIndex: currentStep,
    isRunning,
    isComplete,
    start,
    stop,
    reset,
  };
}

// Hook for performance monitoring of animations
export function useAnimationPerformance() {
  const [frameRate, setFrameRate] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const updateFrameRate = () => {
      frameCount.current++;
      const now = performance.now();
      
      if (now - lastTime.current >= 1000) {
        setFrameRate(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      animationFrame.current = requestAnimationFrame(updateFrameRate);
    };

    animationFrame.current = requestAnimationFrame(updateFrameRate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return {
    frameRate,
    isLowPerformance: frameRate < 30,
  };
}

// Hook for creating responsive animations based on screen size
export function useResponsiveAnimation() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  const getAnimationConfig = (baseConfig: Record<string, any>) => {
    switch (screenSize) {
      case 'mobile':
        return {
          ...baseConfig,
          duration: Math.max(baseConfig.duration * 0.7, 200),
          delay: Math.max(baseConfig.delay * 0.5, 0),
        };
      case 'tablet':
        return {
          ...baseConfig,
          duration: Math.max(baseConfig.duration * 0.85, 250),
          delay: Math.max(baseConfig.delay * 0.75, 0),
        };
      default:
        return baseConfig;
    }
  };

  return {
    screenSize,
    getAnimationConfig,
  };
}