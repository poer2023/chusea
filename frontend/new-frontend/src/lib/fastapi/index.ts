/**
 * FastAPI集成统一入口
 * 导出所有FastAPI相关的功能和类型
 */

// 客户端和核心功能
export { FastAPIClient, fastAPIClient, FastAPIError } from './client';
export { FastAPIAuthManager, fastAPIAuthManager, useFastAPIAuth } from './auth';
export { FastAPITransformers } from './transformers';

// 端点和配置
export {
  FASTAPI_CONFIG,
  FASTAPI_ENDPOINTS,
  FASTAPI_ERROR_CODES,
  FASTAPI_LIMITS,
  HTTP_STATUS,
  buildFastAPIUrl,
  buildFastAPIWebSocketUrl,
  buildQueryParams,
  buildPaginationParams,
  buildDocumentFilters,
  mapErrorCodeToStatus,
} from './endpoints';

// 类型定义
export type {
  // 枚举类型
  DocumentType,
  AgentType,
  LiteratureSource,
  WorkflowStatus,
  NodeType,
  NodeStatus,

  // 用户相关类型
  FastAPIUser,
  FastAPIUserCreate,
  FastAPIUserResponse,

  // 文档相关类型
  FastAPIDocument,
  FastAPIDocumentCreate,
  FastAPIDocumentUpdate,
  FastAPIDocumentResponse,
  FastAPIDocumentListResponse,
  FastAPIDocumentStats,

  // 文献相关类型
  FastAPILiterature,
  FastAPILiteratureCreate,
  FastAPILiteratureUpdate,
  FastAPILiteratureResponse,
  FastAPILiteratureSearchRequest,
  FastAPILiteratureSearchResponse,

  // 写作相关类型
  FastAPIWritingRequest,
  FastAPIWritingResponse,
  FastAPIWritingSession,
  FastAPIWritingSessionCreate,
  FastAPIWritingSessionResponse,

  // 工作流相关类型
  FastAPIWorkflowDocument,
  FastAPIWorkflowNode,
  FastAPILoopConfig,
  FastAPIStartWorkflowRequest,
  FastAPIWorkflowResponse,
  FastAPIWorkflowStatusResponse,

  // Agent相关类型
  FastAPIAgentRequest,
  FastAPIAgentResponse,

  // 工具相关类型
  FastAPIFormatConversionRequest,
  FastAPIFormatConversionResponse,
  FastAPIChartGenerationRequest,
  FastAPIChartGenerationResponse,

  // 认证相关类型
  FastAPIToken,
  FastAPILoginRequest,
  FastAPIVerifyResponse,
  FastAPIDevAuthStatus,

  // 用户设置类型
  FastAPIUserSettings,
  FastAPIUserSettingsUpdate,
  FastAPIUserSettingsResponse,

  // 健康检查和根端点类型
  FastAPIHealthResponse,
  FastAPIRootResponse,

  // 文件上传类型
  FastAPIUploadRequest,
  FastAPIUploadResponse,
  FastAPIUploadProgress,
  FastAPIMultipartUploadInit,
  FastAPIMultipartUploadInitResponse,
  FastAPIUploadChunkRequest,
  FastAPIUploadCompleteRequest,

  // 错误类型
  FastAPIErrorResponse,
  FastAPIValidationError,

  // 分页和过滤类型
  FastAPIPaginationParams,
  FastAPIDocumentFilters,
  FastAPILiteratureFilters,

  // WebSocket类型
  FastAPIWebSocketMessage,
  FastAPIWorkflowUpdateMessage,

  // 统计类型
  FastAPIWritingStats,
  FastAPIDocumentAnalytics,

  // 联合类型
  FastAPIRequestTypes,
  FastAPIResponseTypes,
} from './types';

// 认证类型导出（从auth.ts）
export type {
  FastAPIToken as AuthToken,
  FastAPILoginRequest as LoginRequest,
  FastAPIUser as User,
  FastAPIAuthState,
} from './auth';

// 类型守卫函数
export {
  isFastAPIError,
  isFastAPIValidationError,
  isDocumentType,
  isAgentType,
  isLiteratureSource,
  isWorkflowStatus,
  isNodeType,
  isNodeStatus,
} from './types';

// 创建便捷的API访问方法
export const createFastAPIInstance = (config?: Partial<typeof FASTAPI_CONFIG>) => {
  return new FastAPIClient(config);
};

// 快捷访问方法
export const fastAPI = {
  // 客户端实例
  client: fastAPIClient,
  
  // 认证管理
  auth: fastAPIAuthManager,
  
  // 快捷API调用方法
  async healthCheck() {
    return fastAPIClient.healthCheck();
  },
  
  async getRoot() {
    return fastAPIClient.getRoot();
  },
  
  // 文档操作
  documents: {
    async list(filters?: any) {
      return fastAPIClient.getDocuments(filters);
    },
    
    async get(id: string | number) {
      return fastAPIClient.getDocument(id);
    },
    
    async create(data: any) {
      return fastAPIClient.createDocument(data);
    },
    
    async update(id: string | number, data: any) {
      return fastAPIClient.updateDocument(id, data);
    },
    
    async delete(id: string | number) {
      return fastAPIClient.deleteDocument(id);
    },
    
    async duplicate(id: string | number) {
      return fastAPIClient.duplicateDocument(id);
    },
    
    async getStats() {
      return fastAPIClient.getDocumentStats();
    },
  },
  
  // 写作操作
  writing: {
    async generate(request: any) {
      return fastAPIClient.generateWriting(request);
    },
    
    async improve(request: any) {
      return fastAPIClient.improveWriting(request);
    },
    
    async convert(request: any) {
      return fastAPIClient.convertWritingMode(request);
    },
    
    async getSuggestions(mode: string) {
      return fastAPIClient.getWritingSuggestions(mode);
    },
    
    async getModes() {
      return fastAPIClient.getWritingModes();
    },
  },
  
  // 文献操作
  literature: {
    async search(request: any) {
      return fastAPIClient.searchLiterature(request);
    },
  },
  
  // 工作流操作
  workflow: {
    async createDocument(title: string, config?: any) {
      return fastAPIClient.createWorkflowDocument(title, config);
    },
    
    async getDocuments() {
      return fastAPIClient.getWorkflowDocuments();
    },
    
    async start(request: any) {
      return fastAPIClient.startWorkflow(request);
    },
    
    async stop(documentId: string) {
      return fastAPIClient.stopWorkflow(documentId);
    },
    
    async getStatus(documentId: string) {
      return fastAPIClient.getWorkflowStatus(documentId);
    },
    
    async rollback(documentId: string, nodeId: string) {
      return fastAPIClient.rollbackToNode(documentId, nodeId);
    },
    
    async getNodes(documentId: string) {
      return fastAPIClient.getWorkflowNodes(documentId);
    },
    
    createWebSocket(documentId: string) {
      return fastAPIClient.createWorkflowWebSocket(documentId);
    },
  },
  
  // 工具操作
  tools: {
    async convertFormat(request: any) {
      return fastAPIClient.convertFormat(request);
    },
    
    async generateChart(request: any) {
      return fastAPIClient.generateChart(request);
    },
  },
  
  // 文件操作
  files: {
    async upload(file: File, options?: any) {
      return fastAPIClient.uploadFile(file, options);
    },
    
    async download(fileId: string, options?: any) {
      return fastAPIClient.downloadFile(fileId, options);
    },
  },
};

// 默认导出快捷API
export default fastAPI;