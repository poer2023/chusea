// Unified API router for ChUseA - intelligently routes between tRPC and FastAPI
import { trpcClient } from './trpc-client';
import { apiClient } from './client';
import { ENV_CONFIG } from '../constants';

// Configuration for API routing strategy
export const API_ROUTING_CONFIG = {
  // Default routing strategy
  defaultStrategy: 'trpc' as 'trpc' | 'rest' | 'auto',
  
  // Fallback strategy when primary fails
  fallbackStrategy: 'rest' as 'trpc' | 'rest' | 'auto',
  
  // Procedures that should always use tRPC
  forceTRPC: [
    'auth.me',
    'subscriptions.documentUpdates',
    'subscriptions.workflowUpdates',
    'subscriptions.aiGeneration',
    'ai.generate',
    'ai.optimize',
  ],
  
  // Procedures that should always use REST
  forceREST: [
    'files.upload',
    'files.download',
    'documents.export',
    'documents.import',
    'analytics.export',
  ],
  
  // Enable intelligent routing based on conditions
  enableIntelligentRouting: true,
  
  // Timeout for route health checks
  healthCheckTimeout: 5000,
  
  // Cache duration for routing decisions
  routingCacheDuration: 60000, // 1 minute
} as const;

// Routing strategy types
export type RoutingStrategy = 'trpc' | 'rest' | 'auto';

// Route health status
export interface RouteHealth {
  trpc: {
    available: boolean;
    latency: number;
    lastCheck: Date;
    errorRate: number;
  };
  rest: {
    available: boolean;
    latency: number;
    lastCheck: Date;
    errorRate: number;
  };
}

// API request metadata
export interface APIRequestMetadata {
  procedure: string;
  strategy: RoutingStrategy;
  fallback?: boolean;
  retryCount: number;
  startTime: number;
  endTime?: number;
  error?: any;
}

class APIRouter {
  private routeHealth: RouteHealth = {
    trpc: {
      available: true,
      latency: 0,
      lastCheck: new Date(),
      errorRate: 0,
    },
    rest: {
      available: true,
      latency: 0,
      lastCheck: new Date(),
      errorRate: 0,
    },
  };
  
  private routingCache = new Map<string, {
    strategy: RoutingStrategy;
    timestamp: number;
  }>();
  
  private requestHistory: APIRequestMetadata[] = [];
  private healthCheckInterval?: NodeJS.Timeout;
  
  constructor() {
    this.startHealthMonitoring();
  }
  
  // Start periodic health monitoring
  private startHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      await this.checkRouteHealth();
    }, 30000); // Check every 30 seconds
  }
  
  // Check health of both tRPC and REST endpoints
  private async checkRouteHealth(): Promise<void> {
    const promises = [
      this.checkTRPCHealth(),
      this.checkRESTHealth(),
    ];
    
    await Promise.allSettled(promises);
  }
  
  // Check tRPC endpoint health
  private async checkTRPCHealth(): Promise<void> {
    const startTime = performance.now();
    try {
      // Use a lightweight health check procedure
      await trpcClient.auth.me.query();
      
      const latency = performance.now() - startTime;
      this.routeHealth.trpc = {
        available: true,
        latency,
        lastCheck: new Date(),
        errorRate: this.calculateErrorRate('trpc'),
      };
    } catch {
      this.routeHealth.trpc = {
        available: false,
        latency: performance.now() - startTime,
        lastCheck: new Date(),
        errorRate: this.calculateErrorRate('trpc'),
      };
    }
  }
  
  // Check REST endpoint health
  private async checkRESTHealth(): Promise<void> {
    const startTime = performance.now();
    try {
      await apiClient.get('/system/health');
      
      const latency = performance.now() - startTime;
      this.routeHealth.rest = {
        available: true,
        latency,
        lastCheck: new Date(),
        errorRate: this.calculateErrorRate('rest'),
      };
    } catch {
      this.routeHealth.rest = {
        available: false,
        latency: performance.now() - startTime,
        lastCheck: new Date(),
        errorRate: this.calculateErrorRate('rest'),
      };
    }
  }
  
  // Calculate error rate for a strategy
  private calculateErrorRate(strategy: 'trpc' | 'rest'): number {
    const recentRequests = this.requestHistory
      .filter(req => req.strategy === strategy)
      .slice(-100); // Last 100 requests
    
    if (recentRequests.length === 0) return 0;
    
    const errors = recentRequests.filter(req => req.error).length;
    return errors / recentRequests.length;
  }
  
  // Determine the best routing strategy for a procedure
  public determineStrategy(procedure: string, options: {
    preferredStrategy?: RoutingStrategy;
    forceStrategy?: RoutingStrategy;
  } = {}): RoutingStrategy {
    // Check for forced strategy
    if (options.forceStrategy) {
      return options.forceStrategy;
    }
    
    // Check configuration overrides
    if (API_ROUTING_CONFIG.forceTRPC.includes(procedure)) {
      return 'trpc';
    }
    
    if (API_ROUTING_CONFIG.forceREST.includes(procedure)) {
      return 'rest';
    }
    
    // Check cache
    const cached = this.routingCache.get(procedure);
    if (cached && Date.now() - cached.timestamp < API_ROUTING_CONFIG.routingCacheDuration) {
      return cached.strategy;
    }
    
    // Determine strategy based on health and preferences
    let strategy: RoutingStrategy;
    
    if (!API_ROUTING_CONFIG.enableIntelligentRouting) {
      strategy = options.preferredStrategy || API_ROUTING_CONFIG.defaultStrategy;
    } else {
      strategy = this.getIntelligentStrategy(options.preferredStrategy);
    }
    
    // Cache the decision
    this.routingCache.set(procedure, {
      strategy,
      timestamp: Date.now(),
    });
    
    return strategy;
  }
  
  // Get intelligent routing strategy based on health metrics
  private getIntelligentStrategy(preferred?: RoutingStrategy): RoutingStrategy {
    const { trpc, rest } = this.routeHealth;
    
    // If preferred strategy is available and healthy, use it
    if (preferred === 'trpc' && trpc.available && trpc.errorRate < 0.1) {
      return 'trpc';
    }
    
    if (preferred === 'rest' && rest.available && rest.errorRate < 0.1) {
      return 'rest';
    }
    
    // Choose based on availability and performance
    if (!trpc.available && rest.available) {
      return 'rest';
    }
    
    if (trpc.available && !rest.available) {
      return 'trpc';
    }
    
    // Both available - choose based on performance
    if (trpc.available && rest.available) {
      // Consider latency and error rate
      const trpcScore = this.calculatePerformanceScore(trpc);
      const restScore = this.calculatePerformanceScore(rest);
      
      return trpcScore > restScore ? 'trpc' : 'rest';
    }
    
    // Fallback to default
    return API_ROUTING_CONFIG.defaultStrategy;
  }
  
  // Calculate performance score for routing decision
  private calculatePerformanceScore(health: RouteHealth['trpc'] | RouteHealth['rest']): number {
    const latencyScore = Math.max(0, 100 - health.latency / 10); // Lower latency = higher score
    const reliabilityScore = (1 - health.errorRate) * 100; // Lower error rate = higher score
    
    return (latencyScore + reliabilityScore) / 2;
  }
  
  // Execute API call with intelligent routing
  public async call<T>(
    procedure: string,
    input?: any,
    options: {
      strategy?: RoutingStrategy;
      enableFallback?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const metadata: APIRequestMetadata = {
      procedure,
      strategy: this.determineStrategy(procedure, { preferredStrategy: options.strategy }),
      retryCount: 0,
      startTime: performance.now(),
    };
    
    try {
      const result = await this.executeCall<T>(procedure, input, metadata.strategy, options.timeout);
      metadata.endTime = performance.now();
      this.recordRequest(metadata);
      return result;
    } catch (error) {
      metadata.error = error;
      metadata.endTime = performance.now();
      
      // Try fallback if enabled and primary strategy failed
      if (options.enableFallback !== false && !metadata.fallback) {
        const fallbackStrategy = this.getFallbackStrategy(metadata.strategy);
        
        if (fallbackStrategy !== metadata.strategy) {
          try {
            const fallbackMetadata: APIRequestMetadata = {
              ...metadata,
              strategy: fallbackStrategy,
              fallback: true,
              startTime: performance.now(),
            };
            
            const result = await this.executeCall<T>(procedure, input, fallbackStrategy, options.timeout);
            fallbackMetadata.endTime = performance.now();
            this.recordRequest(fallbackMetadata);
            return result;
          } catch (fallbackError) {
            // Log both errors
            if (ENV_CONFIG.enableLogging) {
              console.error('Primary strategy failed:', error);
              console.error('Fallback strategy failed:', fallbackError);
            }
          }
        }
      }
      
      this.recordRequest(metadata);
      throw error;
    }
  }
  
  // Get fallback strategy
  private getFallbackStrategy(primary: RoutingStrategy): RoutingStrategy {
    if (primary === 'trpc') return 'rest';
    if (primary === 'rest') return 'trpc';
    return API_ROUTING_CONFIG.fallbackStrategy;
  }
  
  // Execute the actual API call
  private async executeCall<T>(
    procedure: string,
    input: any,
    strategy: RoutingStrategy,
    timeout?: number
  ): Promise<T> {
    if (strategy === 'trpc') {
      return this.executeTRPCCall<T>(procedure, input, timeout);
    } else {
      return this.executeRESTCall<T>(procedure, input, timeout);
    }
  }
  
  // Execute tRPC call
  private async executeTRPCCall<T>(procedure: string, input: any, timeout?: number): Promise<T> {
    const procedureParts = procedure.split('.');
    let client: any = trpcClient;
    
    // Navigate to the correct procedure
    for (const part of procedureParts) {
      client = client[part];
      if (!client) {
        throw new Error(`tRPC procedure ${procedure} not found`);
      }
    }
    
    // Execute with timeout if specified
    if (timeout) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('tRPC call timeout')), timeout);
      });
      
      return Promise.race([
        client.query ? client.query(input) : client.mutate(input),
        timeoutPromise,
      ]);
    }
    
    return client.query ? client.query(input) : client.mutate(input);
  }
  
  // Execute REST call
  private async executeRESTCall<T>(procedure: string, input: any, timeout?: number): Promise<T> {
    // Map tRPC procedures to REST endpoints
    const endpoint = this.mapProcedureToEndpoint(procedure);
    const method = this.getProcedureMethod(procedure);
    
    const requestOptions: any = { timeout };
    
    switch (method) {
      case 'GET':
        return apiClient.get<T>(endpoint, requestOptions);
      case 'POST':
        return apiClient.post<T>(endpoint, input, requestOptions);
      case 'PUT':
        return apiClient.put<T>(endpoint, input, requestOptions);
      case 'PATCH':
        return apiClient.patch<T>(endpoint, input, requestOptions);
      case 'DELETE':
        return apiClient.delete<T>(endpoint, requestOptions);
      default:
        throw new Error(`Unsupported HTTP method for procedure ${procedure}`);
    }
  }
  
  // Map tRPC procedure to REST endpoint
  private mapProcedureToEndpoint(procedure: string): string {
    // This is a simplified mapping - in a real implementation,
    // you'd have a comprehensive mapping table
    const mappings: Record<string, string> = {
      'auth.login': '/auth/login',
      'auth.register': '/auth/register',
      'auth.logout': '/auth/logout',
      'auth.me': '/user/profile',
      'documents.list': '/documents',
      'documents.get': '/documents/{id}',
      'documents.create': '/documents',
      'documents.update': '/documents/{id}',
      'documents.delete': '/documents/{id}',
      'workflows.list': '/workflows',
      'workflows.get': '/workflows/{id}',
      'workflows.create': '/workflows',
      'workflows.update': '/workflows/{id}',
      'files.upload': '/files/upload',
      'ai.generate': '/ai/generate',
      'ai.optimize': '/ai/optimize',
    };
    
    return mappings[procedure] || `/${procedure.replace('.', '/')}`;
  }
  
  // Get HTTP method for tRPC procedure
  private getProcedureMethod(procedure: string): string {
    // Query procedures typically use GET
    const queryProcedures = [
      'auth.me',
      'documents.list',
      'documents.get',
      'workflows.list',
      'workflows.get',
    ];
    
    // Mutation procedures use appropriate HTTP methods
    const mutationMethods: Record<string, string> = {
      'auth.login': 'POST',
      'auth.register': 'POST',
      'auth.logout': 'POST',
      'documents.create': 'POST',
      'documents.update': 'PUT',
      'documents.delete': 'DELETE',
      'workflows.create': 'POST',
      'workflows.update': 'PUT',
      'files.upload': 'POST',
      'ai.generate': 'POST',
      'ai.optimize': 'POST',
    };
    
    if (queryProcedures.includes(procedure)) {
      return 'GET';
    }
    
    return mutationMethods[procedure] || 'POST';
  }
  
  // Record request for analytics
  private recordRequest(metadata: APIRequestMetadata): void {
    this.requestHistory.push(metadata);
    
    // Keep only last 1000 requests to prevent memory leak
    if (this.requestHistory.length > 1000) {
      this.requestHistory = this.requestHistory.slice(-1000);
    }
  }
  
  // Get routing analytics
  public getAnalytics() {
    const totalRequests = this.requestHistory.length;
    
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        strategies: {},
        averageLatency: 0,
        errorRate: 0,
        fallbackRate: 0,
      };
    }
    
    const strategies = this.requestHistory.reduce((acc, req) => {
      acc[req.strategy] = (acc[req.strategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const completedRequests = this.requestHistory.filter(req => req.endTime);
    const averageLatency = completedRequests.reduce(
      (sum, req) => sum + (req.endTime! - req.startTime), 0
    ) / completedRequests.length;
    
    const errorRate = this.requestHistory.filter(req => req.error).length / totalRequests;
    const fallbackRate = this.requestHistory.filter(req => req.fallback).length / totalRequests;
    
    return {
      totalRequests,
      strategies,
      averageLatency,
      errorRate,
      fallbackRate,
      routeHealth: this.routeHealth,
    };
  }
  
  // Clear analytics data
  public clearAnalytics(): void {
    this.requestHistory = [];
  }
  
  // Cleanup resources
  public cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.routingCache.clear();
    this.requestHistory = [];
  }
}

// Create singleton instance
export const apiRouter = new APIRouter();

// Convenience methods for common operations
export const call = apiRouter.call.bind(apiRouter);

// Typed convenience methods
export const authCall = {
  login: (input: any) => call('auth.login', input),
  register: (input: any) => call('auth.register', input),
  logout: () => call('auth.logout'),
  me: () => call('auth.me'),
};

export const documentsCall = {
  list: (input?: any) => call('documents.list', input),
  get: (id: string) => call('documents.get', { id }),
  create: (input: any) => call('documents.create', input),
  update: (id: string, input: any) => call('documents.update', { id, ...input }),
  delete: (id: string) => call('documents.delete', { id }),
};

export const workflowsCall = {
  list: (input?: any) => call('workflows.list', input),
  get: (id: string) => call('workflows.get', { id }),
  create: (input: any) => call('workflows.create', input),
  update: (id: string, input: any) => call('workflows.update', { id, ...input }),
  start: (id: string) => call('workflows.start', { id }),
  complete: (id: string) => call('workflows.complete', { id }),
};

export const aiCall = {
  generate: (input: any) => call('ai.generate', input),
  optimize: (input: any) => call('ai.optimize', input),
};

// Export types
export type { RoutingStrategy, RouteHealth, APIRequestMetadata };