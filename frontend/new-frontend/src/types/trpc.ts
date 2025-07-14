/**
 * tRPC类型定义
 * 
 * 基于实际的tRPC路由器生成类型安全的接口
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter as ServerAppRouter } from '@/server/api/root';

// 导入实际的路由器类型
export type AppRouter = ServerAppRouter;

// 通用的API响应类型
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页信息类型
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// 用户类型
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  timezone?: string;
  language?: 'zh-CN' | 'en-US';
  dateFormat?: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// 用户偏好设置类型
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showActivity: boolean;
    allowMessages: boolean;
  };
  editor: {
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    autoSave: boolean;
  };
}

// 文档类型
export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'text' | 'html';
  authorId: string;
  folderId?: string;
  tags: string[];
  isPublic: boolean;
  allowComments: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// 文件夹类型
export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  color?: string;
  ownerId: string;
  createdAt: Date;
}

// 工作流节点类型
export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision' | 'api' | 'ai';
  label: string;
  position: {
    x: number;
    y: number;
  };
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// 工作流边类型
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

// 工作流类型
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  tags: string[];
  isActive: boolean;
  trigger?: {
    type: 'manual' | 'schedule' | 'webhook' | 'event';
    config?: Record<string, unknown>;
  };
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
  successRate: number;
}

// 工作流执行类型
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  steps: WorkflowExecutionStep[];
}

// 工作流执行步骤类型
export interface WorkflowExecutionStep {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}

// 用户统计信息类型
export interface UserStats {
  documentsCreated: number;
  workflowsCreated: number;
  totalViews: number;
  lastActive: Date;
}

// 认证会话类型
export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar?: string;
  };
  expires: string;
}

// 以下是原有的占位符类型，保持兼容性
export interface LegacyAppRouter {
  // Authentication procedures
  auth: {
    login: {
      input: {
        email: string;
        password: string;
        rememberMe?: boolean;
      };
      output: {
        user: any;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    };
    register: {
      input: {
        email: string;
        password: string;
        name: string;
        acceptTerms: boolean;
      };
      output: {
        user: any;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    };
    logout: {
      input: void;
      output: void;
    };
    refresh: {
      input: {
        refreshToken: string;
      };
      output: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    };
    me: {
      input: void;
      output: any; // User type
    };
  };

  // Document procedures
  documents: {
    list: {
      input: {
        page?: number;
        pageSize?: number;
        search?: string;
        tags?: string[];
        status?: string;
      };
      output: {
        documents: any[];
        meta: {
          total: number;
          page: number;
          pageSize: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
    };
    get: {
      input: { id: string };
      output: any; // Document type
    };
    create: {
      input: {
        title: string;
        content?: string;
        tags?: string[];
        metadata?: Record<string, any>;
      };
      output: {
        document: any; // Document type
      };
    };
    update: {
      input: {
        id: string;
        title?: string;
        content?: string;
        tags?: string[];
        metadata?: Record<string, any>;
      };
      output: {
        document: any; // Document type
      };
    };
    delete: {
      input: { id: string };
      output: { success: boolean };
    };
  };

  // Workflow procedures
  workflows: {
    list: {
      input: {
        page?: number;
        pageSize?: number;
        documentId?: string;
        status?: string;
      };
      output: {
        workflows: any[];
        meta: {
          total: number;
          page: number;
          pageSize: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
    };
    get: {
      input: { id: string };
      output: any; // Workflow type
    };
    create: {
      input: {
        documentId: string;
        templateId?: string;
        customSteps?: any[];
      };
      output: {
        workflow: any; // Workflow type
      };
    };
    update: {
      input: {
        id: string;
        currentStep?: string;
        stepData?: Record<string, any>;
        progress?: number;
      };
      output: {
        workflow: any; // Workflow type
      };
    };
    start: {
      input: { id: string };
      output: {
        workflow: any; // Workflow type
      };
    };
    complete: {
      input: { id: string };
      output: {
        workflow: any; // Workflow type
      };
    };
  };

  // File procedures
  files: {
    upload: {
      input: {
        file: File;
        documentId?: string;
        purpose: 'document' | 'avatar' | 'attachment';
      };
      output: {
        fileId: string;
        filename: string;
        url: string;
        size: number;
        mimeType: string;
        uploadedAt: string;
      };
    };
    delete: {
      input: { id: string };
      output: { success: boolean };
    };
  };

  // AI procedures
  ai: {
    generate: {
      input: {
        prompt: string;
        style?: string;
        tone?: string;
        length?: 'short' | 'medium' | 'long';
        context?: string;
        documentId?: string;
      };
      output: {
        content: string;
        suggestions?: string[];
        metadata: {
          model: string;
          tokensUsed: number;
          confidence: number;
          processingTime: number;
          requestId: string;
        };
      };
    };
    optimize: {
      input: {
        content: string;
        optimizationType: 'grammar' | 'style' | 'clarity' | 'tone' | 'length';
        targetAudience?: string;
        language?: string;
      };
      output: {
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
        metadata: any;
      };
    };
  };

  // Search procedures
  search: {
    documents: {
      input: {
        query: string;
        filters?: {
          tags?: string[];
          dateRange?: {
            from: string;
            to: string;
          };
        };
        pagination?: {
          page?: number;
          pageSize?: number;
        };
      };
      output: {
        results: Array<{
          type: 'document';
          id: string;
          title: string;
          snippet: string;
          relevanceScore: number;
          data: any;
        }>;
        meta: any;
      };
    };
    global: {
      input: {
        query: string;
        types?: ('documents' | 'workflows' | 'templates')[];
        filters?: Record<string, any>;
      };
      output: {
        results: Array<{
          type: string;
          id: string;
          title: string;
          snippet: string;
          relevanceScore: number;
          data: any;
        }>;
        meta: any;
      };
    };
  };

  // Subscription procedures (for real-time features)
  subscriptions: {
    documentUpdates: {
      input: { documentId: string };
      output: {
        documentId: string;
        changes: any[];
        userId: string;
        timestamp: string;
      };
    };
    workflowUpdates: {
      input: { workflowId: string };
      output: {
        workflowId: string;
        step: string;
        progress: number;
        data?: Record<string, any>;
        timestamp: string;
      };
    };
    aiGeneration: {
      input: { requestId: string };
      output: {
        requestId: string;
        status: 'started' | 'progress' | 'completed' | 'error';
        content?: string;
        progress?: number;
        error?: string;
        timestamp: string;
      };
    };
  };
}

// Infer input and output types
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Specific procedure types
export type LoginInput = RouterInputs['auth']['login'];
export type LoginOutput = RouterOutputs['auth']['login'];
export type RegisterInput = RouterInputs['auth']['register'];
export type RegisterOutput = RouterOutputs['auth']['register'];

export type DocumentListInput = RouterInputs['documents']['list'];
export type DocumentListOutput = RouterOutputs['documents']['list'];
export type DocumentGetInput = RouterInputs['documents']['get'];
export type DocumentGetOutput = RouterOutputs['documents']['get'];
export type DocumentCreateInput = RouterInputs['documents']['create'];
export type DocumentCreateOutput = RouterOutputs['documents']['create'];

// 注意：以下类型引用的是不存在的路由，暂时注释掉
// export type WorkflowListInput = RouterInputs['workflows']['list'];
// export type WorkflowListOutput = RouterOutputs['workflows']['list'];
// export type WorkflowCreateInput = RouterInputs['workflows']['create'];
// export type WorkflowCreateOutput = RouterOutputs['workflows']['create'];

// export type AIGenerateInput = RouterInputs['ai']['generate'];
// export type AIGenerateOutput = RouterOutputs['ai']['generate'];
// export type AIOptimizeInput = RouterInputs['ai']['optimize'];
// export type AIOptimizeOutput = RouterOutputs['ai']['optimize'];

// export type SearchDocumentsInput = RouterInputs['search']['documents'];
// export type SearchDocumentsOutput = RouterOutputs['search']['documents'];

// tRPC client context type
export interface TRPCContext {
  user?: any;
  session?: any;
  req?: any;
  res?: any;
}

// tRPC meta type for middleware
export interface TRPCMeta {
  requireAuth?: boolean;
  permissions?: string[];
  rateLimit?: {
    max: number;
    windowMs: number;
  };
}

// tRPC error codes
export const TRPC_ERROR_CODES = {
  PARSE_ERROR: 'PARSE_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_SUPPORTED: 'METHOD_NOT_SUPPORTED',
  TIMEOUT: 'TIMEOUT',
  CONFLICT: 'CONFLICT',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  UNPROCESSABLE_CONTENT: 'UNPROCESSABLE_CONTENT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  CLIENT_CLOSED_REQUEST: 'CLIENT_CLOSED_REQUEST',
} as const;

export type TRPCErrorCode = keyof typeof TRPC_ERROR_CODES;

// tRPC procedure types
export type TRPCProcedureType = 'query' | 'mutation' | 'subscription';

// tRPC batch request type
export interface TRPCBatchRequest {
  id: number;
  method: 'query' | 'mutation';
  params: {
    path: string;
    input?: any;
  };
}

// tRPC batch response type
export interface TRPCBatchResponse {
  id: number;
  result?: {
    data: any;
  };
  error?: {
    code: TRPCErrorCode;
    message: string;
    data?: any;
  };
}

// tRPC subscription event types
export interface TRPCSubscriptionEvent<T = any> {
  id: string;
  data: T;
  timestamp: string;
}

// tRPC link configuration
export interface TRPCLinkConfig {
  url: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  fetch?: typeof fetch;
  AbortController?: typeof AbortController;
  maxURLLength?: number;
}

// tRPC client configuration
export interface TRPCClientConfig {
  links: any[];
  transformer?: {
    serialize: (data: any) => any;
    deserialize: (data: any) => any;
  };
  defaultOptions?: {
    queries?: any;
    mutations?: any;
    subscriptions?: any;
  };
}

// tRPC procedure builder types (for backend reference)
export interface TRPCProcedureBuilder {
  input?: any;
  output?: any;
  meta?: TRPCMeta;
  resolve: (opts: {
    input: any;
    ctx: TRPCContext;
  }) => Promise<any>;
}

// tRPC router builder types (for backend reference)
export interface TRPCRouterBuilder {
  [key: string]: TRPCProcedureBuilder | TRPCRouterBuilder;
}

// Real-time subscription status
export type SubscriptionStatus = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reconnecting';

// Enhanced subscription options
export interface TRPCSubscriptionOptions<T> {
  onData?: (data: T) => void;
  onError?: (error: any) => void;
  onStarted?: () => void;
  onStopped?: () => void;
  onComplete?: () => void;
  enabled?: boolean;
  retryOnError?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

// Websocket connection state
export interface WebSocketState {
  status: SubscriptionStatus;
  error?: Error;
  reconnectAttempts: number;
  lastConnected?: Date;
  latency?: number;
}

// tRPC query options extension
export interface TRPCQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: any) => number);
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onSettled?: (data: any, error: any) => void;
  select?: (data: any) => any;
  suspense?: boolean;
  useErrorBoundary?: boolean | ((error: any) => boolean);
  meta?: Record<string, any>;
}

// tRPC mutation options extension
export interface TRPCMutationOptions {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
  onSettled?: (data: any, error: any, variables: any, context: any) => void;
  onMutate?: (variables: any) => Promise<any> | any;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: any) => number);
  useErrorBoundary?: boolean | ((error: any) => boolean);
  meta?: Record<string, any>;
}