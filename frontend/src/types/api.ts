// Core API types for ChUseA application
import { User, WritingWorkflow } from './index';
import { Document } from './document';

// Base API response wrapper
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// API error structure  
export interface APIError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
  stack?: string; // Only in development
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Common filter parameters
export interface FilterParams {
  search?: string;
  tags?: string[];
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

// Request/Response types for specific endpoints

// Auth endpoints
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User endpoints
export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  preferences?: Partial<User['preferences']>;
}

export interface UpdateUserResponse {
  user: User;
}

// Document endpoints
export interface CreateDocumentRequest {
  title: string;
  content?: string;
  tags?: string[];
  metadata?: Partial<Document['metadata']>;
}

export interface CreateDocumentResponse {
  document: Document;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  tags?: string[];
  metadata?: Partial<Document['metadata']>;
  status?: Document['status'];
}

export interface UpdateDocumentResponse {
  document: Document;
}

export interface GetDocumentsRequest extends PaginationParams, FilterParams {
  // Additional document-specific filters
}

export interface GetDocumentsResponse {
  documents: Document[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DeleteDocumentResponse {
  success: boolean;
  deletedAt: string;
}

// File upload types
export interface UploadFileRequest {
  file: File;
  documentId?: string;
  purpose: 'document' | 'avatar' | 'attachment';
}

export interface UploadFileResponse {
  fileId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// AI Writing endpoints
export interface AIWritingRequest {
  prompt: string;
  style?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  context?: string;
  previousContent?: string;
  documentId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIWritingResponse {
  content: string;
  suggestions?: string[];
  metadata: {
    model: string;
    tokensUsed: number;
    confidence: number;
    processingTime: number;
    requestId: string;
  };
}

// 新的写作API类型定义
export interface WritingRequest {
  prompt: string;
  mode?: string;
  context?: string;
  documentId?: string;
  style?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  temperature?: number;
  maxTokens?: number;
}

export interface WritingResponse {
  content: string;
  suggestions?: string[];
  metadata?: {
    model: string;
    tokensUsed: number;
    confidence: number;
    processingTime: number;
    requestId: string;
  };
}

export interface WritingSuggestion {
  id: string;
  type: 'error' | 'warning' | 'improvement' | 'suggestion' | 'replacement';
  message: string;
  originalText?: string;
  suggestedText?: string;
  confidence?: number;
  category?: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface WritingModeInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters?: Record<string, any>;
}

export interface AIOptimizeRequest {
  content: string;
  optimizationType: 'grammar' | 'style' | 'clarity' | 'tone' | 'length';
  targetAudience?: string;
  language?: string;
}

export interface AIOptimizeResponse {
  optimizedContent: string;
  changes: Array<{
    type: 'addition' | 'deletion' | 'modification';
    original: string;
    modified: string;
    reason: string;
    position: {
      start: number;
      end: number;
    };
  }>;
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    requestId: string;
  };
}

// Workflow endpoints
export interface CreateWorkflowRequest {
  documentId: string;
  templateId?: string;
  customSteps?: Array<{
    step: string;
    order: number;
    config?: Record<string, any>;
  }>;
}

export interface CreateWorkflowResponse {
  workflow: WritingWorkflow;
}

export interface UpdateWorkflowRequest {
  currentStep?: WritingWorkflow['currentStep'];
  stepData?: Record<string, any>;
  progress?: number;
}

export interface UpdateWorkflowResponse {
  workflow: WritingWorkflow;
}

export interface GetWorkflowsRequest extends PaginationParams {
  documentId?: string;
  status?: 'active' | 'completed' | 'paused';
}

export interface GetWorkflowsResponse {
  workflows: WritingWorkflow[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search endpoints
export interface SearchRequest {
  query: string;
  filters?: {
    type?: ('documents' | 'workflows' | 'templates')[];
    tags?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
  };
  pagination?: PaginationParams;
}

export interface SearchResponse {
  results: Array<{
    type: 'document' | 'workflow' | 'template';
    id: string;
    title: string;
    snippet: string;
    relevanceScore: number;
    data: Document | WritingWorkflow | any;
  }>;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
    searchTime: number;
  };
}

// Analytics endpoints
export interface AnalyticsRequest {
  dateRange: {
    from: string;
    to: string;
  };
  metrics: ('writing_time' | 'documents_created' | 'ai_usage' | 'workflow_completion')[];
  granularity?: 'day' | 'week' | 'month';
}

export interface AnalyticsResponse {
  metrics: Record<string, Array<{
    date: string;
    value: number;
  }>>;
  summary: {
    totalWritingTime: number;
    totalDocuments: number;
    totalAIUsage: number;
    averageCompletionRate: number;
  };
}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  messageId: string;
}

export interface DocumentUpdateMessage {
  documentId: string;
  changes: Array<{
    type: 'insert' | 'delete' | 'retain';
    content?: string;
    length?: number;
    position: number;
  }>;
  userId: string;
  timestamp: string;
}

export interface WorkflowUpdateMessage {
  workflowId: string;
  step: WritingWorkflow['currentStep'];
  progress: number;
  data?: Record<string, any>;
  timestamp: string;
}

export interface AIGenerationMessage {
  requestId: string;
  status: 'started' | 'progress' | 'completed' | 'error';
  content?: string;
  progress?: number;
  error?: string;
  timestamp: string;
}

// Type guards for API responses
export const isAPIResponse = <T>(obj: any): obj is APIResponse<T> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    'timestamp' in obj &&
    'data' in obj
  );
};

export const isAPIError = (obj: any): obj is APIError => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    'code' in obj &&
    'timestamp' in obj
  );
};

// HTTP method types
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request configuration
export interface RequestConfig {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onUploadProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
  useCache?: boolean; // Custom cache flag for API client
}

// Client configuration
export interface APIClientConfig {
  baseURL: string;
  version: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableLogging: boolean;
  enableDevTools: boolean;
}