import { APIResponse, APIError, RequestConfig, APIClientConfig, UploadProgress } from '../../types';
import { API_CONFIG, API_ENDPOINTS, ERROR_CODES, HTTP_STATUS } from '../constants';

// Enhanced API client configuration
const API_CLIENT_CONFIG: APIClientConfig = {
  baseURL: API_CONFIG.BASE_URL,
  version: API_CONFIG.VERSION,
  timeout: API_CONFIG.DEFAULT_TIMEOUT,
  retries: API_CONFIG.MAX_RETRIES,
  retryDelay: API_CONFIG.RETRY_DELAY,
  enableLogging: process.env.NODE_ENV === 'development',
  enableDevTools: process.env.NODE_ENV === 'development'
};

// Enhanced API client with comprehensive features
class APIClient {
  private baseURL: string;
  private config: APIClientConfig;
  private defaultHeaders: Record<string, string>;
  private requestQueue: Map<string, AbortController>;
  private rateLimiter: Map<string, number>;
  private retryDelays: Map<string, number>;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = { ...API_CLIENT_CONFIG, ...config };
    this.baseURL = `${this.config.baseURL}/api/${this.config.version}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '1.0.0',
    };
    this.requestQueue = new Map();
    this.rateLimiter = new Map();
    this.retryDelays = new Map();
    
    if (this.config.enableLogging) {
      this.log('APIClient initialized', { baseURL: this.baseURL, config: this.config });
    }
  }

  // Enhanced logging
  private log(message: string, data?: any) {
    if (this.config.enableLogging) {
      console.log(`[APIClient] ${message}`, data);
    }
  }

  // Rate limiting check
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(endpoint);
    
    if (lastRequest && now - lastRequest < API_CONFIG.RATE_LIMIT_WINDOW) {
      return false; // Rate limited
    }
    
    this.rateLimiter.set(endpoint, now);
    return true;
  }

  // Request deduplication
  private getRequestId(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  // Cancel duplicate requests
  private cancelDuplicateRequest(requestId: string): boolean {
    const existingController = this.requestQueue.get(requestId);
    if (existingController) {
      existingController.abort();
      this.requestQueue.delete(requestId);
      return true;
    }
    return false;
  }

  // Get auth token from storage or store
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // TODO: Get token from auth store or localStorage
    // For now, return null - implement based on your auth strategy
    return localStorage.getItem('auth_token');
  }

  // Build headers for requests
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }
    
    return headers;
  }

  // Handle API responses and errors
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');
    
    if (!response.ok) {
      let errorData: any;
      
      try {
        errorData = isJSON ? await response.json() : { message: await response.text() };
      } catch {
        errorData = { message: 'An unexpected error occurred' };
      }
      
      const apiError: APIError = {
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        code: errorData.code || `HTTP_${response.status}`,
        details: errorData.details || { status: response.status, statusText: response.statusText },
        timestamp: new Date().toISOString(),
      };
      
      throw apiError;
    }
    
    if (isJSON) {
      const data = await response.json() as APIResponse<T>;
      return data.data;
    }
    
    // For non-JSON responses (like file downloads)
    return response as unknown as T;
  }

  // Create AbortController with timeout
  private createAbortController(timeout: number = DEFAULT_TIMEOUT): AbortController {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Clear timeout if request completes normally
    controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
    
    return controller;
  }

  // Enhanced request method with retry logic and optimistic updates
  async request<T>(
    endpoint: string,
    options: RequestConfig & RequestInit = {}
  ): Promise<T> {
    const {
      timeout = this.config.timeout,
      retries = this.config.retries,
      retryDelay = this.config.retryDelay,
      headers: customHeaders,
      onUploadProgress,
      signal: externalSignal,
      ...fetchOptions
    } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    const requestId = this.getRequestId(url, fetchOptions);
    
    // Check rate limiting
    if (!this.checkRateLimit(endpoint)) {
      throw this.createAPIError('Rate limit exceeded', ERROR_CODES.RATE_LIMITED, { endpoint });
    }
    
    // Cancel duplicate requests (except for GET requests)
    if (fetchOptions.method !== 'GET') {
      this.cancelDuplicateRequest(requestId);
    }
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = this.createAbortController(timeout);
      this.requestQueue.set(requestId, controller);
      
      try {
        const headers = this.buildHeaders(customHeaders as Record<string, string>);
        
        // Combine external signal with timeout controller
        const combinedSignal = externalSignal 
          ? this.combineAbortSignals([controller.signal, externalSignal])
          : controller.signal;
        
        this.log(`Request attempt ${attempt + 1}/${retries + 1}`, { 
          method: fetchOptions.method || 'GET', 
          url, 
          attempt 
        });
        
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: combinedSignal,
        });
        
        const result = await this.handleResponse<T>(response);
        
        // Clear from queue on success
        this.requestQueue.delete(requestId);
        this.retryDelays.delete(endpoint);
        
        this.log('Request successful', { url, attempt: attempt + 1 });
        return result;
        
      } catch (error) {
        this.requestQueue.delete(requestId);
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error as Error)) {
          this.log('Request failed (no retry)', { url, error: error.message });
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === retries) {
          this.log('Request failed (max retries)', { url, attempts: attempt + 1, error: error.message });
          break;
        }
        
        // Calculate retry delay with exponential backoff
        const delay = this.calculateRetryDelay(endpoint, attempt, retryDelay);
        this.log(`Request failed, retrying in ${delay}ms`, { url, attempt: attempt + 1, error: error.message });
        
        await this.sleep(delay);
      }
    }
    
    throw lastError || this.createAPIError('Request failed after retries', ERROR_CODES.INTERNAL_ERROR);
  }

  // Combine multiple abort signals
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

  // Determine if error should not be retried
  private shouldNotRetry(error: Error): boolean {
    const errorObj = error as any;
    
    // Don't retry client errors (4xx)
    if (errorObj.status >= 400 && errorObj.status < 500) {
      return true;
    }
    
    // Don't retry specific error codes
    const nonRetryableCodes = [
      ERROR_CODES.UNAUTHORIZED,
      ERROR_CODES.FORBIDDEN,
      ERROR_CODES.NOT_FOUND,
      ERROR_CODES.VALIDATION_ERROR,
      ERROR_CODES.INVALID_CREDENTIALS
    ];
    
    return nonRetryableCodes.includes(errorObj.code);
  }

  // Calculate retry delay with exponential backoff
  private calculateRetryDelay(endpoint: string, attempt: number, baseDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(API_CONFIG.RETRY_BACKOFF_FACTOR, attempt);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    const delay = Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
    
    this.retryDelays.set(endpoint, delay);
    return delay;
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Create standardized API error
  private createAPIError(message: string, code: string, details?: any): APIError {
    return {
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  // HTTP method shortcuts
  async get<T>(endpoint: string, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit & { timeout?: number }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit & { timeout?: number }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit & { timeout?: number }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Enhanced file upload with progress tracking and validation
  async upload<T>(
    endpoint: string,
    files: File | File[],
    options: {
      onProgress?: (progress: UploadProgress) => void;
      timeout?: number;
      additionalData?: Record<string, any>;
      validate?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<T> {
    const { 
      onProgress, 
      timeout = API_CONFIG.UPLOAD_TIMEOUT, 
      additionalData,
      validate = true,
      signal: externalSignal
    } = options;
    
    const fileArray = Array.isArray(files) ? files : [files];
    
    // Validate files if requested
    if (validate) {
      this.validateFiles(fileArray);
    }
    
    const formData = new FormData();
    
    // Add files to form data
    fileArray.forEach((file, index) => {
      const fieldName = fileArray.length === 1 ? 'file' : `files[${index}]`;
      formData.append(fieldName, file);
    });
    
    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }
    
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders();
    
    // Remove Content-Type header to let browser set it with boundary for FormData
    delete headers['Content-Type'];
    
    // Calculate total size for progress tracking
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    
    try {
      // Use XMLHttpRequest for upload progress tracking
      if (onProgress) {
        return new Promise<T>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress: UploadProgress = {
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
                const response = new Response(xhr.response, {
                  status: xhr.status,
                  statusText: xhr.statusText,
                  headers: new Headers(this.parseResponseHeaders(xhr.getAllResponseHeaders())),
                });
                const result = await this.handleResponse<T>(response);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            } else {
              reject(this.createAPIError(
                `Upload failed with status ${xhr.status}`,
                ERROR_CODES.UPLOAD_FAILED,
                { status: xhr.status, statusText: xhr.statusText }
              ));
            }
          });
          
          xhr.addEventListener('error', () => {
            reject(this.createAPIError('Upload failed', ERROR_CODES.UPLOAD_FAILED));
          });
          
          xhr.addEventListener('abort', () => {
            reject(this.createAPIError('Upload aborted', ERROR_CODES.UPLOAD_FAILED));
          });
          
          // Handle external abort signal
          if (externalSignal) {
            externalSignal.addEventListener('abort', () => xhr.abort());
          }
          
          // Handle timeout
          const timeoutController = this.createAbortController(timeout);
          timeoutController.signal.addEventListener('abort', () => xhr.abort());
          
          xhr.open('POST', url);
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
          xhr.send(formData);
        });
      }
      
      // Fallback to fetch for uploads without progress tracking
      const controller = this.createAbortController(timeout);
      const combinedSignal = externalSignal 
        ? this.combineAbortSignals([controller.signal, externalSignal])
        : controller.signal;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: combinedSignal,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createAPIError(
          'Upload timeout',
          ERROR_CODES.TIMEOUT,
          { timeout, fileCount: fileArray.length, totalSize }
        );
      }
      throw error;
    }
  }

  // Validate files before upload
  private validateFiles(files: File[]): void {
    if (files.length === 0) {
      throw this.createAPIError('No files selected', ERROR_CODES.VALIDATION_ERROR);
    }
    
    if (files.length > API_CONFIG.MAX_FILES_PER_UPLOAD) {
      throw this.createAPIError(
        `Too many files. Maximum ${API_CONFIG.MAX_FILES_PER_UPLOAD} files allowed`,
        ERROR_CODES.VALIDATION_ERROR,
        { maxFiles: API_CONFIG.MAX_FILES_PER_UPLOAD, providedFiles: files.length }
      );
    }
    
    for (const file of files) {
      if (file.size > API_CONFIG.MAX_FILE_SIZE) {
        throw this.createAPIError(
          `File "${file.name}" is too large. Maximum size is ${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
          ERROR_CODES.FILE_TOO_LARGE,
          { fileName: file.name, fileSize: file.size, maxSize: API_CONFIG.MAX_FILE_SIZE }
        );
      }
      
      // Check file type if supported types are defined
      const allSupportedTypes = [
        ...API_CONFIG.SUPPORTED_IMAGE_TYPES,
        ...API_CONFIG.SUPPORTED_DOCUMENT_TYPES
      ];
      
      if (allSupportedTypes.length > 0 && !allSupportedTypes.includes(file.type)) {
        throw this.createAPIError(
          `File type "${file.type}" is not supported`,
          ERROR_CODES.INVALID_FILE_TYPE,
          { fileName: file.name, fileType: file.type, supportedTypes: allSupportedTypes }
        );
      }
    }
  }

  // Parse XMLHttpRequest response headers
  private parseResponseHeaders(headerString: string): Record<string, string> {
    const headers: Record<string, string> = {};
    headerString.split('\r\n').forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        headers[key] = value;
      }
    });
    return headers;
  }

  // Enhanced file download with progress tracking
  async download(
    endpoint: string,
    filename?: string,
    options: {
      onProgress?: (progress: UploadProgress) => void;
      timeout?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<Blob> {
    const { 
      onProgress, 
      timeout = API_CONFIG.DOWNLOAD_TIMEOUT,
      signal: externalSignal
    } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders();
    
    const controller = this.createAbortController(timeout);
    const combinedSignal = externalSignal 
      ? this.combineAbortSignals([controller.signal, externalSignal])
      : controller.signal;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: combinedSignal,
      });
      
      if (!response.ok) {
        throw await this.handleResponse(response);
      }
      
      if (!response.body) {
        throw this.createAPIError('No response body for download', ERROR_CODES.INTERNAL_ERROR);
      }
      
      // Track download progress if callback provided
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
            const progress: UploadProgress = {
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            };
            onProgress(progress);
          }
        }
        
        return new Blob(chunks);
      }
      
      // Simple download without progress tracking
      return response.blob();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createAPIError(
          'Download timeout',
          ERROR_CODES.TIMEOUT,
          { timeout, filename }
        );
      }
      throw error;
    }
  }

  // Download file and trigger browser download
  async downloadFile(
    endpoint: string,
    filename: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void;
      timeout?: number;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const blob = await this.download(endpoint, filename, options);
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Streaming upload for large files
  async streamUpload<T>(
    endpoint: string,
    file: File,
    options: {
      chunkSize?: number;
      onProgress?: (progress: UploadProgress) => void;
      onChunkProgress?: (chunkIndex: number, totalChunks: number) => void;
      timeout?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<T> {
    const {
      chunkSize = 1024 * 1024, // 1MB chunks
      onProgress,
      onChunkProgress,
      timeout = API_CONFIG.UPLOAD_TIMEOUT,
      signal: externalSignal
    } = options;
    
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let uploadedBytes = 0;
    
    try {
      // Initialize multipart upload
      const initResponse = await this.request<{ uploadId: string }>('/files/upload/init', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          totalChunks,
          uploadId
        })
      });
      
      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (externalSignal?.aborted) {
          throw this.createAPIError('Upload cancelled', ERROR_CODES.UPLOAD_FAILED);
        }
        
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const chunkFormData = new FormData();
        chunkFormData.append('chunk', chunk);
        chunkFormData.append('chunkIndex', chunkIndex.toString());
        chunkFormData.append('uploadId', uploadId);
        
        await this.request('/files/upload/chunk', {
          method: 'POST',
          body: chunkFormData,
          timeout,
          signal: externalSignal
        });
        
        uploadedBytes += chunk.size;
        
        // Progress callbacks
        if (onProgress) {
          const progress: UploadProgress = {
            loaded: uploadedBytes,
            total: file.size,
            percentage: Math.round((uploadedBytes / file.size) * 100)
          };
          onProgress(progress);
        }
        
        if (onChunkProgress) {
          onChunkProgress(chunkIndex + 1, totalChunks);
        }
      }
      
      // Complete multipart upload
      return this.request<T>('/files/upload/complete', {
        method: 'POST',
        body: JSON.stringify({ uploadId }),
        timeout,
        signal: externalSignal
      });
      
    } catch (error) {
      // Clean up failed upload
      try {
        await this.request('/files/upload/abort', {
          method: 'POST',
          body: JSON.stringify({ uploadId })
        });
      } catch (cleanupError) {
        this.log('Failed to cleanup upload', { uploadId, error: cleanupError });
      }
      
      throw error;
    }
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export the class for testing or custom instances
export { APIClient };