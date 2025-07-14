/**
 * FastAPI端点定义和映射
 * 基于FastAPI后端的实际路由结构
 */

// FastAPI基础配置
export const FASTAPI_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002',
  API_PREFIX: '/api',
  VERSION: '', // FastAPI不使用版本前缀
  DEFAULT_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  UPLOAD_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT || '300000'), // 5分钟上传超时
  DOWNLOAD_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT || '300000'), // 5分钟下载超时
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_FASTAPI_WS_URL || 'ws://localhost:8002',
  
  // 开发环境配置
  DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
  ENABLE_DEV_LOGIN: process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true',
  
  // 性能配置
  ENABLE_CACHING: process.env.NEXT_PUBLIC_ENABLE_CACHING !== 'false',
  CACHE_DURATION: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000'),
  
  // 健康检查配置
  HEALTH_CHECK_INTERVAL: parseInt(process.env.NEXT_PUBLIC_HEALTH_CHECK_INTERVAL || '30000'),
  HEALTH_CHECK_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_HEALTH_CHECK_TIMEOUT || '5000'),
  
  // 日志配置
  ENABLE_LOGGING: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
} as const;

// FastAPI端点定义
export const FASTAPI_ENDPOINTS = {
  // 根端点和健康检查
  ROOT: '/',
  HEALTH: '/health',

  // 认证端点 (/api/auth)
  AUTH: {
    BASE: '/auth',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGIN_JSON: '/auth/login-json',
    ME: '/auth/me',
    VERIFY: '/auth/verify',
    DEV_LOGIN: '/auth/dev-login',
    DEV_STATUS: '/auth/dev-status',
  },

  // 文档管理端点 (/api/documents)
  DOCUMENTS: {
    BASE: '/documents',
    LIST: '/documents',
    GET: (id: string | number) => `/documents/${id}`,
    CREATE: '/documents',
    UPDATE: (id: string | number) => `/documents/${id}`,
    DELETE: (id: string | number) => `/documents/${id}`,
    DUPLICATE: (id: string | number) => `/documents/${id}/duplicate`,
    STATS: '/documents/stats/overview',
  },

  // 写作端点 (/api/writing)
  WRITING: {
    BASE: '/writing',
    GENERATE: '/writing/generate',
    IMPROVE: '/writing/improve',
    CONVERT: '/writing/convert',
    SUGGESTIONS: (mode: string) => `/writing/suggestions/${mode}`,
    MODES: '/writing/modes',
  },

  // 文献端点 (/api/literature)
  LITERATURE: {
    BASE: '/literature',
    SEARCH: '/literature/search',
    LIST: '/literature',
    GET: (id: string | number) => `/literature/${id}`,
    CREATE: '/literature',
    UPDATE: (id: string | number) => `/literature/${id}`,
    DELETE: (id: string | number) => `/literature/${id}`,
    UPLOAD: '/literature/upload',
    DOWNLOAD: (id: string | number) => `/literature/${id}/download`,
    FAVORITES: '/literature/favorites',
    TOGGLE_FAVORITE: (id: string | number) => `/literature/${id}/favorite`,
  },

  // 工具端点 (/api/tools)
  TOOLS: {
    BASE: '/tools',
    FORMAT_CONVERT: '/tools/format/convert',
    CHART_GENERATE: '/tools/chart/generate',
    READABILITY_CHECK: '/tools/readability/check',
    GRAMMAR_CHECK: '/tools/grammar/check',
    CITATION_VALIDATE: '/tools/citation/validate',
    EXPORT: '/tools/export',
    IMPORT: '/tools/import',
  },

  // 工作流端点 (/api/workflow)
  WORKFLOW: {
    BASE: '/workflow',
    DOCUMENTS: '/workflow/documents',
    GET_DOCUMENTS: '/workflow/documents',
    CREATE_DOCUMENT: '/workflow/documents',
    START: '/workflow/start',
    STOP: (documentId: string) => `/workflow/${documentId}/stop`,
    STATUS: (documentId: string) => `/workflow/${documentId}/status`,
    ROLLBACK: (documentId: string, nodeId: string) => `/workflow/${documentId}/rollback/${nodeId}`,
    NODES: (documentId: string) => `/workflow/${documentId}/nodes`,
    WEBSOCKET: (documentId: string) => `/workflow/ws/${documentId}`,
  },

  // WebSocket端点 (/api)
  WEBSOCKET: {
    BASE: '/ws',
    CONNECT: '/ws/connect',
    DISCONNECT: '/ws/disconnect',
    WORKFLOW: (documentId: string) => `/ws/workflow/${documentId}`,
  },

  // 文件上传/下载端点
  FILES: {
    UPLOAD: '/files/upload',
    UPLOAD_INIT: '/files/upload/init',
    UPLOAD_CHUNK: '/files/upload/chunk',
    UPLOAD_COMPLETE: '/files/upload/complete',
    UPLOAD_ABORT: '/files/upload/abort',
    DOWNLOAD: (fileId: string) => `/files/${fileId}/download`,
  },
} as const;

// HTTP状态码定义
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// 错误代码定义
export const FASTAPI_ERROR_CODES = {
  // 通用错误
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',

  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // 请求错误
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',

  // 文件错误
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',

  // 业务逻辑错误
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  LITERATURE_NOT_FOUND: 'LITERATURE_NOT_FOUND',
  WORKFLOW_ERROR: 'WORKFLOW_ERROR',
  AGENT_ERROR: 'AGENT_ERROR',
} as const;

// FastAPI特定配置
export const FASTAPI_LIMITS = {
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || (100 * 1024 * 1024).toString()), // 100MB
  MAX_FILES_PER_UPLOAD: 10,
  MAX_RETRIES: parseInt(process.env.NEXT_PUBLIC_API_RETRY_COUNT || '3'),
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000'),
  RETRY_BACKOFF_FACTOR: 2,
  RATE_LIMIT_WINDOW: 1000, // 1秒
  MAX_CONTENT_LENGTH: 10 * 1024 * 1024, // 10MB for request body
  TOKEN_REFRESH_THRESHOLD: parseInt(process.env.NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD || '300000'), // 5分钟
  SUPPORTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  SUPPORTED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/rtf',
    'text/csv',
    'application/json',
  ],
  SUPPORTED_AUDIO_TYPES: [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/webm',
  ],
  SUPPORTED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],
} as const;

// 构建完整URL的辅助函数
export const buildFastAPIUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || FASTAPI_CONFIG.BASE_URL;
  const prefix = FASTAPI_CONFIG.API_PREFIX;
  
  // 如果端点已经包含API前缀或是根端点，直接拼接
  if (endpoint.startsWith('/api') || endpoint === '/' || endpoint === '/health') {
    return `${base}${endpoint}`;
  }
  
  // 否则添加API前缀
  return `${base}${prefix}${endpoint}`;
};

// 构建WebSocket URL的辅助函数
export const buildFastAPIWebSocketUrl = (endpoint: string, wsUrl?: string): string => {
  const base = wsUrl || FASTAPI_CONFIG.WEBSOCKET_URL;
  return `${base}${endpoint}`;
};

// 端点验证器
export const validateEndpoint = (endpoint: string): boolean => {
  // 简单的端点格式验证
  return typeof endpoint === 'string' && endpoint.startsWith('/');
};

// 查询参数构建器
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// 分页参数构建器
export const buildPaginationParams = (page?: number, pageSize?: number, search?: string): Record<string, any> => {
  const params: Record<string, any> = {};
  
  if (page !== undefined && page > 0) params.page = page;
  if (pageSize !== undefined && pageSize > 0) params.page_size = pageSize;
  if (search) params.search = search;
  
  return params;
};

// 文档过滤参数构建器
export const buildDocumentFilters = (
  documentType?: string,
  search?: string,
  page?: number,
  pageSize?: number
): Record<string, any> => {
  const params: Record<string, any> = {};
  
  if (documentType) params.document_type = documentType;
  if (search) params.search = search;
  if (page !== undefined && page > 0) params.page = page;
  if (pageSize !== undefined && pageSize > 0) params.page_size = pageSize;
  
  return params;
};

// 错误代码映射到HTTP状态码
export const mapErrorCodeToStatus = (errorCode: string): number => {
  switch (errorCode) {
    case FASTAPI_ERROR_CODES.BAD_REQUEST:
    case FASTAPI_ERROR_CODES.VALIDATION_ERROR:
      return HTTP_STATUS.BAD_REQUEST;
    case FASTAPI_ERROR_CODES.UNAUTHORIZED:
    case FASTAPI_ERROR_CODES.INVALID_CREDENTIALS:
    case FASTAPI_ERROR_CODES.TOKEN_EXPIRED:
    case FASTAPI_ERROR_CODES.TOKEN_INVALID:
      return HTTP_STATUS.UNAUTHORIZED;
    case FASTAPI_ERROR_CODES.FORBIDDEN:
      return HTTP_STATUS.FORBIDDEN;
    case FASTAPI_ERROR_CODES.NOT_FOUND:
    case FASTAPI_ERROR_CODES.DOCUMENT_NOT_FOUND:
    case FASTAPI_ERROR_CODES.LITERATURE_NOT_FOUND:
      return HTTP_STATUS.NOT_FOUND;
    case FASTAPI_ERROR_CODES.CONFLICT:
      return HTTP_STATUS.CONFLICT;
    case FASTAPI_ERROR_CODES.FILE_TOO_LARGE:
    case FASTAPI_ERROR_CODES.INVALID_FILE_TYPE:
      return HTTP_STATUS.UNPROCESSABLE_ENTITY;
    default:
      return HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
};

// 导出所有端点和配置
export default {
  FASTAPI_CONFIG,
  FASTAPI_ENDPOINTS,
  HTTP_STATUS,
  FASTAPI_ERROR_CODES,
  FASTAPI_LIMITS,
  buildFastAPIUrl,
  buildFastAPIWebSocketUrl,
  validateEndpoint,
  buildQueryParams,
  buildPaginationParams,
  buildDocumentFilters,
  mapErrorCodeToStatus,
};