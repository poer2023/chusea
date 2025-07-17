/**
 * API客户端配置
 * 管理API客户端的配置选项和环境变量
 */

// 环境变量类型定义
interface EnvironmentConfig {
  API_BASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  APP_ENV: 'development' | 'staging' | 'production';
}

// 获取环境变量，支持浏览器和Node.js环境
function getEnv(): Partial<EnvironmentConfig> {
  if (typeof window !== 'undefined') {
    // 浏览器环境 - 使用Next.js公开环境变量
    return {
      API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api',
      NODE_ENV: process.env.NODE_ENV as any,
      APP_ENV: process.env.NEXT_PUBLIC_APP_ENV as any || 'development',
    };
  } else {
    // Node.js环境
    return {
      API_BASE_URL: process.env.API_URL || 'http://localhost:8002/api',
      NODE_ENV: process.env.NODE_ENV as any,
      APP_ENV: process.env.APP_ENV as any || 'development',
    };
  }
}

const env = getEnv();

// API客户端配置
export const apiConfig = {
  // 基础URL
  baseURL: env.API_BASE_URL || 'http://localhost:8002/api',
  
  // 请求超时设置
  timeout: {
    default: 30000,     // 30秒
    upload: 300000,     // 5分钟（文件上传）
    download: 300000,   // 5分钟（文件下载）
  },
  
  // 重试配置
  retry: {
    attempts: 3,        // 重试次数
    delay: 1000,        // 重试延迟（毫秒）
    backoffFactor: 2,   // 退避因子
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    duration: 5 * 60 * 1000,  // 5分钟
    maxSize: 100,             // 最大缓存条目数
  },
  
  // 文件上传配置
  upload: {
    maxFileSize: 100 * 1024 * 1024,  // 100MB
    chunkSize: 1024 * 1024,          // 1MB chunks
    allowedTypes: [
      // 文档类型
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      
      // 图片类型
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      
      // 表格类型
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
  },
  
  // WebSocket配置
  websocket: {
    url: env.API_BASE_URL?.replace(/^http/, 'ws').replace('/api', '') || 'ws://localhost:8002',
    reconnectInterval: 5000,    // 重连间隔（毫秒）
    maxReconnectAttempts: 5,    // 最大重连次数
    heartbeatInterval: 30000,   // 心跳间隔（毫秒）
  },
  
  // 分页配置
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },
};

// 认证配置
export const authConfig = {
  // Token存储键
  storageKeys: {
    token: 'auth_token',
    refreshToken: 'refresh_token',
    user: 'user_info',
    expiresAt: 'token_expires_at',
  },
  
  // Token配置
  token: {
    defaultExpiresIn: 24 * 60 * 60 * 1000,  // 24小时
    refreshThreshold: 5 * 60 * 1000,        // 5分钟（提前刷新时间）
    maxRetries: 3,                          // 刷新重试次数
  },
  
  // 登录配置
  login: {
    rememberMe: true,           // 是否记住登录状态
    autoLogin: true,            // 是否自动登录
    redirectAfterLogin: '/',    // 登录后重定向路径
    redirectAfterLogout: '/auth/login',  // 登出后重定向路径
  },
  
  // 安全配置
  security: {
    enableCSRF: false,          // 是否启用CSRF保护
    enableXSSProtection: true,  // 是否启用XSS保护
    secureStorage: true,        // 是否使用安全存储
  },
};

// 功能开关配置
export const featureFlags = {
  // 核心功能
  enableCaching: true,
  enableOfflineMode: false,
  enablePushNotifications: false,
  
  // 写作功能
  enableAdvancedWriting: true,
  enableCollaboration: false,
  enableVersionControl: true,
  
  // 文献功能
  enableLiteratureSearch: true,
  enableCitationGeneration: true,
  enableReferenceSync: false,
  
  // 工具功能
  enableFormatConversion: true,
  enableChartGeneration: true,
  enableDataAnalysis: true,
  
  // 工作流功能
  enableWorkflow: true,
  enableCustomWorkflows: false,
  enableWorkflowSharing: false,
  
  // 实验性功能
  enableExperimentalFeatures: env.APP_ENV === 'development',
  enableBetaFeatures: env.APP_ENV !== 'production',
  enableDebugMode: env.NODE_ENV === 'development',
};

// 应用配置
export const appConfig = {
  // 应用信息
  name: 'Chusea Frontend',
  version: '1.0.0',
  description: '智能写作助手前端应用',
  
  // 环境信息
  environment: env.APP_ENV || 'development',
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  
  // UI配置
  ui: {
    theme: {
      default: 'light',
      options: ['light', 'dark', 'auto'],
    },
    language: {
      default: 'zh-CN',
      options: ['zh-CN', 'en-US'],
    },
    layout: {
      sidebarWidth: 280,
      headerHeight: 64,
      footerHeight: 48,
    },
  },
  
  // 性能配置
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableServiceWorker: env.NODE_ENV === 'production',
    enablePreloading: true,
  },
  
  // 分析配置
  analytics: {
    enabled: env.NODE_ENV === 'production',
    provider: 'google',
    trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },
  
  // 错误报告配置
  errorReporting: {
    enabled: env.NODE_ENV === 'production',
    provider: 'sentry',
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
};

// 开发配置
export const devConfig = {
  // 调试选项
  debug: {
    enableApiLogs: env.NODE_ENV === 'development',
    enableStateLogs: env.NODE_ENV === 'development',
    enablePerformanceLogs: env.NODE_ENV === 'development',
  },
  
  // 开发工具
  devTools: {
    enableReduxDevTools: env.NODE_ENV === 'development',
    enableReactDevTools: env.NODE_ENV === 'development',
    enableStorybook: env.NODE_ENV === 'development',
  },
  
  // 热重载
  hotReload: {
    enabled: env.NODE_ENV === 'development',
    includeNodeModules: false,
  },
  
  // 模拟数据
  mockData: {
    enabled: false,
    delay: 1000,  // 模拟网络延迟
  },
};

// 验证配置的辅助函数
export function validateConfig(): boolean {
  const requiredEnvVars = ['API_BASE_URL'];
  
  for (const envVar of requiredEnvVars) {
    if (!env[envVar as keyof EnvironmentConfig]) {
      console.error(`Missing required environment variable: ${envVar}`);
      return false;
    }
  }
  
  return true;
}

// 获取完整配置
export function getConfig() {
  return {
    api: apiConfig,
    auth: authConfig,
    features: featureFlags,
    app: appConfig,
    dev: devConfig,
    env,
  };
}

// 配置辅助函数
export const configHelpers = {
  // 检查功能是否启用
  isFeatureEnabled: (feature: keyof typeof featureFlags): boolean => {
    return featureFlags[feature];
  },
  
  // 获取API端点URL
  getApiUrl: (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${apiConfig.baseURL}${cleanEndpoint}`;
  },
  
  // 获取WebSocket URL
  getWebSocketUrl: (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${apiConfig.websocket.url}${cleanEndpoint}`;
  },
  
  // 检查文件类型是否允许
  isFileTypeAllowed: (mimeType: string): boolean => {
    return apiConfig.upload.allowedTypes.includes(mimeType);
  },
  
  // 检查文件大小是否允许
  isFileSizeAllowed: (size: number): boolean => {
    return size <= apiConfig.upload.maxFileSize;
  },
  
  // 获取分页配置
  getPaginationConfig: () => ({
    defaultPageSize: apiConfig.pagination.defaultPageSize,
    maxPageSize: apiConfig.pagination.maxPageSize,
    options: apiConfig.pagination.pageSizeOptions,
  }),
};

// 导出默认配置
export default {
  ...getConfig(),
  helpers: configHelpers,
  validate: validateConfig,
};