/**
 * Animation Configuration for ChUseA
 * Enhanced tw-animate-css integration with performance optimizations
 */

export const animationConfig = {
  // Base animation settings
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  
  // Easing functions for different contexts
  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  // Performance settings (mutable for runtime adjustments)
  performance: {
    useGPUAcceleration: true,
    preferReducedMotion: true,
    lowPerformanceMode: false,
    frameRateThreshold: 30,
  } as {
    useGPUAcceleration: boolean;
    preferReducedMotion: boolean;
    lowPerformanceMode: boolean;
    frameRateThreshold: number;
  },
  
  // Workflow-specific animations
  workflow: {
    nodeTransition: {
      duration: 300,
      easing: 'easeOut',
      stagger: 100,
    },
    connectionLine: {
      duration: 800,
      easing: 'easeOut',
      dashLength: 5,
    },
    statusChange: {
      duration: 500,
      easing: 'bounce',
      scale: 1.1,
    },
  },
  
  // Interactive animations
  interactions: {
    hover: {
      duration: 200,
      easing: 'easeOut',
      lift: 2, // pixels
    },
    click: {
      duration: 100,
      easing: 'easeOut',
      scale: 0.98,
    },
    focus: {
      duration: 150,
      easing: 'easeOut',
      ringSize: 3, // pixels
    },
  },
  
  // Page transitions
  pageTransitions: {
    fadeIn: {
      duration: 400,
      easing: 'easeOut',
    },
    slideUp: {
      duration: 400,
      easing: 'easeOut',
      distance: 20, // pixels
    },
  },
  
  // Loading animations
  loading: {
    spinner: {
      duration: 1000,
      easing: 'linear',
    },
    skeleton: {
      duration: 1500,
      easing: 'easeInOut',
    },
    progress: {
      duration: 1500,
      easing: 'easeInOut',
    },
  },
} as const;

// Animation utility functions
export const getAnimationDuration = (key: keyof typeof animationConfig.durations) => {
  return animationConfig.durations[key];
};

export const getAnimationEasing = (key: keyof typeof animationConfig.easing) => {
  return animationConfig.easing[key];
};

// Animation class generators
export const generateAnimationClasses = {
  fadeIn: (duration = 'normal', delay = 0) => ({
    animation: `fade-in ${getAnimationDuration(duration as keyof typeof animationConfig.durations)}ms ${getAnimationEasing('easeOut')} ${delay}ms forwards`,
    willChange: 'opacity',
  }),
  
  scaleIn: (duration = 'normal', delay = 0) => ({
    animation: `scale-in ${getAnimationDuration(duration as keyof typeof animationConfig.durations)}ms ${getAnimationEasing('easeOut')} ${delay}ms forwards`,
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
  }),
  
  slideInUp: (duration = 'normal', delay = 0) => ({
    animation: `slide-in-up ${getAnimationDuration(duration as keyof typeof animationConfig.durations)}ms ${getAnimationEasing('easeOut')} ${delay}ms forwards`,
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
  }),
  
  hover: () => ({
    transition: `transform ${animationConfig.interactions.hover.duration}ms ${getAnimationEasing('easeOut')}, box-shadow ${animationConfig.interactions.hover.duration}ms ${getAnimationEasing('easeOut')}`,
    willChange: 'transform',
  }),
};

// Performance monitoring utilities
export const performanceUtils = {
  shouldAnimate: () => {
    if (typeof window === 'undefined') return false;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return false;
    
    // Check for low performance mode
    if (animationConfig.performance.lowPerformanceMode) return false;
    
    return true;
  },
  
  enableGPUAcceleration: (element: HTMLElement) => {
    if (animationConfig.performance.useGPUAcceleration) {
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';
    }
  },
  
  optimizeForTouch: () => {
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      return {
        touchAction: 'manipulation',
        userSelect: 'none',
      };
    }
    return {};
  },
};

// Workflow status animation mappings
export const workflowAnimations = {
  pending: {
    classes: 'animate-pulse-subtle',
    style: generateAnimationClasses.fadeIn('normal'),
  },
  running: {
    classes: 'animate-pulse-subtle',
    style: {
      ...generateAnimationClasses.fadeIn('normal'),
      animation: `pulse-slow 2s ease-in-out infinite`,
    },
  },
  pass: {
    classes: 'animate-scale-in',
    style: {
      ...generateAnimationClasses.scaleIn('normal'),
      animationTimingFunction: getAnimationEasing('bounce'),
    },
  },
  fail: {
    classes: 'animate-shake',
    style: {
      animation: `shake 0.5s ease-in-out`,
      willChange: 'transform',
    },
  },
  cancelled: {
    classes: 'animate-fade-in',
    style: generateAnimationClasses.fadeIn('normal'),
  },
} as const;

export type WorkflowStatus = keyof typeof workflowAnimations;
export type AnimationDuration = keyof typeof animationConfig.durations;
export type AnimationEasing = keyof typeof animationConfig.easing;