// API and application constants for ChUseA

// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  VERSION: 'v1',
  
  // FastAPI Backend Configuration
  FASTAPI_BASE_URL: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002',
  FASTAPI_WS_URL: process.env.NEXT_PUBLIC_FASTAPI_WS_URL || 'ws://localhost:8002',
  
  // Timeouts (in milliseconds)
  DEFAULT_TIMEOUT: 30000,          // 30 seconds
  UPLOAD_TIMEOUT: 300000,          // 5 minutes
  DOWNLOAD_TIMEOUT: 180000,        // 3 minutes
  WEBSOCKET_TIMEOUT: 5000,         // 5 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,               // 1 second base delay
  RETRY_BACKOFF_FACTOR: 2,         // Exponential backoff
  
  // Rate limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000,        // 1 minute
  
  // File upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_UPLOAD: 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/csv'
  ],
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Cache configuration
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000,          // 5 minutes
    MEDIUM: 15 * 60 * 1000,        // 15 minutes
    LONG: 60 * 60 * 1000,          // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    TWO_FACTOR: {
      SETUP: '/auth/2fa/setup',
      VERIFY: '/auth/2fa/verify',
      DISABLE: '/auth/2fa/disable',
      BACKUP_CODES: '/auth/2fa/backup-codes'
    },
    SOCIAL: {
      GOOGLE: '/auth/social/google',
      GITHUB: '/auth/social/github',
      LINKEDIN: '/auth/social/linkedin'
    },
    SESSIONS: '/auth/sessions',
    REVOKE_SESSION: (sessionId: string) => `/auth/sessions/${sessionId}`,
    REVOKE_ALL_SESSIONS: '/auth/sessions/revoke-all'
  },
  
  // User management
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DELETE_ACCOUNT: '/user/delete',
    PREFERENCES: '/user/preferences',
    SUBSCRIPTION: '/user/subscription',
    USAGE: '/user/usage',
    AVATAR: '/user/avatar',
    EXPORT_DATA: '/user/export',
    PRIVACY_SETTINGS: '/user/privacy'
  },
  
  // Document management
  DOCUMENTS: {
    LIST: '/documents',
    CREATE: '/documents',
    GET: (id: string) => `/documents/${id}`,
    UPDATE: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
    DUPLICATE: (id: string) => `/documents/${id}/duplicate`,
    ARCHIVE: (id: string) => `/documents/${id}/archive`,
    RESTORE: (id: string) => `/documents/${id}/restore`,
    PUBLISH: (id: string) => `/documents/${id}/publish`,
    UNPUBLISH: (id: string) => `/documents/${id}/unpublish`,
    SHARE: (id: string) => `/documents/${id}/share`,
    UNSHARE: (id: string) => `/documents/${id}/unshare`,
    EXPORT: (id: string, format: string) => `/documents/${id}/export/${format}`,
    IMPORT: '/documents/import',
    VERSIONS: (id: string) => `/documents/${id}/versions`,
    VERSION: (id: string, version: number) => `/documents/${id}/versions/${version}`,
    RESTORE_VERSION: (id: string, version: number) => `/documents/${id}/versions/${version}/restore`,
    COLLABORATORS: (id: string) => `/documents/${id}/collaborators`,
    COMMENTS: (id: string) => `/documents/${id}/comments`,
    SUGGESTIONS: (id: string) => `/documents/${id}/suggestions`,
    ANALYTICS: (id: string) => `/documents/${id}/analytics`
  },
  
  // File management
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/${id}/download`,
    DELETE: (id: string) => `/files/${id}`,
    METADATA: (id: string) => `/files/${id}/metadata`,
    THUMBNAIL: (id: string) => `/files/${id}/thumbnail`,
    PREVIEW: (id: string) => `/files/${id}/preview`
  },
  
  // AI services
  AI: {
    GENERATE: '/ai/generate',
    OPTIMIZE: '/ai/optimize',
    ANALYZE: '/ai/analyze',
    SUGGEST: '/ai/suggest',
    TRANSLATE: '/ai/translate',
    SUMMARIZE: '/ai/summarize',
    MODELS: '/ai/models',
    USAGE: '/ai/usage'
  },
  
  // Workflow management
  WORKFLOWS: {
    LIST: '/workflows',
    CREATE: '/workflows',
    GET: (id: string) => `/workflows/${id}`,
    UPDATE: (id: string) => `/workflows/${id}`,
    DELETE: (id: string) => `/workflows/${id}`,
    START: (id: string) => `/workflows/${id}/start`,
    PAUSE: (id: string) => `/workflows/${id}/pause`,
    RESUME: (id: string) => `/workflows/${id}/resume`,
    COMPLETE: (id: string) => `/workflows/${id}/complete`,
    CANCEL: (id: string) => `/workflows/${id}/cancel`,
    STEPS: (id: string) => `/workflows/${id}/steps`,
    STEP: (id: string, stepId: string) => `/workflows/${id}/steps/${stepId}`,
    TEMPLATES: '/workflows/templates',
    TEMPLATE: (id: string) => `/workflows/templates/${id}`
  },
  
  // Search
  SEARCH: {
    DOCUMENTS: '/search/documents',
    WORKFLOWS: '/search/workflows',
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions'
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    DOCUMENTS: '/analytics/documents',
    WORKFLOWS: '/analytics/workflows',
    AI_USAGE: '/analytics/ai-usage',
    PERFORMANCE: '/analytics/performance',
    EXPORT: '/analytics/export'
  },
  
  // Categories and tags
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    GET: (id: string) => `/categories/${id}`,
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`
  },
  
  TAGS: {
    LIST: '/tags',
    CREATE: '/tags',
    GET: (id: string) => `/tags/${id}`,
    UPDATE: (id: string) => `/tags/${id}`,
    DELETE: (id: string) => `/tags/${id}`,
    SUGGESTIONS: '/tags/suggestions'
  },
  
  // Templates
  TEMPLATES: {
    LIST: '/templates',
    CREATE: '/templates',
    GET: (id: string) => `/templates/${id}`,
    UPDATE: (id: string) => `/templates/${id}`,
    DELETE: (id: string) => `/templates/${id}`,
    DUPLICATE: (id: string) => `/templates/${id}/duplicate`,
    CATEGORIES: '/templates/categories',
    FEATURED: '/templates/featured',
    MY_TEMPLATES: '/templates/my-templates'
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    CLEAR_ALL: '/notifications/clear-all',
    PREFERENCES: '/notifications/preferences'
  },
  
  // System
  SYSTEM: {
    HEALTH: '/system/health',
    STATUS: '/system/status',
    VERSION: '/system/version',
    MAINTENANCE: '/system/maintenance'
  }
} as const;

// HTTP Status Codes
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
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_LENGTH: 'INVALID_LENGTH',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // AI errors
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  AI_MODEL_UNAVAILABLE: 'AI_MODEL_UNAVAILABLE'
} as const;

// Application Constants
export const APP_CONFIG = {
  NAME: 'ChUseA',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Writing Tool',
  AUTHOR: 'ChUseA Team',
  
  // UI Constants
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  
  // Editor Constants
  AUTOSAVE_INTERVAL: 10000,        // 10 seconds
  DEBOUNCE_DELAY: 300,             // 300ms
  UNDO_LIMIT: 50,
  
  // Notification Constants
  TOAST_DURATION: 5000,            // 5 seconds
  MAX_NOTIFICATIONS: 5,
  
  // Animation Constants
  ANIMATION_DURATION: 200,         // 200ms
  ANIMATION_EASING: 'ease-in-out',
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'chusea_auth_token',
    REFRESH_TOKEN: 'chusea_refresh_token',
    USER_PREFERENCES: 'chusea_user_preferences',
    UI_STATE: 'chusea_ui_state',
    DRAFT_DOCUMENTS: 'chusea_draft_documents',
    RECENT_SEARCHES: 'chusea_recent_searches',
    OFFLINE_ACTIONS: 'chusea_offline_actions'
  },
  
  // Supported Languages
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'zh', name: 'Chinese', native: '中文' }
  ],
  
  // Writing Styles
  WRITING_STYLES: [
    'academic',
    'business',
    'casual',
    'creative',
    'formal',
    'informal',
    'journalistic',
    'marketing',
    'persuasive',
    'technical'
  ],
  
  // Tones
  WRITING_TONES: [
    'confident',
    'conversational',
    'empathetic',
    'enthusiastic',
    'formal',
    'friendly',
    'humorous',
    'informative',
    'inspiring',
    'professional'
  ]
} as const;

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  // Authentication
  AUTH: ['auth'] as const,
  USER_PROFILE: () => [...QUERY_KEYS.AUTH, 'profile'] as const,
  USER_PREFERENCES: () => [...QUERY_KEYS.AUTH, 'preferences'] as const,
  USER_SUBSCRIPTION: () => [...QUERY_KEYS.AUTH, 'subscription'] as const,
  USER_SESSIONS: () => [...QUERY_KEYS.AUTH, 'sessions'] as const,
  
  // Documents
  DOCUMENTS: ['documents'] as const,
  DOCUMENTS_LIST: (filters?: any) => [...QUERY_KEYS.DOCUMENTS, 'list', filters] as const,
  DOCUMENT: (id: string) => [...QUERY_KEYS.DOCUMENTS, 'detail', id] as const,
  DOCUMENT_VERSIONS: (id: string) => [...QUERY_KEYS.DOCUMENTS, 'versions', id] as const,
  DOCUMENT_COLLABORATORS: (id: string) => [...QUERY_KEYS.DOCUMENTS, 'collaborators', id] as const,
  DOCUMENT_COMMENTS: (id: string) => [...QUERY_KEYS.DOCUMENTS, 'comments', id] as const,
  DOCUMENT_ANALYTICS: (id: string) => [...QUERY_KEYS.DOCUMENTS, 'analytics', id] as const,
  
  // Workflows
  WORKFLOWS: ['workflows'] as const,
  WORKFLOWS_LIST: (filters?: any) => [...QUERY_KEYS.WORKFLOWS, 'list', filters] as const,
  WORKFLOW: (id: string) => [...QUERY_KEYS.WORKFLOWS, 'detail', id] as const,
  WORKFLOW_STEPS: (id: string) => [...QUERY_KEYS.WORKFLOWS, 'steps', id] as const,
  WORKFLOW_TEMPLATES: () => [...QUERY_KEYS.WORKFLOWS, 'templates'] as const,
  
  // AI
  AI: ['ai'] as const,
  AI_MODELS: () => [...QUERY_KEYS.AI, 'models'] as const,
  AI_USAGE: () => [...QUERY_KEYS.AI, 'usage'] as const,
  
  // Files
  FILES: ['files'] as const,
  FILE: (id: string) => [...QUERY_KEYS.FILES, 'detail', id] as const,
  
  // Categories and Tags
  CATEGORIES: ['categories'] as const,
  TAGS: ['tags'] as const,
  TAG_SUGGESTIONS: (query: string) => [...QUERY_KEYS.TAGS, 'suggestions', query] as const,
  
  // Templates
  TEMPLATES: ['templates'] as const,
  TEMPLATES_LIST: (filters?: any) => [...QUERY_KEYS.TEMPLATES, 'list', filters] as const,
  TEMPLATE: (id: string) => [...QUERY_KEYS.TEMPLATES, 'detail', id] as const,
  
  // Search
  SEARCH: ['search'] as const,
  SEARCH_DOCUMENTS: (query: string, filters?: any) => 
    [...QUERY_KEYS.SEARCH, 'documents', query, filters] as const,
  SEARCH_SUGGESTIONS: (query: string) => 
    [...QUERY_KEYS.SEARCH, 'suggestions', query] as const,
  
  // Analytics
  ANALYTICS: ['analytics'] as const,
  ANALYTICS_DASHBOARD: () => [...QUERY_KEYS.ANALYTICS, 'dashboard'] as const,
  ANALYTICS_DOCUMENTS: (filters?: any) => 
    [...QUERY_KEYS.ANALYTICS, 'documents', filters] as const,
  
  // Notifications
  NOTIFICATIONS: ['notifications'] as const,
  NOTIFICATIONS_LIST: () => [...QUERY_KEYS.NOTIFICATIONS, 'list'] as const,
  
  // System
  SYSTEM: ['system'] as const,
  SYSTEM_HEALTH: () => [...QUERY_KEYS.SYSTEM, 'health'] as const,
  SYSTEM_STATUS: () => [...QUERY_KEYS.SYSTEM, 'status'] as const
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Document collaboration
  DOCUMENT_JOIN: 'document:join',
  DOCUMENT_LEAVE: 'document:leave',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_CURSOR: 'document:cursor',
  DOCUMENT_SELECTION: 'document:selection',
  
  // Workflow updates
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_STEP_COMPLETE: 'workflow:step_complete',
  
  // AI generation
  AI_GENERATION_START: 'ai:generation_start',
  AI_GENERATION_PROGRESS: 'ai:generation_progress',
  AI_GENERATION_COMPLETE: 'ai:generation_complete',
  AI_GENERATION_ERROR: 'ai:generation_error',
  
  // Notifications
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification:read',
  
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
  USER_STOPPED_TYPING: 'user:stopped_typing'
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  // Core features
  REAL_TIME_COLLABORATION: true,
  AI_WRITING_ASSISTANT: true,
  WORKFLOW_TEMPLATES: true,
  
  // Beta features
  ADVANCED_ANALYTICS: false,
  VOICE_INPUT: false,
  TEAM_WORKSPACES: false,
  
  // Experimental features
  AUTO_TRANSLATION: false,
  SMART_SUGGESTIONS: false,
  CONTENT_SCORING: false
} as const;

// Environment-specific configurations
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature toggles based on environment
  enableDevTools: process.env.NODE_ENV === 'development',
  enableLogging: process.env.NODE_ENV !== 'production',
  enableSourceMaps: process.env.NODE_ENV === 'development',
  
  // External service URLs
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  FASTAPI_WEBSOCKET_URL: process.env.NEXT_PUBLIC_FASTAPI_WS_URL || 'ws://localhost:8002',
  CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  ANALYTICS_URL: process.env.NEXT_PUBLIC_ANALYTICS_URL,
  
  // Third-party API keys (client-safe)
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
} as const;