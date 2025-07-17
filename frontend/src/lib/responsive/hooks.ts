import { useEffect, useRef } from 'react';

// Touch gesture detection
export const useTouchGestures = (element: HTMLElement | null) => {
  const startTouch = useRef<Touch | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!element) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      startTouch.current = e.touches[0];
      
      // Long press detection
      longPressTimer.current = setTimeout(() => {
        // Trigger long press action
        element.dispatchEvent(new CustomEvent('longpress', {
          detail: { touch: startTouch.current }
        }));
      }, 500);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      const currentTouch = e.touches[0];
      if (startTouch.current && currentTouch) {
        const deltaX = currentTouch.clientX - startTouch.current.clientX;
        const deltaY = currentTouch.clientY - startTouch.current.clientY;
        
        // Swipe detection
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
          const direction = deltaX > 0 ? 'right' : 'left';
          element.dispatchEvent(new CustomEvent('swipe', {
            detail: { direction, deltaX, deltaY }
          }));
        }
      }
    };
    
    const handleTouchEnd = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      startTouch.current = null;
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [element]);
};

// Performance monitoring
export const usePerformanceMonitor = () => {
  const metricsRef = useRef({
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0
  });
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          metricsRef.current.renderTime = entry.duration;
        }
        if (entry.entryType === 'navigation') {
          metricsRef.current.interactionTime = entry.duration;
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    // Memory monitoring
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024;
      }
    };
    
    const interval = setInterval(checkMemory, 5000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);
  
  return metricsRef.current;
};

// Lazy loading for components
export const useLazyLoad = (threshold = 0.1) => {
  const elementRef = useRef<HTMLElement>(null);
  const isVisible = useRef(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.current = true;
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return { elementRef, isVisible: isVisible.current };
};

// Accessibility helpers
export const useAccessibility = () => {
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };
  
  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstFocusableElement = focusableElements[0] as HTMLElement;
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    firstFocusableElement.focus();
    
    return () => element.removeEventListener('keydown', handleKeyDown);
  };
  
  return { announceToScreenReader, trapFocus };
};

// Responsive utilities
export const useResponsive = () => {
  const getBreakpoint = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };
  
  const isMobile = () => getBreakpoint() === 'mobile';
  const isTablet = () => getBreakpoint() === 'tablet';
  const isDesktop = () => getBreakpoint() === 'desktop';
  
  return { getBreakpoint, isMobile, isTablet, isDesktop };
};

// Error boundary utilities
export const useErrorBoundary = () => {
  const reportError = (error: Error, errorInfo?: any) => {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  };
  
  return { reportError };
};

// Animation utilities
export const useAnimations = () => {
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  
  const createSpringAnimation = (element: HTMLElement, to: any, options = {}) => {
    if (prefersReducedMotion()) {
      Object.assign(element.style, to);
      return;
    }
    
    const defaults = {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    };
    
    const config = { ...defaults, ...options };
    element.animate(to, config);
  };
  
  return { prefersReducedMotion, createSpringAnimation };
};

// Theme utilities
export const useTheme = () => {
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const actualTheme = theme === 'auto' ? getSystemTheme() : theme;
    document.documentElement.setAttribute('data-theme', actualTheme);
  };
  
  return { getSystemTheme, applyTheme };
};