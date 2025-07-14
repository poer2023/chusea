/**
 * Comprehensive error type definitions for ChUseA
 * Provides standardized error handling across the application
 */

// Base error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for better classification
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  CONCURRENCY = 'concurrency',
  WORKFLOW = 'workflow',
  AI_SERVICE = 'ai_service',
  FILE_SYSTEM = 'file_system',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  RATE_LIMIT = 'rate_limit',
  QUOTA = 'quota',
  // M0.4 New error categories
  TRPC = 'trpc',
  WEBSOCKET = 'websocket',
  FASTAPI = 'fastapi',
  REALTIME = 'realtime',
  SYNC = 'sync',
  UNKNOWN = 'unknown'
}

// Retry strategy types
export enum RetryStrategy {
  NONE = 'none',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  FIBONACCI = 'fibonacci',
  CUSTOM = 'custom'
}

// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

// Recovery action types
export enum RecoveryAction {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  IGNORE = 'ignore',
  RELOAD = 'reload',
  REDIRECT = 'redirect',
  LOGOUT = 'logout',
  REFRESH_TOKEN = 'refresh_token',
  CLEAR_CACHE = 'clear_cache',
  SHOW_OFFLINE_MODE = 'show_offline_mode'
}

// Base error interface
export interface BaseError {
  message: string;
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  details?: Record<string, any>;
  stack?: string;
  cause?: Error;
}

// Enhanced error interface with context
export interface ApplicationError extends BaseError {
  context: {
    component?: string;
    action?: string;
    url?: string;
    userAgent?: string;
    location?: string;
    feature?: string;
    workflow?: {
      id: string;
      stepId?: string;
      stepType?: string;
    };
  };
  metadata: {
    canRetry: boolean;
    maxRetries?: number;
    retryDelay?: number;
    retryStrategy?: RetryStrategy;
    recoveryActions: RecoveryAction[];
    shouldReport: boolean;
    isUserFacing: boolean;
    tags?: string[];
  };
  fingerprint?: string; // For error grouping
}

// Specific error types
export interface NetworkError extends ApplicationError {
  category: ErrorCategory.NETWORK;
  networkDetails: {
    status?: number;
    statusText?: string;
    url: string;
    method: string;
    timeout?: boolean;
    offline?: boolean;
    dns?: boolean;
    connection?: boolean;
  };
}

export interface AuthenticationError extends ApplicationError {
  category: ErrorCategory.AUTHENTICATION;
  authDetails: {
    tokenExpired?: boolean;
    invalidCredentials?: boolean;
    twoFactorRequired?: boolean;
    emailNotVerified?: boolean;
    accountLocked?: boolean;
    sessionExpired?: boolean;
  };
}

export interface AuthorizationError extends ApplicationError {
  category: ErrorCategory.AUTHORIZATION;
  authzDetails: {
    requiredPermissions: string[];
    userPermissions: string[];
    resourceId?: string;
    resourceType?: string;
    operation?: string;
  };
}

export interface ValidationError extends ApplicationError {
  category: ErrorCategory.VALIDATION;
  validationDetails: {
    field?: string;
    value?: any;
    rule?: string;
    expectedType?: string;
    constraints?: Record<string, any>;
    errors?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
}

export interface TimeoutError extends ApplicationError {
  category: ErrorCategory.TIMEOUT;
  timeoutDetails: {
    timeout: number;
    elapsed: number;
    operation: string;
    signal?: 'user' | 'system';
  };
}

export interface ConcurrencyError extends ApplicationError {
  category: ErrorCategory.CONCURRENCY;
  concurrencyDetails: {
    conflictType: 'version' | 'lock' | 'resource';
    resourceId: string;
    expectedVersion?: string;
    actualVersion?: string;
    lockHolder?: string;
  };
}

export interface WorkflowError extends ApplicationError {
  category: ErrorCategory.WORKFLOW;
  workflowDetails: {
    workflowId: string;
    stepId?: string;
    stepType?: string;
    stepIndex?: number;
    totalSteps?: number;
    canResume: boolean;
    rollbackAvailable: boolean;
    state?: any;
  };
}

export interface AIServiceError extends ApplicationError {
  category: ErrorCategory.AI_SERVICE;
  aiDetails: {
    model?: string;
    provider?: string;
    quotaExceeded?: boolean;
    rateLimited?: boolean;
    modelUnavailable?: boolean;
    invalidPrompt?: boolean;
    contentFilter?: boolean;
  };
}

export interface FileSystemError extends ApplicationError {
  category: ErrorCategory.FILE_SYSTEM;
  fileDetails: {
    path?: string;
    operation: 'read' | 'write' | 'delete' | 'upload' | 'download';
    fileSize?: number;
    fileType?: string;
    permissions?: boolean;
    diskSpace?: boolean;
  };
}

export interface RateLimitError extends ApplicationError {
  category: ErrorCategory.RATE_LIMIT;
  rateLimitDetails: {
    limit: number;
    remaining: number;
    reset: number;
    scope: string;
    retryAfter?: number;
  };
}

export interface QuotaError extends ApplicationError {
  category: ErrorCategory.QUOTA;
  quotaDetails: {
    type: string;
    limit: number;
    used: number;
    remaining: number;
    resetDate?: string;
    upgradeAvailable?: boolean;
  };
}

// M0.4 New Error Types
export interface tRPCError extends ApplicationError {
  category: ErrorCategory.TRPC;
  trpcDetails: {
    procedure?: string;
    input?: any;
    httpStatus?: number;
    code: string; // UNAUTHORIZED, FORBIDDEN, NOT_FOUND, etc.
    shape?: 'TRPCError';
    zodError?: {
      fieldErrors: Record<string, string[]>;
      formErrors: string[];
    };
    cause?: {
      code?: string;
      message?: string;
      stack?: string;
    };
    clientSide?: boolean;
    batchIndex?: number;
  };
}

export interface WebSocketError extends ApplicationError {
  category: ErrorCategory.WEBSOCKET;
  websocketDetails: {
    url: string;
    readyState: number; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
    closeCode?: number;
    closeReason?: string;
    wasClean?: boolean;
    reconnectAttempt?: number;
    maxReconnectAttempts?: number;
    lastHeartbeat?: number;
    messageType?: string;
    messageId?: string;
    queueSize?: number;
    operation: 'connect' | 'send' | 'receive' | 'close' | 'heartbeat' | 'auth';
  };
}

export interface FastAPIError extends ApplicationError {
  category: ErrorCategory.FASTAPI;
  fastapiDetails: {
    endpoint: string;
    method: string;
    httpStatus: number;
    detail?: string | Array<{
      loc: (string | number)[];
      msg: string;
      type: string;
      input?: any;
    }>;
    headers?: Record<string, string>;
    requestId?: string;
    isValidationError?: boolean;
    isDependencyError?: boolean;
  };
}

export interface RealtimeError extends ApplicationError {
  category: ErrorCategory.REALTIME;
  realtimeDetails: {
    channel?: string;
    event?: string;
    operation: 'subscribe' | 'unsubscribe' | 'publish' | 'presence' | 'sync';
    messageId?: string;
    connectionId?: string;
    latency?: number;
    bufferOverflow?: boolean;
    presenceInfo?: {
      userId: string;
      documentId?: string;
      workflowId?: string;
    };
  };
}

export interface SyncError extends ApplicationError {
  category: ErrorCategory.SYNC;
  syncDetails: {
    entity: 'workflow' | 'document' | 'user' | 'step';
    entityId: string;
    operation: 'create' | 'update' | 'delete' | 'patch';
    localVersion?: number;
    remoteVersion?: number;
    conflictType?: 'version' | 'concurrent' | 'offline';
    conflictResolution?: 'manual' | 'auto' | 'failed';
    pendingOperations?: number;
    lastSyncTime?: number;
    syncStrategy?: 'optimistic' | 'pessimistic' | 'eventual';
  };
}

// Union type for all error types
export type ChUseAError = 
  | NetworkError
  | AuthenticationError
  | AuthorizationError
  | ValidationError
  | TimeoutError
  | ConcurrencyError
  | WorkflowError
  | AIServiceError
  | FileSystemError
  | RateLimitError
  | QuotaError
  // M0.4 New error types
  | tRPCError
  | WebSocketError
  | FastAPIError
  | RealtimeError
  | SyncError
  | ApplicationError;

// Error handler configuration
export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  enableNotifications: boolean;
  enableRetry: boolean;
  enableCircuitBreaker: boolean;
  defaultRetryAttempts: number;
  defaultRetryDelay: number;
  retryStrategy: RetryStrategy;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  reportingEndpoint?: string;
  reportingApiKey?: string;
  enableDevelopmentMode: boolean;
}

// Retry configuration
export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  strategy: RetryStrategy;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryCondition?: (error: ChUseAError) => boolean;
  onRetry?: (error: ChUseAError, attempt: number) => void;
  onFailure?: (error: ChUseAError) => void;
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  timeout: number;
  monitoringPeriod: number;
  fallback?: () => any;
  onOpen?: () => void;
  onClose?: () => void;
  onHalfOpen?: () => void;
}

// Error recovery configuration
export interface RecoveryConfig {
  actions: RecoveryAction[];
  autoRecover: boolean;
  showRecoveryOptions: boolean;
  recoveryTimeout?: number;
  fallbackComponent?: React.ComponentType;
  onRecovery?: (action: RecoveryAction) => void;
}

// Error reporting configuration
export interface ReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  maxReports: number;
  reportingInterval: number;
  includeUserData: boolean;
  includeSystemInfo: boolean;
  includeBreadcrumbs: boolean;
  customTags?: Record<string, string>;
  beforeSend?: (error: ChUseAError) => ChUseAError | null;
}

// Error notification configuration
export interface NotificationConfig {
  enabled: boolean;
  showToast: boolean;
  showModal: boolean;
  showBanner: boolean;
  toastDuration: number;
  position: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoClose: boolean;
  showRetryButton: boolean;
  showDetailsButton: boolean;
}

// Error context for enhanced error information
export interface ErrorContext {
  component?: string;
  action?: string;
  feature?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  buildVersion?: string;
  environment: 'development' | 'staging' | 'production';
  breadcrumbs?: ErrorBreadcrumb[];
  performance?: {
    memory?: MemoryInfo;
    timing?: PerformanceTiming;
    navigation?: PerformanceNavigation;
  };
}

// Breadcrumb for error tracking
export interface ErrorBreadcrumb {
  timestamp: string;
  category: string;
  message?: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// Error metrics for monitoring
export interface ErrorMetrics {
  count: number;
  rate: number;
  averageResponseTime?: number;
  successRate: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  topErrors: Array<{
    code: string;
    message: string;
    count: number;
    percentage: number;
  }>;
  trends: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
}

// Error handler result
export interface ErrorHandlerResult {
  handled: boolean;
  recovered: boolean;
  retry: boolean;
  fallback?: any;
  userMessage?: string;
  technicalMessage?: string;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
}

// Function type definitions
export type ErrorHandler = (error: ChUseAError, context?: ErrorContext) => Promise<ErrorHandlerResult>;
export type ErrorTransformer = (error: any) => ChUseAError;
export type ErrorClassifier = (error: any) => ErrorCategory;
export type RecoveryHandler = (error: ChUseAError, action: RecoveryAction) => Promise<boolean>;

// Error boundary props
export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: ErrorHandler;
  enableRetry?: boolean;
  retryConfig?: Partial<RetryConfig>;
  recoveryConfig?: Partial<RecoveryConfig>;
  children: React.ReactNode;
}

// Error hook return type
export interface UseErrorReturn {
  captureError: (error: any, context?: Partial<ErrorContext>) => void;
  clearErrors: () => void;
  retry: (errorId?: string) => Promise<void>;
  recover: (errorId: string, action: RecoveryAction) => Promise<void>;
  errors: ChUseAError[];
  isRetrying: boolean;
  isRecovering: boolean;
  hasErrors: boolean;
}

// API error response format
export interface APIErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
    timestamp: string;
    requestId?: string;
    validation?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
  status: number;
  statusText: string;
}

// Global error state
export interface GlobalErrorState {
  errors: Map<string, ChUseAError>;
  isInitialized: boolean;
  config: ErrorHandlerConfig;
  metrics: ErrorMetrics;
  circuitBreakers: Map<string, CircuitBreakerState>;
  rateLimits: Map<string, number>;
}