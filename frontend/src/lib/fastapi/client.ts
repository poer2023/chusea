/**
 * FastAPI客户端适配器
 * 提供完整的FastAPI后端接口访问功能
 */

import { 
  FASTAPI_CONFIG, 
  FASTAPI_ENDPOINTS, 
  FASTAPI_ERROR_CODES,
  FASTAPI_LIMITS,
  buildFastAPIUrl,
  buildFastAPIWebSocketUrl,
  buildQueryParams,
} from './endpoints';

import { FastAPITransformers } from './transformers';
import { fastAPIAuthManager } from './auth';

import {
  FastAPIUser,
  FastAPIUserCreate,
  FastAPIDocument,
  FastAPIDocumentCreate,
  FastAPIDocumentUpdate,
  FastAPIDocumentListResponse,
  FastAPIDocumentStats,
  FastAPILiteratureSearchRequest,
  FastAPILiteratureSearchResponse,
  FastAPIWritingRequest,
  FastAPIWritingResponse,
  FastAPIWorkflowDocument,
  FastAPIWorkflowNode,
  FastAPILoopConfig,
  FastAPIStartWorkflowRequest,
  FastAPIWorkflowResponse,
  FastAPIWorkflowStatusResponse,
  FastAPIFormatConversionRequest,
  FastAPIFormatConversionResponse,
  FastAPIChartGenerationRequest,
  FastAPIChartGenerationResponse,
  FastAPIToken,
  FastAPILoginRequest,
  FastAPIVerifyResponse,
  FastAPIHealthResponse,
  FastAPIRootResponse,
  FastAPIUploadResponse,
  FastAPIUploadProgress,
  FastAPIDocumentFilters,
} from './types';

// 请求配置接口
export interface FastAPIRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  onUploadProgress?: (progress: FastAPIUploadProgress) => void;
  headers?: Record<string, string>;
}

// API错误类
export class FastAPIError extends Error {
  public code: string;
  public details?: any;
  public status?: number;
  public timestamp: string;

  constructor(message: string, code: string, details?: any, status?: number) {
    super(message);
    this.name = 'FastAPIError';
    this.code = code;
    this.details = details;
    this.status = status;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 简单的内存缓存实现
 */
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttl: number = FASTAPI_CONFIG.CACHE_DURATION): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * FastAPI客户端类
 */
export class FastAPIClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;
  private cache: SimpleCache;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config: Partial<typeof FASTAPI_CONFIG> = {}) {
    this.baseURL = config.BASE_URL || FASTAPI_CONFIG.BASE_URL;
    this.defaultTimeout = config.DEFAULT_TIMEOUT || FASTAPI_CONFIG.DEFAULT_TIMEOUT;
    this.defaultRetries = FASTAPI_LIMITS.MAX_RETRIES;
    this.defaultRetryDelay = FASTAPI_LIMITS.RETRY_DELAY;
    this.cache = new SimpleCache();
  }

  /**
   * 构建请求头
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    // 添加认证头
    const authHeaders = fastAPIAuthManager.getAuthHeader();
    Object.assign(headers, authHeaders);

    return headers;
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    if (!response.ok) {
      let errorData: any;
      
      try {
        errorData = isJSON ? await response.json() : { detail: await response.text() };
      } catch {
        errorData = { detail: 'An unexpected error occurred' };
      }

      const transformedError = FastAPITransformers.transformErrorResponse(errorData);
      throw new FastAPIError(
        transformedError.message,
        transformedError.code,
        transformedError.details,
        response.status
      );
    }

    if (isJSON) {
      return await response.json();
    }

    // 对于非JSON响应（如文件下载）
    return response as unknown as T;
  }

  /**
   * 生成请求缓存键
   */
  private getCacheKey(endpoint: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  /**
   * 检查是否应该缓存请求
   */
  private shouldCacheRequest(method: string = 'GET'): boolean {
    return FASTAPI_CONFIG.ENABLE_CACHING && method === 'GET';
  }

  /**
   * 基础请求方法
   */
  private async request<T>(
    endpoint: string,
    options: FastAPIRequestConfig & RequestInit = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      headers: customHeaders,
      signal: externalSignal,
      ...fetchOptions
    } = options;

    const url = buildFastAPIUrl(endpoint);
    const headers = this.buildHeaders(customHeaders);
    const method = fetchOptions.method || 'GET';
    
    // 缓存检查（仅对GET请求）
    if (this.shouldCacheRequest(method)) {
      const cacheKey = this.getCacheKey(endpoint, fetchOptions);
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        if (FASTAPI_CONFIG.ENABLE_LOGGING) {
          console.debug(`Cache hit for ${endpoint}`);
        }
        return cachedData;
      }
    }

    // 请求去重（避免重复的GET请求）
    if (method === 'GET') {
      const queueKey = `${method}:${endpoint}`;
      const existingRequest = this.requestQueue.get(queueKey);
      if (existingRequest) {
        if (FASTAPI_CONFIG.ENABLE_LOGGING) {
          console.debug(`Deduplicating request for ${endpoint}`);
        }
        return existingRequest;
      }
    }

    let lastError: Error | null = null;
    const queueKey = `${method}:${endpoint}`;
    
    // 创建请求Promise
    const requestPromise = (async () => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          // 组合信号
          const combinedSignal = externalSignal 
            ? this.combineAbortSignals([controller.signal, externalSignal])
            : controller.signal;

          const response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: combinedSignal,
          });

          clearTimeout(timeoutId);
          const result = await this.handleResponse<T>(response);
          
          // 缓存成功的GET请求结果
          if (this.shouldCacheRequest(method)) {
            const cacheKey = this.getCacheKey(endpoint, fetchOptions);
            this.cache.set(cacheKey, result);
          }
          
          return result;

        } catch (error) {
          clearTimeout(timeoutId);
          lastError = error as Error;

          // 不重试的错误类型
          if (this.shouldNotRetry(error as Error) || attempt === retries) {
            break;
          }

          // 等待后重试
          if (attempt < retries) {
            const delay = retryDelay * Math.pow(FASTAPI_LIMITS.RETRY_BACKOFF_FACTOR, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new FastAPIError('Request failed after retries', FASTAPI_ERROR_CODES.INTERNAL_ERROR);
    })();

    // 如果是GET请求，加入请求队列
    if (method === 'GET') {
      this.requestQueue.set(queueKey, requestPromise);
      
      // 请求完成后清理队列
      requestPromise.finally(() => {
        this.requestQueue.delete(queueKey);
      });
    }

    return requestPromise;
  }

  /**
   * 组合AbortSignal
   */
  private combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort());
    }
    
    return controller.signal;
  }

  /**
   * 判断是否应该重试
   */
  private shouldNotRetry(error: Error): boolean {
    const fastAPIError = error as FastAPIError;
    
    // 4xx错误不重试
    if (fastAPIError.status && fastAPIError.status >= 400 && fastAPIError.status < 500) {
      return true;
    }

    // 特定错误代码不重试
    const nonRetryableCodes = [
      FASTAPI_ERROR_CODES.UNAUTHORIZED,
      FASTAPI_ERROR_CODES.FORBIDDEN,
      FASTAPI_ERROR_CODES.NOT_FOUND,
      FASTAPI_ERROR_CODES.VALIDATION_ERROR,
      FASTAPI_ERROR_CODES.INVALID_CREDENTIALS,
    ];

    return nonRetryableCodes.includes(fastAPIError.code);
  }

  // ===== 根端点和健康检查 =====

  /**
   * 获取API根信息
   */
  async getRoot(): Promise<FastAPIRootResponse> {
    const response = await this.request<FastAPIRootResponse>(FASTAPI_ENDPOINTS.ROOT);
    return FastAPITransformers.transformRootResponse(response);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<FastAPIHealthResponse> {
    const response = await this.request<FastAPIHealthResponse>(FASTAPI_ENDPOINTS.HEALTH);
    return FastAPITransformers.transformHealthResponse(response);
  }

  // ===== 认证相关方法 =====

  /**
   * 用户注册
   */
  async register(userData: FastAPIUserCreate): Promise<FastAPIUser> {
    const response = await this.request<any>(FASTAPI_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return FastAPITransformers.transformUserResponse(response);
  }

  /**
   * 用户登录
   */
  async login(credentials: FastAPILoginRequest): Promise<FastAPIToken> {
    return await this.request<FastAPIToken>(FASTAPI_ENDPOINTS.AUTH.LOGIN_JSON, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<FastAPIUser> {
    const response = await this.request<any>(FASTAPI_ENDPOINTS.AUTH.ME);
    return FastAPITransformers.transformUserResponse(response);
  }

  /**
   * 验证token
   */
  async verifyToken(): Promise<FastAPIVerifyResponse> {
    return await this.request<FastAPIVerifyResponse>(FASTAPI_ENDPOINTS.AUTH.VERIFY);
  }

  /**
   * 开发环境自动登录
   */
  async devLogin(): Promise<FastAPIToken> {
    return await this.request<FastAPIToken>(FASTAPI_ENDPOINTS.AUTH.DEV_LOGIN, {
      method: 'POST',
    });
  }

  /**
   * 获取开发环境认证状态
   */
  async getDevAuthStatus(): Promise<any> {
    return await this.request<any>(FASTAPI_ENDPOINTS.AUTH.DEV_STATUS);
  }

  // ===== 文档管理方法 =====

  /**
   * 获取文档列表
   */
  async getDocuments(filters: FastAPIDocumentFilters = {}): Promise<any> {
    const queryParams = buildQueryParams(filters);
    const response = await this.request<FastAPIDocumentListResponse>(
      `${FASTAPI_ENDPOINTS.DOCUMENTS.LIST}${queryParams}`
    );
    return FastAPITransformers.transformPaginatedResponse(
      response,
      FastAPITransformers.transformDocumentResponse
    );
  }

  /**
   * 获取单个文档
   */
  async getDocument(documentId: string | number): Promise<FastAPIDocument> {
    const response = await this.request<any>(FASTAPI_ENDPOINTS.DOCUMENTS.GET(documentId));
    return FastAPITransformers.transformDocumentResponse(response);
  }

  /**
   * 创建文档
   */
  async createDocument(documentData: FastAPIDocumentCreate): Promise<FastAPIDocument> {
    const transformedData = FastAPITransformers.transformCreateDocumentRequest(documentData);
    const response = await this.request<any>(FASTAPI_ENDPOINTS.DOCUMENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
    return FastAPITransformers.transformDocumentResponse(response);
  }

  /**
   * 更新文档
   */
  async updateDocument(documentId: string | number, updates: FastAPIDocumentUpdate): Promise<FastAPIDocument> {
    const transformedData = FastAPITransformers.transformUpdateDocumentRequest(updates);
    const response = await this.request<any>(FASTAPI_ENDPOINTS.DOCUMENTS.UPDATE(documentId), {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });
    return FastAPITransformers.transformDocumentResponse(response);
  }

  /**
   * 删除文档
   */
  async deleteDocument(documentId: string | number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(FASTAPI_ENDPOINTS.DOCUMENTS.DELETE(documentId), {
      method: 'DELETE',
    });
  }

  /**
   * 复制文档
   */
  async duplicateDocument(documentId: string | number): Promise<FastAPIDocument> {
    const response = await this.request<any>(FASTAPI_ENDPOINTS.DOCUMENTS.DUPLICATE(documentId), {
      method: 'POST',
    });
    return FastAPITransformers.transformDocumentResponse(response);
  }

  /**
   * 获取文档统计
   */
  async getDocumentStats(): Promise<FastAPIDocumentStats> {
    return await this.request<FastAPIDocumentStats>(FASTAPI_ENDPOINTS.DOCUMENTS.STATS);
  }

  // ===== 写作相关方法 =====

  /**
   * 生成写作内容
   */
  async generateWriting(request: FastAPIWritingRequest): Promise<FastAPIWritingResponse> {
    const transformedRequest = FastAPITransformers.transformWritingRequest(request);
    const response = await this.request<any>(FASTAPI_ENDPOINTS.WRITING.GENERATE, {
      method: 'POST',
      body: JSON.stringify(transformedRequest),
    });
    return FastAPITransformers.transformWritingResponse(response);
  }

  /**
   * 改进写作内容
   */
  async improveWriting(request: FastAPIWritingRequest): Promise<FastAPIWritingResponse> {
    const transformedRequest = FastAPITransformers.transformWritingRequest(request);
    const response = await this.request<any>(FASTAPI_ENDPOINTS.WRITING.IMPROVE, {
      method: 'POST',
      body: JSON.stringify(transformedRequest),
    });
    return FastAPITransformers.transformWritingResponse(response);
  }

  /**
   * 转换写作模式
   */
  async convertWritingMode(request: FastAPIWritingRequest): Promise<FastAPIWritingResponse> {
    const transformedRequest = FastAPITransformers.transformWritingRequest(request);
    const response = await this.request<any>(FASTAPI_ENDPOINTS.WRITING.CONVERT, {
      method: 'POST',
      body: JSON.stringify(transformedRequest),
    });
    return FastAPITransformers.transformWritingResponse(response);
  }

  /**
   * 获取写作建议
   */
  async getWritingSuggestions(mode: string): Promise<{ suggestions: string[] }> {
    return await this.request<{ suggestions: string[] }>(FASTAPI_ENDPOINTS.WRITING.SUGGESTIONS(mode));
  }

  /**
   * 获取写作模式
   */
  async getWritingModes(): Promise<any> {
    return await this.request<any>(FASTAPI_ENDPOINTS.WRITING.MODES);
  }

  // ===== 文献相关方法 =====

  /**
   * 搜索文献
   */
  async searchLiterature(request: FastAPILiteratureSearchRequest): Promise<FastAPILiteratureSearchResponse> {
    const transformedRequest = FastAPITransformers.transformLiteratureSearchRequest(request);
    const response = await this.request<FastAPILiteratureSearchResponse>('/api/literature/search', {
      method: 'POST',
      body: JSON.stringify(transformedRequest),
    });
    return response;
  }

  // ===== 工作流相关方法 =====

  /**
   * 创建工作流文档
   */
  async createWorkflowDocument(title: string, config?: FastAPILoopConfig): Promise<FastAPIWorkflowDocument> {
    const requestData: any = { title };
    if (config) {
      requestData.config = FastAPITransformers.transformLoopConfig(config);
    }

    const response = await this.request<any>(FASTAPI_ENDPOINTS.WORKFLOW.CREATE_DOCUMENT, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return FastAPITransformers.transformWorkflowDocumentResponse(response);
  }

  /**
   * 获取工作流文档列表
   */
  async getWorkflowDocuments(): Promise<FastAPIWorkflowDocument[]> {
    const response = await this.request<any[]>(FASTAPI_ENDPOINTS.WORKFLOW.GET_DOCUMENTS);
    return response.map(FastAPITransformers.transformWorkflowDocumentResponse);
  }

  /**
   * 启动工作流
   */
  async startWorkflow(request: FastAPIStartWorkflowRequest): Promise<FastAPIWorkflowResponse> {
    const transformedRequest = FastAPITransformers.transformStartWorkflowRequest(request);
    return await this.request<FastAPIWorkflowResponse>(FASTAPI_ENDPOINTS.WORKFLOW.START, {
      method: 'POST',
      body: JSON.stringify(transformedRequest),
    });
  }

  /**
   * 停止工作流
   */
  async stopWorkflow(documentId: string): Promise<FastAPIWorkflowResponse> {
    return await this.request<FastAPIWorkflowResponse>(FASTAPI_ENDPOINTS.WORKFLOW.STOP(documentId), {
      method: 'POST',
    });
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(documentId: string): Promise<any> {
    const response = await this.request<FastAPIWorkflowStatusResponse>(FASTAPI_ENDPOINTS.WORKFLOW.STATUS(documentId));
    return FastAPITransformers.transformWorkflowStatusResponse(response);
  }

  /**
   * 回滚到指定节点
   */
  async rollbackToNode(documentId: string, nodeId: string): Promise<FastAPIWorkflowResponse> {
    return await this.request<FastAPIWorkflowResponse>(FASTAPI_ENDPOINTS.WORKFLOW.ROLLBACK(documentId, nodeId), {
      method: 'POST',
    });
  }

  /**
   * 获取工作流节点列表
   */
  async getWorkflowNodes(documentId: string): Promise<FastAPIWorkflowNode[]> {
    const response = await this.request<any[]>(FASTAPI_ENDPOINTS.WORKFLOW.NODES(documentId));
    return response.map(FastAPITransformers.transformWorkflowNodeResponse);
  }

  // ===== 工具相关方法 =====

  /**
   * 格式转换
   */
  async convertFormat(request: FastAPIFormatConversionRequest): Promise<FastAPIFormatConversionResponse> {
    return await this.request<FastAPIFormatConversionResponse>(FASTAPI_ENDPOINTS.TOOLS.FORMAT_CONVERT, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 生成图表
   */
  async generateChart(request: FastAPIChartGenerationRequest): Promise<FastAPIChartGenerationResponse> {
    return await this.request<FastAPIChartGenerationResponse>(FASTAPI_ENDPOINTS.TOOLS.CHART_GENERATE, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ===== 文件操作方法 =====

  /**
   * 上传文件
   */
  async uploadFile(
    file: File,
    options: {
      onProgress?: (progress: FastAPIUploadProgress) => void;
      signal?: AbortSignal;
      purpose?: string;
      documentId?: string;
    } = {}
  ): Promise<FastAPIUploadResponse> {
    const { onProgress, signal, purpose, documentId } = options;

    const formData = new FormData();
    formData.append('file', file);
    if (purpose) formData.append('purpose', purpose);
    if (documentId) formData.append('document_id', documentId);

    // 使用XMLHttpRequest进行上传以支持进度回调
    if (onProgress) {
      return new Promise<FastAPIUploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: FastAPIUploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });
        
        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new FastAPIError('Invalid response format', FASTAPI_ERROR_CODES.INTERNAL_ERROR));
            }
          } else {
            reject(new FastAPIError(`Upload failed: ${xhr.status}`, FASTAPI_ERROR_CODES.UPLOAD_FAILED, {}, xhr.status));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new FastAPIError('Upload failed', FASTAPI_ERROR_CODES.UPLOAD_FAILED));
        });
        
        if (signal) {
          signal.addEventListener('abort', () => xhr.abort());
        }
        
        const headers = this.buildHeaders();
        delete headers['Content-Type']; // 让浏览器自动设置multipart/form-data
        
        xhr.open('POST', buildFastAPIUrl(FASTAPI_ENDPOINTS.FILES.UPLOAD));
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
        xhr.send(formData);
      });
    }

    // 不需要进度的简单上传
    const headers = this.buildHeaders();
    delete headers['Content-Type'];

    try {
      const response = await this.request<FastAPIUploadResponse>(
        FASTAPI_ENDPOINTS.FILES.UPLOAD, {
        method: 'POST',
        body: formData,
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      throw new FastAPIError(
        error.message || 'File upload failed',
        error.code || 'UPLOAD_FAILED',
        error.details,
        error.status
      );
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(
    fileId: string,
    options: {
      onProgress?: (progress: FastAPIUploadProgress) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<Blob> {
    const { onProgress, signal } = options;
    const url = buildFastAPIUrl(FASTAPI_ENDPOINTS.FILES.DOWNLOAD(fileId));
    const headers = this.buildHeaders();

    const response = await fetch(url, {
      headers,
      signal,
    });

    if (!response.ok) {
      throw new FastAPIError(`Download failed: ${response.status}`, FASTAPI_ERROR_CODES.DOWNLOAD_FAILED, {}, response.status);
    }

    if (!response.body) {
      throw new FastAPIError('No response body', FASTAPI_ERROR_CODES.DOWNLOAD_FAILED);
    }

    // 处理下载进度
    if (onProgress) {
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total > 0) {
          const progress: FastAPIUploadProgress = {
            loaded,
            total,
            percentage: Math.round((loaded / total) * 100)
          };
          onProgress(progress);
        }
      }
      
      return new Blob(chunks);
    }

    return await response.blob();
  }

  // ===== WebSocket连接 =====

  /**
   * 创建工作流WebSocket连接
   */
  createWorkflowWebSocket(documentId: string): WebSocket {
    const wsUrl = buildFastAPIWebSocketUrl(FASTAPI_ENDPOINTS.WORKFLOW.WEBSOCKET(documentId));
    return new WebSocket(wsUrl);
  }

  // ===== 缓存管理方法 =====

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 删除特定缓存项
   */
  deleteCacheItem(endpoint: string, method: string = 'GET'): void {
    const cacheKey = this.getCacheKey(endpoint, { method });
    this.cache.delete(cacheKey);
  }

  /**
   * 预热缓存 - 预先加载常用数据
   */
  async warmupCache(): Promise<void> {
    if (!FASTAPI_CONFIG.ENABLE_CACHING) return;

    const warmupEndpoints = [
      FASTAPI_ENDPOINTS.ROOT,
      FASTAPI_ENDPOINTS.HEALTH,
      FASTAPI_ENDPOINTS.AUTH.DEV_STATUS,
    ];

    const promises = warmupEndpoints.map(endpoint => 
      this.request(endpoint).catch(() => {
        // 忽略预热失败的请求
        if (FASTAPI_CONFIG.ENABLE_LOGGING) {
          console.debug(`Cache warmup failed for ${endpoint}`);
        }
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; enabled: boolean } {
    return {
      size: this.cache['cache'].size,
      enabled: FASTAPI_CONFIG.ENABLE_CACHING,
    };
  }

  /**
   * 批量缓存失效 - 按模式删除缓存项
   */
  invalidateCacheByPattern(pattern: string): void {
    const keys = Array.from(this.cache['cache'].keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

// 创建默认实例
export const fastAPIClient = new FastAPIClient();

// 导出类和实例
export { FastAPIClient };
export default fastAPIClient;