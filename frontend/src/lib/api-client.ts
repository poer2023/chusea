/**
 * 主要的API客户端类
 * 提供完整的后端API访问功能，包含认证、错误处理和缓存
 */

import {
  PaginatedResponse,
  RequestConfig,
  // 用户相关
  User,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  VerifyTokenResponse,
  // 文档相关
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentFilters,
  DocumentStats,
  // 文献相关
  Literature,
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
  FileUploadResponse,
  FileUploadProgress,
  FileMetadata,
  // 系统相关
  HealthCheckResponse,
  ApiInfo,
} from './types/api';

// 默认配置
const DEFAULT_CONFIG = {
  baseURL: 'http://localhost:8002/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  enableCache: true,
  cacheDuration: 5 * 60 * 1000, // 5分钟
};

// API错误类
export class ApiClientError extends Error {
  public code: string;
  public status?: number;
  public details?: any;
  public timestamp: string;

  constructor(message: string, code: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// 简单的内存缓存
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, duration: number = DEFAULT_CONFIG.cacheDuration): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + duration,
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

  invalidateByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 主要的API客户端类
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private cache: SimpleCache;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private authTokenProvider?: () => string | null;

  constructor(config: Partial<typeof DEFAULT_CONFIG> = {}) {
    this.baseURL = config.baseURL || DEFAULT_CONFIG.baseURL;
    this.timeout = config.timeout || DEFAULT_CONFIG.timeout;
    this.retries = config.retries || DEFAULT_CONFIG.retries;
    this.retryDelay = config.retryDelay || DEFAULT_CONFIG.retryDelay;
    this.cache = new SimpleCache();
  }

  /**
   * 设置认证token提供器
   */
  setAuthTokenProvider(provider: () => string | null): void {
    this.authTokenProvider = provider;
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
    if (this.authTokenProvider) {
      const token = this.authTokenProvider();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * 构建完整URL
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
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

      const message = errorData.detail || errorData.message || `Request failed: ${response.status}`;
      const code = errorData.code || `HTTP_${response.status}`;

      throw new ApiClientError(message, code, response.status, errorData);
    }

    if (isJSON) {
      const data = await response.json();
      return data;
    }

    // 对于非JSON响应（如文件下载）
    return response as unknown as T;
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(endpoint: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    const url = this.buildUrl(endpoint);
    return `${method}:${url}:${body}`;
  }

  /**
   * 检查是否应该缓存
   */
  private shouldCache(method: string = 'GET'): boolean {
    return DEFAULT_CONFIG.enableCache && method === 'GET';
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.retries) return false;

    const apiError = error as ApiClientError;

    // 4xx错误不重试
    if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
      return false;
    }

    // 特定错误不重试
    const nonRetryableCodes = ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR'];
    if (nonRetryableCodes.includes(apiError.code)) {
      return false;
    }

    return true;
  }

  /**
   * 基础请求方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestConfig & RequestInit = {}
  ): Promise<T> {
    const { 
      retries = this.retries, 
      retryDelay = this.retryDelay, 
      cache = true, 
      timeout = this.timeout, 
      headers: customHeaders, 
      signal: externalSignal, 
      ...fetchOptions 
    } = options;

    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(customHeaders);
    const method = fetchOptions.method || 'GET';

    // 缓存检查
    if (this.shouldCache(method) && cache) {
      const cacheKey = this.getCacheKey(endpoint, fetchOptions);
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // 请求去重
    if (method === 'GET') {
      const queueKey = `${method}:${url}`;
      const existingRequest = this.requestQueue.get(queueKey);
      if (existingRequest) {
        return existingRequest;
      }
    }

    let lastError: Error | null = null;
    const queueKey = `${method}:${url}`;

    // 创建请求Promise
    const requestPromise = (async () => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          // 组合信号
          const combinedSignal = externalSignal
            ? this.combineSignals([controller.signal, externalSignal])
            : controller.signal;

          const response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: combinedSignal,
          });

          clearTimeout(timeoutId);
          const result = await this.handleResponse<T>(response);

          // 缓存成功的GET请求结果
          if (this.shouldCache(method) && cache) {
            const cacheKey = this.getCacheKey(endpoint, fetchOptions);
            this.cache.set(cacheKey, result);
          }

          return result;

        } catch (error) {
          clearTimeout(timeoutId);
          lastError = error as Error;

          if (!this.shouldRetry(lastError, attempt)) {
            break;
          }

          // 等待后重试
          if (attempt < retries) {
            const delay = retryDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new ApiClientError('Request failed after retries', 'REQUEST_FAILED');
    })();

    // GET请求加入队列
    if (method === 'GET') {
      this.requestQueue.set(queueKey, requestPromise);
      requestPromise.finally(() => {
        this.requestQueue.delete(queueKey);
      });
    }

    return requestPromise;
  }

  /**
   * 组合AbortSignal
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
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

  // ===== 认证相关方法 =====

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 用户注册
   */
  async register(userData: CreateUserRequest): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  /**
   * 验证token
   */
  async verifyToken(): Promise<VerifyTokenResponse> {
    return this.request<VerifyTokenResponse>('/auth/verify');
  }

  /**
   * 刷新token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 用户登出
   */
  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      cache: 'no-store' as RequestCache,
    });
  }

  // ===== 文档相关方法 =====

  /**
   * 获取文档列表
   */
  async getDocuments(filters: DocumentFilters = {}): Promise<PaginatedResponse<Document>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const query = params.toString();
    const endpoint = query ? `/documents?${query}` : '/documents';

    return this.request<PaginatedResponse<Document>>(endpoint);
  }

  /**
   * 获取单个文档
   */
  async getDocument(id: string): Promise<Document> {
    return this.request<Document>(`/documents/${id}`);
  }

  /**
   * 创建文档
   */
  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    this.cache.invalidateByPattern('/documents');
    return this.request<Document>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 更新文档
   */
  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    this.cache.invalidateByPattern('/documents');
    return this.request<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<{ message: string }> {
    this.cache.invalidateByPattern('/documents');
    return this.request<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 复制文档
   */
  async duplicateDocument(id: string): Promise<Document> {
    this.cache.invalidateByPattern('/documents');
    return this.request<Document>(`/documents/${id}/duplicate`, {
      method: 'POST',
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 获取文档统计
   */
  async getDocumentStats(): Promise<DocumentStats> {
    return this.request<DocumentStats>('/documents/stats');
  }

  // ===== 写作相关方法 =====

  /**
   * 生成写作内容
   */
  async generateWriting(request: WritingRequest): Promise<WritingResponse> {
    return this.request<WritingResponse>('/writing/generate', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 改进写作内容
   */
  async improveWriting(request: WritingRequest): Promise<WritingResponse> {
    return this.request<WritingResponse>('/writing/improve', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 转换写作模式
   */
  async convertWritingMode(request: WritingRequest): Promise<WritingResponse> {
    return this.request<WritingResponse>('/writing/convert', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 获取写作建议
   */
  async getWritingSuggestions(text: string, mode?: string): Promise<WritingSuggestion[]> {
    return this.request<WritingSuggestion[]>('/writing/suggestions', {
      method: 'POST',
      body: JSON.stringify({ text, mode }),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 获取写作模式信息
   */
  async getWritingModes(): Promise<WritingModeInfo[]> {
    return this.request<WritingModeInfo[]>('/writing/modes');
  }

  // ===== 文献相关方法 =====

  /**
   * 搜索文献
   */
  async searchLiterature(request: LiteratureSearchRequest): Promise<LiteratureSearchResponse> {
    return this.request<LiteratureSearchResponse>('/literature/search', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 获取保存的文献
   */
  async getSavedLiterature(filters: LiteratureFilters = {}): Promise<PaginatedResponse<Literature>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const query = params.toString();
    const endpoint = query ? `/literature?${query}` : '/literature';

    return this.request<PaginatedResponse<Literature>>(endpoint);
  }

  /**
   * 保存文献
   */
  async saveLiterature(data: CreateLiteratureRequest): Promise<Literature> {
    this.cache.invalidateByPattern('/literature');
    return this.request<Literature>('/literature', {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 更新文献
   */
  async updateLiterature(id: string, data: UpdateLiteratureRequest): Promise<Literature> {
    this.cache.invalidateByPattern('/literature');
    return this.request<Literature>(`/literature/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 删除文献
   */
  async deleteLiterature(id: string): Promise<{ message: string }> {
    this.cache.invalidateByPattern('/literature');
    return this.request<{ message: string }>(`/literature/${id}`, {
      method: 'DELETE',
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 生成引用
   */
  async generateCitation(request: CitationRequest): Promise<CitationResponse> {
    return this.request<CitationResponse>('/literature/cite', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  // ===== 工具相关方法 =====

  /**
   * 格式转换
   */
  async convertFormat(request: FormatConversionRequest): Promise<FormatConversionResponse> {
    return this.request<FormatConversionResponse>('/tools/convert-format', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 生成图表
   */
  async generateChart(request: ChartGenerationRequest): Promise<ChartGenerationResponse> {
    return this.request<ChartGenerationResponse>('/tools/generate-chart', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 数据分析
   */
  async analyzeData(request: DataAnalysisRequest): Promise<DataAnalysisResponse> {
    return this.request<DataAnalysisResponse>('/tools/analyze-data', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  // ===== 工作流相关方法 =====

  /**
   * 启动工作流
   */
  async startWorkflow(request: StartWorkflowRequest): Promise<WorkflowResponse> {
    this.cache.invalidateByPattern(`/workflows/${request.documentId}`);
    return this.request<WorkflowResponse>('/workflows/start', {
      method: 'POST',
      body: JSON.stringify(request),
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 停止工作流
   */
  async stopWorkflow(documentId: string): Promise<WorkflowResponse> {
    this.cache.invalidateByPattern(`/workflows/${documentId}`);
    return this.request<WorkflowResponse>(`/workflows/${documentId}/stop`, {
      method: 'POST',
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(documentId: string): Promise<WorkflowStatusResponse> {
    return this.request<WorkflowStatusResponse>(`/workflow/${documentId}/status`);
  }

  /**
   * 暂停工作流
   */
  async pauseWorkflow(documentId: string): Promise<WorkflowResponse> {
    this.cache.invalidateByPattern(`/workflows/${documentId}`);
    return this.request<WorkflowResponse>(`/workflows/${documentId}/pause`, {
      method: 'POST',
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 恢复工作流
   */
  async resumeWorkflow(documentId: string): Promise<WorkflowResponse> {
    this.cache.invalidateByPattern(`/workflows/${documentId}`);
    return this.request<WorkflowResponse>(`/workflows/${documentId}/resume`, {
      method: 'POST',
      cache: 'no-store' as RequestCache,
    });
  }

  /**
   * 回滚到指定节点
   */
  async rollbackWorkflow(documentId: string, nodeId: string): Promise<WorkflowResponse> {
    this.cache.invalidateByPattern(`/workflows/${documentId}`);
    return this.request<WorkflowResponse>(`/workflows/${documentId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ nodeId }),
      cache: 'no-store' as RequestCache,
    });
  }

  // ===== 文件相关方法 =====

  /**
   * 上传文件
   */
  async uploadFile(
    file: File,
    options: {
      purpose?: string;
      documentId?: string;
      onProgress?: (progress: FileUploadProgress) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<FileUploadResponse> {
    const { purpose, documentId, onProgress, signal } = options;

    const formData = new FormData();
    formData.append('file', file);
    if (purpose) formData.append('purpose', purpose);
    if (documentId) formData.append('documentId', documentId);

    // 使用XMLHttpRequest进行上传以支持进度回调
    if (onProgress) {
      return new Promise<FileUploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: FileUploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
              speed: event.loaded / ((Date.now() - startTime) / 1000),
            };
            progress.estimatedTimeRemaining = progress.speed > 0 
              ? (event.total - event.loaded) / progress.speed 
              : undefined;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new ApiClientError('Invalid response format', 'INVALID_RESPONSE'));
            }
          } else {
            reject(new ApiClientError(`Upload failed: ${xhr.status}`, 'UPLOAD_FAILED', xhr.status));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new ApiClientError('Upload failed', 'UPLOAD_FAILED'));
        });

        if (signal) {
          signal.addEventListener('abort', () => xhr.abort());
        }

        const headers = this.buildHeaders();
        delete headers['Content-Type']; // 让浏览器自动设置multipart/form-data

        xhr.open('POST', this.buildUrl('/files/upload'));
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        const startTime = Date.now();
        xhr.send(formData);
      });
    }

    // 简单上传（无进度）
    const headers = this.buildHeaders();
    delete headers['Content-Type'];

    try {
      const response = await this.request<FileUploadResponse>('/files/upload', {
        method: 'POST',
        body: formData,
        headers, // Keep headers for Authorization etc., but remove Content-Type
        signal,
        cache: 'no-store' as RequestCache,
      });
      return response;
    } catch (error: any) {
      throw new ApiClientError(
        error.message || 'File upload failed',
        error.code || 'UPLOAD_FAILED',
        error.status
      );
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(fileId: string): Promise<FileMetadata> {
    return this.request<FileMetadata>(`/files/${fileId}`);
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<{ message: string }> {
    this.cache.invalidateByPattern('/files');
    return this.request<{ message: string }>(`/files/${fileId}`, {
      method: 'DELETE',
      cache: 'no-store' as RequestCache,
    });
  }

  // ===== 系统相关方法 =====

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health');
  }

  /**
   * 获取API信息
   */
  async getApiInfo(): Promise<ApiInfo> {
    return this.request<ApiInfo>('/');
  }

  // ===== 缓存管理方法 =====

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 按模式清除缓存
   */
  clearCacheByPattern(pattern: string): void {
    this.cache.invalidateByPattern(pattern);
  }

  /**
   * 预热缓存
   */
  async warmupCache(): Promise<void> {
    const endpoints = [
      '/health',
      '/',
      '/writing/modes',
    ];

    await Promise.allSettled(
      endpoints.map(endpoint => 
        this.request(endpoint).catch(() => {
          // 忽略预热失败
        })
      )
    );
  }

  // ===== WebSocket支持 =====

  /**
   * 创建WebSocket连接
   */
  createWebSocket(endpoint: string): WebSocket {
    const wsUrl = this.baseURL.replace(/^http/, 'ws') + endpoint;
    const ws = new WebSocket(wsUrl);

    // 添加认证
    if (this.authTokenProvider) {
      const token = this.authTokenProvider();
      if (token) {
        ws.addEventListener('open', () => {
          ws.send(JSON.stringify({
            type: 'auth',
            token,
          }));
        });
      }
    }

    return ws;
  }

  /**
   * 创建工作流WebSocket连接
   */
  createWorkflowWebSocket(documentId: string): WebSocket {
    return this.createWebSocket(`/workflow/${documentId}/ws`);
  }
}

// 创建默认实例
export const apiClient = new ApiClient();

// 导出默认实例
export default apiClient;