/**
 * FastAPI数据转换器
 * 处理FastAPI后端和前端TypeScript类型之间的转换
 */

// FastAPI响应类型转换器
export class FastAPITransformers {
  
  /**
   * 转换日期时间字符串为Date对象
   */
  static transformDateTime(dateTimeStr: string | null | undefined): Date | null {
    if (!dateTimeStr) return null;
    return new Date(dateTimeStr);
  }

  /**
   * 转换Date对象为ISO字符串 (FastAPI兼容)
   */
  static formatDateTime(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date.toISOString();
  }

  /**
   * 转换用户响应数据
   */
  static transformUserResponse(fastapiUser: any): any {
    return {
      id: fastapiUser.id,
      username: fastapiUser.username,
      email: fastapiUser.email,
      isActive: fastapiUser.is_active,
      createdAt: this.transformDateTime(fastapiUser.created_at),
      updatedAt: this.transformDateTime(fastapiUser.updated_at),
    };
  }

  /**
   * 转换文档响应数据
   */
  static transformDocumentResponse(fastapiDoc: any): any {
    return {
      id: fastapiDoc.id,
      title: fastapiDoc.title,
      content: fastapiDoc.content,
      documentType: fastapiDoc.document_type,
      wordCount: fastapiDoc.word_count,
      userId: fastapiDoc.user_id,
      createdAt: this.transformDateTime(fastapiDoc.created_at),
      updatedAt: this.transformDateTime(fastapiDoc.updated_at),
      metadata: {
        wordCount: fastapiDoc.word_count,
        type: fastapiDoc.document_type,
        status: 'draft', // 默认状态
        tags: [], // 默认空标签
        version: 1, // 默认版本
      }
    };
  }

  /**
   * 转换文献响应数据
   */
  static transformLiteratureResponse(fastapiLit: any): any {
    return {
      id: fastapiLit.id,
      title: fastapiLit.title,
      authors: fastapiLit.authors,
      year: fastapiLit.year,
      source: fastapiLit.source,
      doi: fastapiLit.doi,
      abstract: fastapiLit.abstract,
      url: fastapiLit.url,
      filePath: fastapiLit.file_path,
      userId: fastapiLit.user_id,
      isFavorite: fastapiLit.is_favorite,
      createdAt: this.transformDateTime(fastapiLit.created_at),
    };
  }

  /**
   * 转换写作会话响应数据
   */
  static transformWritingSessionResponse(fastapiSession: any): any {
    return {
      id: fastapiSession.id,
      documentId: fastapiSession.document_id,
      agentType: fastapiSession.agent_type,
      prompt: fastapiSession.prompt,
      response: fastapiSession.response,
      tokensUsed: fastapiSession.tokens_used,
      userId: fastapiSession.user_id,
      success: fastapiSession.success,
      errorMessage: fastapiSession.error_message,
      createdAt: this.transformDateTime(fastapiSession.created_at),
    };
  }

  /**
   * 转换写作响应数据
   */
  static transformWritingResponse(fastapiResponse: any): any {
    return {
      content: fastapiResponse.content,
      success: fastapiResponse.success,
      metadata: fastapiResponse.metadata || {},
      tokensUsed: fastapiResponse.tokens_used || 0,
      error: fastapiResponse.error,
    };
  }

  /**
   * 转换工作流文档响应数据
   */
  static transformWorkflowDocumentResponse(fastapiWorkflowDoc: any): any {
    return {
      id: fastapiWorkflowDoc.id,
      title: fastapiWorkflowDoc.title,
      content: fastapiWorkflowDoc.content,
      status: fastapiWorkflowDoc.status,
      config: fastapiWorkflowDoc.config,
      userId: fastapiWorkflowDoc.user_id,
      createdAt: this.transformDateTime(fastapiWorkflowDoc.created_at),
      updatedAt: this.transformDateTime(fastapiWorkflowDoc.updated_at),
      wordCount: fastapiWorkflowDoc.content ? fastapiWorkflowDoc.content.split(' ').length : 0,
    };
  }

  /**
   * 转换工作流节点响应数据
   */
  static transformWorkflowNodeResponse(fastapiNode: any): any {
    return {
      id: fastapiNode.id,
      type: fastapiNode.type,
      status: fastapiNode.status,
      content: fastapiNode.content,
      createdAt: fastapiNode.created_at,
      retryCount: fastapiNode.retry_count,
      metrics: fastapiNode.metrics ? {
        readabilityScore: fastapiNode.metrics.readability_score,
        grammarErrors: fastapiNode.metrics.grammar_errors,
        citationCount: fastapiNode.metrics.citation_count,
        wordCount: fastapiNode.metrics.word_count,
        processingTime: fastapiNode.metrics.processing_time,
      } : null,
    };
  }

  /**
   * 转换工作流状态响应数据
   */
  static transformWorkflowStatusResponse(fastapiStatus: any): any {
    return {
      documentId: fastapiStatus.document_id,
      status: fastapiStatus.status,
      progress: fastapiStatus.progress,
      currentNode: fastapiStatus.current_node ? 
        this.transformWorkflowNodeResponse(fastapiStatus.current_node) : null,
      nodes: fastapiStatus.nodes ? 
        fastapiStatus.nodes.map((node: any) => this.transformWorkflowNodeResponse(node)) : [],
    };
  }

  /**
   * 转换错误响应数据
   */
  static transformErrorResponse(fastapiError: any): any {
    return {
      message: fastapiError.detail || fastapiError.message || 'Unknown error',
      code: fastapiError.code || 'UNKNOWN_ERROR',
      details: fastapiError.details || {},
      timestamp: fastapiError.timestamp || new Date().toISOString(),
    };
  }

  /**
   * 转换分页响应数据
   */
  static transformPaginatedResponse<T>(
    fastapiResponse: any, 
    transformer: (item: any) => T
  ): any {
    return {
      data: fastapiResponse.documents?.map(transformer) || fastapiResponse.items?.map(transformer) || [],
      meta: {
        total: fastapiResponse.total || 0,
        page: fastapiResponse.page || 1,
        pageSize: fastapiResponse.page_size || 10,
        hasNext: fastapiResponse.page * fastapiResponse.page_size < fastapiResponse.total,
        hasPrev: fastapiResponse.page > 1,
      }
    };
  }

  /**
   * 转换创建文档请求
   */
  static transformCreateDocumentRequest(data: any): any {
    return {
      title: data.title,
      content: data.content || '',
      document_type: data.documentType || data.document_type || 'academic',
    };
  }

  /**
   * 转换更新文档请求
   */
  static transformUpdateDocumentRequest(data: any): any {
    const request: any = {};
    
    if (data.title !== undefined) request.title = data.title;
    if (data.content !== undefined) request.content = data.content;
    if (data.documentType !== undefined) request.document_type = data.documentType;
    if (data.document_type !== undefined) request.document_type = data.document_type;
    
    return request;
  }

  /**
   * 转换写作请求
   */
  static transformWritingRequest(data: any): any {
    return {
      prompt: data.prompt,
      user_id: data.userId || data.user_id || 1,
      document_id: data.documentId || data.document_id,
      mode: data.mode || 'academic',
      context: data.context || {},
    };
  }

  /**
   * 转换文献搜索请求
   */
  static transformLiteratureSearchRequest(data: any): any {
    return {
      query: data.query,
      max_results: data.maxResults || data.max_results || 10,
      year_range: data.yearRange || data.year_range,
      include_abstract: data.includeAbstract !== false, // 默认为true
    };
  }

  /**
   * 转换工作流配置
   */
  static transformLoopConfig(data: any): any {
    return {
      readability_threshold: data.readabilityThreshold || data.readability_threshold || 70.0,
      max_retries: data.maxRetries || data.max_retries || 3,
      auto_run: data.autoRun !== undefined ? data.autoRun : data.auto_run !== undefined ? data.auto_run : false,
      timeout: data.timeout || 60,
      writing_mode: data.writingMode || data.writing_mode || 'academic',
    };
  }

  /**
   * 转换启动工作流请求
   */
  static transformStartWorkflowRequest(data: any): any {
    return {
      document_id: data.documentId || data.document_id,
      prompt: data.prompt,
      config: data.config ? this.transformLoopConfig(data.config) : undefined,
    };
  }

  /**
   * 统一响应包装器
   */
  static wrapResponse<T>(data: T, message?: string): any {
    return {
      data,
      success: true,
      message: message || 'Operation successful',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 统一错误包装器
   */
  static wrapError(error: any): any {
    const transformedError = this.transformErrorResponse(error);
    return {
      data: null,
      success: false,
      error: transformedError,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 处理FastAPI健康检查响应
   */
  static transformHealthResponse(fastapiHealth: any): any {
    return {
      status: fastapiHealth.status,
      timestamp: fastapiHealth.timestamp,
      version: fastapiHealth.version,
      components: fastapiHealth.components,
    };
  }

  /**
   * 处理FastAPI根端点响应
   */
  static transformRootResponse(fastapiRoot: any): any {
    return {
      message: fastapiRoot.message,
      version: fastapiRoot.version,
      docs: fastapiRoot.docs,
      redoc: fastapiRoot.redoc,
      health: fastapiRoot.health,
      endpoints: fastapiRoot.endpoints,
    };
  }
}

// 导出常用的转换函数
export const {
  transformDateTime,
  formatDateTime,
  transformUserResponse,
  transformDocumentResponse,
  transformLiteratureResponse,
  transformWritingResponse,
  transformWorkflowDocumentResponse,
  transformWorkflowNodeResponse,
  transformWorkflowStatusResponse,
  transformErrorResponse,
  transformPaginatedResponse,
  transformCreateDocumentRequest,
  transformUpdateDocumentRequest,
  transformWritingRequest,
  transformLiteratureSearchRequest,
  transformLoopConfig,
  transformStartWorkflowRequest,
  wrapResponse,
  wrapError,
  transformHealthResponse,
  transformRootResponse,
} = FastAPITransformers;