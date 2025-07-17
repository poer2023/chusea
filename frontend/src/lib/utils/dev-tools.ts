// Development tools and debugging utilities
import React from 'react';

// Enable Zustand DevTools in development
export const enableZustandDevTools = process.env.NODE_ENV === 'development';

// DevTools configuration
export const devToolsConfig = {
  // React Query DevTools
  reactQuery: {
    enabled: process.env.NODE_ENV === 'development',
    initialIsOpen: false,
    position: 'bottom-right' as const,
    panelPosition: 'bottom' as const,
  },
  
  // Zustand DevTools
  zustand: {
    enabled: enableZustandDevTools,
    name: 'ChUseA-State',
    serialize: true,
  },
  
  // Performance monitoring
  performance: {
    enabled: process.env.NODE_ENV === 'development',
    logSlowComponents: true,
    slowThreshold: 16, // 16ms (60fps)
  },
  
  // Error tracking
  errorTracking: {
    enabled: true,
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    reportErrors: process.env.NODE_ENV === 'production',
  },
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  static start(label: string) {
    if (!devToolsConfig.performance.enabled) return;
    this.measurements.set(label, performance.now());
  }

  static end(label: string) {
    if (!devToolsConfig.performance.enabled) return;
    
    const startTime = this.measurements.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      
      if (duration > devToolsConfig.performance.slowThreshold) {
        console.warn(`[Performance] Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      }
      
      this.measurements.delete(label);
    }
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      return fn();
    } finally {
      this.end(label);
    }
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.end(label);
    }
  }
}

// Debug logging utilities
export class DebugLogger {
  private static isEnabled = devToolsConfig.errorTracking.enabled;
  private static logLevel = devToolsConfig.errorTracking.logLevel;

  static debug(message: string, ...args: any[]) {
    if (!this.isEnabled || (this.logLevel !== 'debug' && process.env.NODE_ENV !== 'development')) return;
    console.debug(`[ChUseA Debug] ${message}`, ...args);
  }

  static info(message: string, ...args: any[]) {
    if (!this.isEnabled) return;
    console.info(`[ChUseA Info] ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]) {
    if (!this.isEnabled) return;
    console.warn(`[ChUseA Warning] ${message}`, ...args);
  }

  static error(message: string, error?: Error, ...args: any[]) {
    if (!this.isEnabled) return;
    console.error(`[ChUseA Error] ${message}`, error, ...args);
    
    // In production, this would integrate with error reporting service
    if (devToolsConfig.errorTracking.reportErrors && error) {
      this.reportError(error, message);
    }
  }

  private static reportError(error: Error, context: string) {
    // Placeholder for error reporting service integration
    // e.g., Sentry.captureException(error, { extra: { context } });
    console.log('Error would be reported to monitoring service:', { error, context });
  }
}

// Store debugging utilities
export class StoreDebugger {
  static logStateChange(storeName: string, prevState: any, nextState: any, action?: string) {
    if (!devToolsConfig.zustand.enabled) return;
    
    console.group(`[${storeName}] State Change${action ? ` - ${action}` : ''}`);
    console.log('Previous:', prevState);
    console.log('Next:', nextState);
    console.log('Changes:', this.getChanges(prevState, nextState));
    console.groupEnd();
  }

  private static getChanges(prev: any, next: any): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};
    
    for (const key in next) {
      if (prev[key] !== next[key]) {
        changes[key] = { from: prev[key], to: next[key] };
      }
    }
    
    return changes;
  }

  static snapshot(storeName: string, state: any) {
    if (!devToolsConfig.zustand.enabled) return;
    console.log(`[${storeName}] State Snapshot:`, JSON.parse(JSON.stringify(state)));
  }
}

// React component debugging
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  if (!devToolsConfig.performance.enabled) {
    return Component;
  }

  const WrappedComponent: React.ComponentType<P> = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Anonymous';
    
    PerformanceMonitor.start(`Render ${name}`);
    try {
      return React.createElement(Component, props);
    } finally {
      PerformanceMonitor.end(`Render ${name}`);
    }
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// API call debugging
export function debugApiCall(endpoint: string, method: string, data?: any) {
  if (!devToolsConfig.errorTracking.enabled) return;
  
  DebugLogger.debug(`API Call: ${method} ${endpoint}`, data);
}

// Local storage debugging
export function debugLocalStorage(operation: 'get' | 'set' | 'remove', key: string, value?: any) {
  if (!devToolsConfig.errorTracking.enabled) return;
  
  DebugLogger.debug(`LocalStorage ${operation.toUpperCase()}: ${key}`, value);
}

// Query debugging utilities
export function debugQuery(queryKey: any[], data: any, error?: any) {
  if (!devToolsConfig.errorTracking.enabled) return;
  
  if (error) {
    DebugLogger.error(`Query failed: ${JSON.stringify(queryKey)}`, error);
  } else {
    DebugLogger.debug(`Query success: ${JSON.stringify(queryKey)}`, data);
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  private static isSupported = 'memory' in performance;

  static logMemoryUsage(label?: string) {
    if (!this.isSupported || !devToolsConfig.performance.enabled) return;

    const memory = (performance as any).memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
    const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);

    console.log(
      `[Memory${label ? ` - ${label}` : ''}] Used: ${usedMB}MB, Total: ${totalMB}MB, Limit: ${limitMB}MB`
    );
  }

  static checkMemoryLeak(threshold = 100) {
    if (!this.isSupported || !devToolsConfig.performance.enabled) return;

    const memory = (performance as any).memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1048576);

    if (usedMB > threshold) {
      DebugLogger.warn(`Potential memory leak detected: ${usedMB}MB used`);
    }
  }
}

// Feature flags for development
export const devFeatureFlags = {
  // Enable experimental features in development
  experimentalFeatures: process.env.NODE_ENV === 'development',
  
  // Mock API responses
  mockApi: process.env.NEXT_PUBLIC_MOCK_API === 'true',
  
  // Show debug panels
  showDebugPanels: process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true',
  
  // Skip authentication in development
  skipAuth: process.env.NEXT_PUBLIC_SKIP_AUTH === 'true',
  
  // Verbose logging
  verboseLogging: process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true',
};

// Export debug tools for global access in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__CHUSEA_DEBUG__ = {
    PerformanceMonitor,
    DebugLogger,
    StoreDebugger,
    MemoryMonitor,
    devFeatureFlags,
    devToolsConfig,
  };
}