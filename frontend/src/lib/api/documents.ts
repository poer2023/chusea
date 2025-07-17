/**
 * 文档API
 * 提供文档的CRUD操作、搜索和统计功能
 */

import { apiClient } from './client'
import {
  DocumentCreate,
  DocumentUpdate,
  DocumentResponse,
  DocumentListResponse,
  DocumentStats,
  DocumentQueryParams,
  DocumentType
} from './types'

export class DocumentsAPI {
  private readonly baseEndpoint = '/api/documents'

  /**
   * 获取文档列表
   */
  async getDocuments(params: DocumentQueryParams = {}): Promise<DocumentListResponse> {
    const {
      page = 1,
      page_size = 10,
      document_type,
      search
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString()
    })

    if (document_type) {
      queryParams.append('document_type', document_type)
    }

    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get<DocumentListResponse>(
      `${this.baseEndpoint}?${queryParams.toString()}`
    )
    return response.data
  }

  /**
   * 获取单个文档
   */
  async getDocument(documentId: number): Promise<DocumentResponse> {
    const response = await apiClient.get<DocumentResponse>(`${this.baseEndpoint}/${documentId}`)
    return response.data
  }

  /**
   * 创建新文档
   */
  async createDocument(document: DocumentCreate): Promise<DocumentResponse> {
    const response = await apiClient.post<DocumentResponse>(this.baseEndpoint, document)
    return response.data
  }

  /**
   * 更新文档
   */
  async updateDocument(documentId: number, document: DocumentUpdate): Promise<DocumentResponse> {
    const response = await apiClient.put<DocumentResponse>(`${this.baseEndpoint}/${documentId}`, document)
    return response.data
  }

  /**
   * 删除文档（软删除）
   */
  async deleteDocument(documentId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.baseEndpoint}/${documentId}`)
    return response.data
  }

  /**
   * 复制文档
   */
  async duplicateDocument(documentId: number): Promise<DocumentResponse> {
    const response = await apiClient.post<DocumentResponse>(`${this.baseEndpoint}/${documentId}/duplicate`)
    return response.data
  }

  /**
   * 获取文档统计信息
   */
  async getDocumentStats(): Promise<DocumentStats> {
    const response = await apiClient.get<DocumentStats>(`${this.baseEndpoint}/stats/overview`)
    return response.data
  }

  /**
   * 搜索文档
   */
  async searchDocuments(
    query: string,
    options: {
      document_type?: DocumentType
      page?: number
      page_size?: number
    } = {}
  ): Promise<DocumentListResponse> {
    return this.getDocuments({
      search: query,
      ...options
    })
  }

  /**
   * 按类型获取文档
   */
  async getDocumentsByType(
    documentType: DocumentType,
    options: {
      page?: number
      page_size?: number
    } = {}
  ): Promise<DocumentListResponse> {
    return this.getDocuments({
      document_type: documentType,
      ...options
    })
  }

  /**
   * 获取最近的文档
   */
  async getRecentDocuments(limit: number = 10): Promise<DocumentResponse[]> {
    const response = await this.getDocuments({
      page: 1,
      page_size: limit
    })
    return response.documents
  }

  /**
   * 批量删除文档
   */
  async deleteDocuments(documentIds: number[]): Promise<{ message: string; deleted_count: number }> {
    const response = await apiClient.post<{ message: string; deleted_count: number }>(
      `${this.baseEndpoint}/batch-delete`,
      { document_ids: documentIds }
    )
    return response.data
  }

  /**
   * 批量更新文档
   */
  async updateDocuments(
    documentIds: number[],
    updates: Partial<DocumentUpdate>
  ): Promise<{ message: string; updated_count: number }> {
    const response = await apiClient.put<{ message: string; updated_count: number }>(
      `${this.baseEndpoint}/batch-update`,
      { document_ids: documentIds, updates }
    )
    return response.data
  }

  /**
   * 恢复已删除的文档
   */
  async restoreDocument(documentId: number): Promise<DocumentResponse> {
    const response = await apiClient.post<DocumentResponse>(`${this.baseEndpoint}/${documentId}/restore`)
    return response.data
  }

  /**
   * 永久删除文档
   */
  async permanentlyDeleteDocument(documentId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.baseEndpoint}/${documentId}/permanent`)
    return response.data
  }

  /**
   * 获取已删除的文档
   */
  async getDeletedDocuments(params: DocumentQueryParams = {}): Promise<DocumentListResponse> {
    const {
      page = 1,
      page_size = 10,
      search
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString()
    })

    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get<DocumentListResponse>(
      `${this.baseEndpoint}/deleted?${queryParams.toString()}`
    )
    return response.data
  }

  /**
   * 导出文档
   */
  async exportDocument(
    documentId: number,
    format: 'pdf' | 'docx' | 'markdown' | 'html' = 'pdf'
  ): Promise<Blob> {
    const response = await apiClient.download(
      `${this.baseEndpoint}/${documentId}/export?format=${format}`
    )
    return response
  }

  /**
   * 导入文档
   */
  async importDocument(
    file: File,
    options: {
      document_type?: DocumentType
      title?: string
    } = {}
  ): Promise<DocumentResponse> {
    const response = await apiClient.upload<DocumentResponse>(
      `${this.baseEndpoint}/import`,
      file,
      options
    )
    return response.data
  }

  /**
   * 获取文档历史版本
   */
  async getDocumentHistory(documentId: number): Promise<Array<{
    id: string
    version: number
    content: string
    created_at: string
    changes_summary: string
  }>> {
    const response = await apiClient.get<Array<{
      id: string
      version: number
      content: string
      created_at: string
      changes_summary: string
    }>>(`${this.baseEndpoint}/${documentId}/history`)
    return response.data
  }

  /**
   * 恢复文档到指定版本
   */
  async restoreDocumentVersion(documentId: number, versionId: string): Promise<DocumentResponse> {
    const response = await apiClient.post<DocumentResponse>(
      `${this.baseEndpoint}/${documentId}/history/${versionId}/restore`
    )
    return response.data
  }

  /**
   * 分享文档
   */
  async shareDocument(
    documentId: number,
    options: {
      permissions: 'read' | 'write'
      expires_at?: string
      password?: string
    }
  ): Promise<{ share_url: string; share_id: string }> {
    const response = await apiClient.post<{ share_url: string; share_id: string }>(
      `${this.baseEndpoint}/${documentId}/share`,
      options
    )
    return response.data
  }

  /**
   * 获取分享链接信息
   */
  async getShareInfo(shareId: string): Promise<{
    document_id: number
    title: string
    permissions: string
    expires_at?: string
    is_password_protected: boolean
  }> {
    const response = await apiClient.get<{
      document_id: number
      title: string
      permissions: string
      expires_at?: string
      is_password_protected: boolean
    }>(`${this.baseEndpoint}/share/${shareId}`)
    return response.data
  }

  /**
   * 通过分享链接访问文档
   */
  async accessSharedDocument(shareId: string, password?: string): Promise<DocumentResponse> {
    const response = await apiClient.post<DocumentResponse>(
      `${this.baseEndpoint}/share/${shareId}/access`,
      { password }
    )
    return response.data
  }

  /**
   * 撤销文档分享
   */
  async revokeDocumentShare(documentId: number, shareId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `${this.baseEndpoint}/${documentId}/share/${shareId}`
    )
    return response.data
  }

  /**
   * 获取文档的分享列表
   */
  async getDocumentShares(documentId: number): Promise<Array<{
    id: string
    permissions: string
    expires_at?: string
    created_at: string
    access_count: number
  }>> {
    const response = await apiClient.get<Array<{
      id: string
      permissions: string
      expires_at?: string
      created_at: string
      access_count: number
    }>>(`${this.baseEndpoint}/${documentId}/shares`)
    return response.data
  }

  /**
   * 添加文档标签
   */
  async addDocumentTags(documentId: number, tags: string[]): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/${documentId}/tags`,
      { tags }
    )
    return response.data
  }

  /**
   * 移除文档标签
   */
  async removeDocumentTags(documentId: number, tags: string[]): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `${this.baseEndpoint}/${documentId}/tags`,
      {
        body: JSON.stringify({ tags })
      }
    )
    return response.data
  }

  /**
   * 获取文档标签
   */
  async getDocumentTags(documentId: number): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseEndpoint}/${documentId}/tags`)
    return response.data
  }

  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<Array<{ name: string; count: number }>> {
    const response = await apiClient.get<Array<{ name: string; count: number }>>(
      `${this.baseEndpoint}/tags`
    )
    return response.data
  }

  /**
   * 按标签搜索文档
   */
  async getDocumentsByTags(
    tags: string[],
    options: DocumentQueryParams = {}
  ): Promise<DocumentListResponse> {
    const queryParams = new URLSearchParams({
      page: (options.page || 1).toString(),
      page_size: (options.page_size || 10).toString()
    })

    tags.forEach(tag => queryParams.append('tags', tag))

    if (options.search) {
      queryParams.append('search', options.search)
    }

    if (options.document_type) {
      queryParams.append('document_type', options.document_type)
    }

    const response = await apiClient.get<DocumentListResponse>(
      `${this.baseEndpoint}/search/tags?${queryParams.toString()}`
    )
    return response.data
  }

  /**
   * 收藏文档
   */
  async favoriteDocument(documentId: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`${this.baseEndpoint}/${documentId}/favorite`)
    return response.data
  }

  /**
   * 取消收藏文档
   */
  async unfavoriteDocument(documentId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.baseEndpoint}/${documentId}/favorite`)
    return response.data
  }

  /**
   * 获取收藏的文档
   */
  async getFavoriteDocuments(params: DocumentQueryParams = {}): Promise<DocumentListResponse> {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      page_size: (params.page_size || 10).toString()
    })

    if (params.search) {
      queryParams.append('search', params.search)
    }

    if (params.document_type) {
      queryParams.append('document_type', params.document_type)
    }

    const response = await apiClient.get<DocumentListResponse>(
      `${this.baseEndpoint}/favorites?${queryParams.toString()}`
    )
    return response.data
  }
}

// 创建单例实例
export const documentsAPI = new DocumentsAPI()

// 文档相关的工具函数
export const documentUtils = {
  /**
   * 计算文档字数
   */
  countWords(content: string): number {
    if (!content) return 0
    
    // 移除HTML标签
    const text = content.replace(/<[^>]+>/g, '')
    
    // 分别计算中文字符和英文单词
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (text.match(/\b[a-zA-Z]+\b/g) || []).length
    
    return chineseChars + englishWords
  },

  /**
   * 格式化文档类型
   */
  formatDocumentType(type: DocumentType): string {
    switch (type) {
      case DocumentType.ACADEMIC:
        return '学术文档'
      case DocumentType.BLOG:
        return '博客文章'
      case DocumentType.SOCIAL:
        return '社交媒体'
      default:
        return '未知类型'
    }
  },

  /**
   * 获取文档类型颜色
   */
  getDocumentTypeColor(type: DocumentType): string {
    switch (type) {
      case DocumentType.ACADEMIC:
        return 'blue'
      case DocumentType.BLOG:
        return 'green'
      case DocumentType.SOCIAL:
        return 'purple'
      default:
        return 'gray'
    }
  },

  /**
   * 格式化文档创建时间
   */
  formatCreatedAt(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return '今天'
    } else if (diffInDays === 1) {
      return '昨天'
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  },

  /**
   * 生成文档摘要
   */
  generateSummary(content: string, maxLength: number = 100): string {
    if (!content) return ''
    
    // 移除HTML标签
    const text = content.replace(/<[^>]+>/g, '').trim()
    
    if (text.length <= maxLength) {
      return text
    }
    
    return text.substring(0, maxLength) + '...'
  },

  /**
   * 验证文档标题
   */
  validateTitle(title: string): { valid: boolean; message?: string } {
    if (!title.trim()) {
      return { valid: false, message: '标题不能为空' }
    }
    
    if (title.length < 1) {
      return { valid: false, message: '标题至少需要1个字符' }
    }
    
    if (title.length > 500) {
      return { valid: false, message: '标题不能超过500个字符' }
    }
    
    return { valid: true }
  },

  /**
   * 获取文档大小（估算）
   */
  getDocumentSize(content: string): string {
    const sizeInBytes = new Blob([content]).size
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
    }
  },

  /**
   * 检查文档是否为空
   */
  isDocumentEmpty(content: string): boolean {
    if (!content) return true
    
    // 移除HTML标签和空白字符
    const text = content.replace(/<[^>]+>/g, '').trim()
    return text.length === 0
  }
}

export default documentsAPI