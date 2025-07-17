/**
 * API客户端和认证系统入口文件
 * 提供统一的导入接口
 */

// ===== API客户端 =====
export {
  ApiClient,
  ApiClientError,
  apiClient as default,
  apiClient,
} from './api-client';

// ===== 认证系统 =====
export {
  AuthManager,
  authManager,
  useAuth,
  useAuthState,
  useAuthListener,
  hasPermission,
  hasRole,
  requireAuth,
  createRouteGuard,
  tryAutoLogin,
  getAuthHeader,
} from './auth';

// ===== 类型定义 =====
export type {
  // 基础类型
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginatedResponse,
  RequestConfig,
  UploadConfig,
  
  // 用户相关
  User,
  UserProfile,
  UserPreferences,
  CreateUserRequest,
  UpdateUserRequest,
  
  // 认证相关
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  VerifyTokenResponse,
  AuthState,
  
  // 文档相关
  Document,
  DocumentMetadata,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentFilters,
  DocumentStats,
  
  // 文献相关
  Literature,
  LiteratureMetadata,
  CreateLiteratureRequest,
  UpdateLiteratureRequest,
  LiteratureSearchRequest,
  LiteratureSearchResponse,
  LiteratureFilters,
  CitationRequest,
  CitationResponse,
  
  // 写作相关
  WritingRequest,
  WritingResponse,
  WritingSuggestion,
  WritingModeInfo,
  
  // 工作流相关
  WorkflowConfig,
  WorkflowNode,
  WorkflowNodeMetrics,
  StartWorkflowRequest,
  WorkflowResponse,
  WorkflowStatusResponse,
  
  // 工具相关
  FormatConversionRequest,
  FormatConversionResponse,
  ChartGenerationRequest,
  ChartGenerationResponse,
  DataAnalysisRequest,
  DataAnalysisResponse,
  
  // 文件相关
  FileUploadRequest,
  FileUploadResponse,
  FileUploadProgress,
  FileMetadata,
  
  // WebSocket相关
  WebSocketMessage,
  WorkflowUpdateMessage,
  NotificationMessage,
  NotificationAction,
  
  // 系统相关
  HealthCheckResponse,
  ComponentHealth,
  ApiInfo,
} from './types/api';

// ===== 枚举类型 =====
export {
  DocumentType,
  DocumentStatus,
  LiteratureSource,
  CitationStyle,
  WritingMode,
  WritingAction,
  WorkflowStatus,
  NodeType,
  NodeStatus,
  ToolType,
  ChartType,
} from './types/api';

// ===== 类型守卫 =====
export {
  isApiError,
  isPaginatedResponse,
  isDocumentType,
  isLiteratureSource,
  isWritingMode,
  isWorkflowStatus,
  isChartType,
} from './types/api';

// ===== 配置 =====
export {
  apiConfig,
  authConfig,
  featureFlags,
  appConfig,
  devConfig,
  configHelpers,
  getConfig,
  validateConfig,
} from './config';

// ===== 工具函数 =====

/**
 * 初始化API客户端和认证系统
 */
export async function initializeApi(options: {
  autoLogin?: boolean;
  validateConfig?: boolean;
  warmupCache?: boolean;
} = {}) {
  const {
    autoLogin = true,
    validateConfig: shouldValidateConfig = true,
    warmupCache = true,
  } = options;

  // 验证配置
  if (shouldValidateConfig) {
    const { validateConfig } = await import('./config');
    if (!validateConfig()) {
      throw new Error('Invalid configuration detected');
    }
  }

  // 尝试自动登录
  if (autoLogin) {
    const { tryAutoLogin } = await import('./auth');
    try {
      await tryAutoLogin();
    } catch (error) {
      console.warn('Auto login failed:', error);
    }
  }

  // 预热缓存
  if (warmupCache) {
    try {
      await apiClient.warmupCache();
    } catch (error) {
      console.warn('Cache warmup failed:', error);
    }
  }

  return {
    apiClient,
    authManager: (await import('./auth')).authManager,
  };
}

/**
 * 清理API客户端和认证系统
 */
export function cleanupApi() {
  // 清理缓存
  apiClient.clearCache();
  
  // 如果已认证，执行登出
  if (authManager.isAuthenticated()) {
    authManager.logout();
  }
}

/**
 * 获取API客户端实例
 */
export function getApiClient() {
  return apiClient;
}

/**
 * 获取认证管理器实例
 */
export function getAuthManager() {
  return authManager;
}

/**
 * 检查系统健康状态
 */
export async function checkSystemHealth() {
  try {
    const health = await apiClient.healthCheck();
    return {
      isHealthy: health.status === 'healthy',
      details: health,
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 获取API信息
 */
export async function getApiInfo() {
  try {
    return await apiClient.getApiInfo();
  } catch (error) {
    console.error('Failed to get API info:', error);
    return null;
  }
}

/**
 * 创建带认证的fetch函数
 */
export function createAuthenticatedFetch() {
  return async (url: string, options: RequestInit = {}) => {
    const { getAuthHeader } = await import('./auth');
    const authHeaders = getAuthHeader();
    
    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };
}

/**
 * 创建WebSocket连接的工厂函数
 */
export function createWebSocketFactory() {
  return {
    createWorkflowSocket: (documentId: string) => {
      return apiClient.createWorkflowWebSocket(documentId);
    },
    createCustomSocket: (endpoint: string) => {
      return apiClient.createWebSocket(endpoint);
    },
  };
}

/**
 * 批量操作工具
 */
export const batchOperations = {
  /**
   * 批量创建文档
   */
  createDocuments: async (documents: CreateDocumentRequest[]) => {
    const results = await Promise.allSettled(
      documents.map(doc => apiClient.createDocument(doc))
    );
    
    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  },

  /**
   * 批量删除文档
   */
  deleteDocuments: async (documentIds: string[]) => {
    const results = await Promise.allSettled(
      documentIds.map(id => apiClient.deleteDocument(id))
    );
    
    return results.map((result, index) => ({
      id: documentIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason : null,
    }));
  },

  /**
   * 批量保存文献
   */
  saveLiterature: async (literature: CreateLiteratureRequest[]) => {
    const results = await Promise.allSettled(
      literature.map(lit => apiClient.saveLiterature(lit))
    );
    
    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  },
};

/**
 * 缓存管理工具
 */
export const cacheManager = {
  /**
   * 清除所有缓存
   */
  clearAll: () => {
    apiClient.clearCache();
  },

  /**
   * 按模式清除缓存
   */
  clearByPattern: (pattern: string) => {
    apiClient.clearCacheByPattern(pattern);
  },

  /**
   * 预热常用缓存
   */
  warmup: async () => {
    await apiClient.warmupCache();
  },

  /**
   * 清除文档相关缓存
   */
  clearDocuments: () => {
    apiClient.clearCacheByPattern('/documents');
  },

  /**
   * 清除文献相关缓存
   */
  clearLiterature: () => {
    apiClient.clearCacheByPattern('/literature');
  },
};

/**
 * 错误处理工具
 */
export const errorHandler = {
  /**
   * 判断是否是网络错误
   */
  isNetworkError: (error: any): boolean => {
    return error instanceof TypeError && error.message.includes('fetch');
  },

  /**
   * 判断是否是认证错误
   */
  isAuthError: (error: any): boolean => {
    return error instanceof ApiClientError && 
           ['UNAUTHORIZED', 'FORBIDDEN'].includes(error.code);
  },

  /**
   * 判断是否是验证错误
   */
  isValidationError: (error: any): boolean => {
    return error instanceof ApiClientError && error.code === 'VALIDATION_ERROR';
  },

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage: (error: any): string => {
    if (error instanceof ApiClientError) {
      switch (error.code) {
        case 'UNAUTHORIZED':
          return '请重新登录';
        case 'FORBIDDEN':
          return '权限不足';
        case 'NOT_FOUND':
          return '请求的资源不存在';
        case 'VALIDATION_ERROR':
          return '输入数据有误，请检查后重试';
        case 'NETWORK_ERROR':
          return '网络连接失败，请检查网络';
        default:
          return error.message || '操作失败，请重试';
      }
    }
    
    return '未知错误，请重试';
  },
};

// ===== 默认导出 =====
export default {
  // 核心实例
  apiClient,
  authManager: getAuthManager(),
  
  // 初始化和清理
  initialize: initializeApi,
  cleanup: cleanupApi,
  
  // 工具函数
  checkHealth: checkSystemHealth,
  getInfo: getApiInfo,
  createAuthFetch: createAuthenticatedFetch,
  createWebSocket: createWebSocketFactory,
  
  // 批量操作
  batch: batchOperations,
  
  // 缓存管理
  cache: cacheManager,
  
  // 错误处理
  error: errorHandler,
};