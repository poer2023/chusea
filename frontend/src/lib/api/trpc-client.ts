// tRPC client integration for ChUseA
import { createTRPCClient, httpBatchLink, loggerLink, TRPCClientError } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import { API_CONFIG, ENV_CONFIG } from '../constants';
import type { AppRouter } from '../../types/trpc';

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Create tRPC vanilla client for use outside React components
export const trpcClient = createTRPCClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        ENV_CONFIG.enableLogging &&
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${API_CONFIG.BASE_URL}/api/trpc`,
      headers: () => {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('auth_token')
          : null;
        
        return {
          authorization: token ? `Bearer ${token}` : '',
          'x-client-version': '1.0.0',
        };
      },
      // Enable batching for better performance
      maxURLLength: 2083,
    }),
  ],
});

// tRPC client configuration for React Query provider
export const trpcClientOptions = {
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        ENV_CONFIG.enableLogging &&
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${API_CONFIG.BASE_URL}/api/trpc`,
      headers: () => {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('auth_token')
          : null;
        
        return {
          authorization: token ? `Bearer ${token}` : '',
          'x-client-version': '1.0.0',
        };
      },
      // Enhanced configuration
      maxURLLength: 2083,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // Add timeout
          signal: AbortSignal.timeout(API_CONFIG.DEFAULT_TIMEOUT),
        });
      },
    }),
  ],
  defaultOptions: {
    queries: {
      staleTime: API_CONFIG.CACHE_DURATION.SHORT,
      retry: (failureCount, error) => {
        // Don't retry on client errors
        if (error instanceof TRPCClientError) {
          return error.data?.httpStatus >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry server errors for mutations
        if (error instanceof TRPCClientError) {
          return error.data?.httpStatus >= 500 && failureCount < 2;
        }
        return false;
      },
    },
  },
};

// Helper functions for error handling
export const isTRPCError = (error: unknown): error is TRPCClientError<AppRouter> => {
  return error instanceof TRPCClientError;
};

export const getTRPCErrorMessage = (error: unknown): string => {
  if (isTRPCError(error)) {
    return error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export const getTRPCErrorCode = (error: unknown): string => {
  if (isTRPCError(error)) {
    return error.data?.code || 'UNKNOWN_ERROR';
  }
  return 'UNKNOWN_ERROR';
};

// Advanced tRPC utilities
export class TRPCClientManager {
  private static instance: TRPCClientManager;
  private clientCache = new Map<string, any>();
  
  static getInstance(): TRPCClientManager {
    if (!TRPCClientManager.instance) {
      TRPCClientManager.instance = new TRPCClientManager();
    }
    return TRPCClientManager.instance;
  }
  
  // Create specialized tRPC client with custom config
  createClient(options: {
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
    enableBatching?: boolean;
  } = {}) {
    const cacheKey = JSON.stringify(options);
    
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey);
    }
    
    const client = createTRPCClient<AppRouter>({
      transformer: superjson,
      links: [
        ...(ENV_CONFIG.enableLogging ? [loggerLink({
          enabled: (opts) =>
            opts.direction === 'down' && opts.result instanceof Error,
        })] : []),
        httpBatchLink({
          url: `${options.baseUrl || API_CONFIG.BASE_URL}/api/trpc`,
          headers: () => ({
            authorization: typeof window !== 'undefined' 
              ? `Bearer ${localStorage.getItem('auth_token') || ''}`
              : '',
            'x-client-version': '1.0.0',
            ...options.headers,
          }),
          maxURLLength: options.enableBatching === false ? 0 : 2083,
          fetch: (url, fetchOptions) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(
              () => controller.abort(), 
              options.timeout || API_CONFIG.DEFAULT_TIMEOUT
            );
            
            return fetch(url, {
              ...fetchOptions,
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));
          },
        }),
      ],
    });
    
    this.clientCache.set(cacheKey, client);
    return client;
  }
  
  // Clear client cache
  clearCache() {
    this.clientCache.clear();
  }
  
  // Get client with authentication
  getAuthenticatedClient() {
    return this.createClient({
      headers: {
        'x-require-auth': 'true',
      },
    });
  }
  
  // Get client for file operations (no batching, longer timeout)
  getFileClient() {
    return this.createClient({
      timeout: API_CONFIG.UPLOAD_TIMEOUT,
      enableBatching: false,
      headers: {
        'x-operation-type': 'file',
      },
    });
  }
  
  // Get client for real-time operations
  getRealtimeClient() {
    return this.createClient({
      timeout: 5000, // Shorter timeout for real-time
      enableBatching: false,
      headers: {
        'x-operation-type': 'realtime',
      },
    });
  }
}

// Export singleton instance
export const trpcManager = TRPCClientManager.getInstance();

// Procedure-specific clients for different use cases
export const authTrpc = trpcManager.getAuthenticatedClient();
export const fileTrpc = trpcManager.getFileClient();
export const realtimeTrpc = trpcManager.getRealtimeClient();

// tRPC subscription helpers
export class TRPCSubscriptionManager {
  private subscriptions = new Map<string, { unsubscribe: () => void }>();
  
  // Subscribe to tRPC procedure with automatic cleanup
  subscribe<T>(
    key: string,
    procedure: any,
    input: any,
    callbacks: {
      onData?: (data: T) => void;
      onError?: (error: TRPCClientError<AppRouter>) => void;
      onStarted?: () => void;
      onStopped?: () => void;
    }
  ) {
    // Cleanup existing subscription
    this.unsubscribe(key);
    
    const subscription = procedure.subscribe(input, {
      onData: callbacks.onData,
      onError: callbacks.onError,
      onStarted: callbacks.onStarted,
      onStopped: callbacks.onStopped,
    });
    
    this.subscriptions.set(key, { unsubscribe: subscription.unsubscribe });
    
    return {
      unsubscribe: () => this.unsubscribe(key),
    };
  }
  
  // Unsubscribe from specific subscription
  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }
  
  // Unsubscribe from all subscriptions
  unsubscribeAll() {
    for (const [key] of this.subscriptions) {
      this.unsubscribe(key);
    }
  }
  
  // Get active subscription keys
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }
}

// Export subscription manager
export const trpcSubscriptionManager = new TRPCSubscriptionManager();

// Enhanced error boundary for tRPC errors
export const handleTRPCError = (error: unknown): never => {
  if (isTRPCError(error)) {
    const errorData = {
      message: error.message,
      code: error.data?.code,
      httpStatus: error.data?.httpStatus,
      path: error.data?.path,
      details: error.data?.stack,
    };
    
    // Log error for debugging
    if (ENV_CONFIG.enableLogging) {
      console.error('tRPC Error:', errorData);
    }
    
    // Handle specific error types
    switch (error.data?.code) {
      case 'UNAUTHORIZED':
        // Redirect to login or refresh token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        break;
      case 'FORBIDDEN':
        // Show permission denied message
        break;
      case 'NOT_FOUND':
        // Show not found message
        break;
      case 'TIMEOUT':
        // Show timeout message and retry option
        break;
      default:
        // Show generic error message
        break;
    }
    
    throw error;
  }
  
  // Handle non-tRPC errors
  const genericError = new Error(
    error instanceof Error ? error.message : 'An unknown error occurred'
  );
  
  if (ENV_CONFIG.enableLogging) {
    console.error('Non-tRPC Error:', genericError);
  }
  
  throw genericError;
};

// tRPC performance monitoring
export class TRPCPerformanceMonitor {
  private metrics = new Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    errors: number;
  }>();
  
  // Record procedure execution
  recordProcedure(
    procedurePath: string,
    executionTime: number,
    isError: boolean = false
  ) {
    const existing = this.metrics.get(procedurePath) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0,
    };
    
    this.metrics.set(procedurePath, {
      count: existing.count + 1,
      totalTime: existing.totalTime + executionTime,
      minTime: Math.min(existing.minTime, executionTime),
      maxTime: Math.max(existing.maxTime, executionTime),
      errors: existing.errors + (isError ? 1 : 0),
    });
  }
  
  // Get performance metrics
  getMetrics() {
    const result: Record<string, any> = {};
    
    for (const [path, metrics] of this.metrics) {
      result[path] = {
        ...metrics,
        avgTime: metrics.totalTime / metrics.count,
        errorRate: metrics.errors / metrics.count,
      };
    }
    
    return result;
  }
  
  // Reset metrics
  reset() {
    this.metrics.clear();
  }
  
  // Get summary
  getSummary() {
    const metrics = this.getMetrics();
    const paths = Object.keys(metrics);
    
    if (paths.length === 0) return null;
    
    const totalCalls = paths.reduce((sum, path) => sum + metrics[path].count, 0);
    const totalErrors = paths.reduce((sum, path) => sum + metrics[path].errors, 0);
    const avgResponseTime = paths.reduce(
      (sum, path) => sum + metrics[path].avgTime, 0
    ) / paths.length;
    
    return {
      totalProcedures: paths.length,
      totalCalls,
      totalErrors,
      overallErrorRate: totalErrors / totalCalls,
      avgResponseTime,
      slowestProcedure: paths.reduce((slowest, path) => 
        metrics[path].avgTime > (metrics[slowest]?.avgTime || 0) ? path : slowest
      ),
      fastestProcedure: paths.reduce((fastest, path) => 
        metrics[path].avgTime < (metrics[fastest]?.avgTime || Infinity) ? path : fastest
      ),
    };
  }
}

// Export performance monitor
export const trpcPerformanceMonitor = new TRPCPerformanceMonitor();