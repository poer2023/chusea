/**
 * 写作API
 * 提供写作生成、改进、转换等功能
 */

import { apiClient } from './client'
import {
  WritingRequest,
  WritingResponse,
  WritingMode
} from './types'

export class WritingAPI {
  private readonly baseEndpoint = '/api/writing'

  /**
   * 生成写作内容
   */
  async generateWriting(request: WritingRequest): Promise<WritingResponse> {
    const response = await apiClient.post<WritingResponse>(
      `${this.baseEndpoint}/generate`,
      request
    )
    return response.data
  }

  /**
   * 改进写作内容
   */
  async improveWriting(request: WritingRequest): Promise<WritingResponse> {
    const response = await apiClient.post<WritingResponse>(
      `${this.baseEndpoint}/improve`,
      request
    )
    return response.data
  }

  /**
   * 转换写作模式
   */
  async convertWritingMode(request: WritingRequest): Promise<WritingResponse> {
    const response = await apiClient.post<WritingResponse>(
      `${this.baseEndpoint}/convert`,
      request
    )
    return response.data
  }

  /**
   * 获取写作建议
   */
  async getWritingSuggestions(mode: string): Promise<{ suggestions: string[] }> {
    const response = await apiClient.get<{ suggestions: string[] }>(
      `${this.baseEndpoint}/suggestions/${mode}`
    )
    return response.data
  }

  /**
   * 获取支持的写作模式
   */
  async getWritingModes(): Promise<{ modes: WritingMode[] }> {
    const response = await apiClient.get<{ modes: WritingMode[] }>(
      `${this.baseEndpoint}/modes`
    )
    return response.data
  }

  /**
   * 生成学术写作内容
   */
  async generateAcademicWriting(
    prompt: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt,
      document_id: documentId,
      mode: 'academic',
      context
    })
  }

  /**
   * 生成博客写作内容
   */
  async generateBlogWriting(
    prompt: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt,
      document_id: documentId,
      mode: 'blog',
      context
    })
  }

  /**
   * 生成社交媒体写作内容
   */
  async generateSocialWriting(
    prompt: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt,
      document_id: documentId,
      mode: 'social',
      context
    })
  }

  /**
   * 改进学术写作内容
   */
  async improveAcademicWriting(
    content: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.improveWriting({
      prompt: content,
      document_id: documentId,
      mode: 'academic',
      context
    })
  }

  /**
   * 改进博客写作内容
   */
  async improveBlogWriting(
    content: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.improveWriting({
      prompt: content,
      document_id: documentId,
      mode: 'blog',
      context
    })
  }

  /**
   * 改进社交媒体写作内容
   */
  async improveSocialWriting(
    content: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.improveWriting({
      prompt: content,
      document_id: documentId,
      mode: 'social',
      context
    })
  }

  /**
   * 将学术写作转换为博客格式
   */
  async convertAcademicToBlog(
    content: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.convertWritingMode({
      prompt: content,
      document_id: documentId,
      mode: 'academic',
      context: {
        ...context,
        target_mode: 'blog'
      }
    })
  }

  /**
   * 将博客写作转换为学术格式
   */
  async convertBlogToAcademic(
    content: string,
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.convertWritingMode({
      prompt: content,
      document_id: documentId,
      mode: 'blog',
      context: {
        ...context,
        target_mode: 'academic'
      }
    })
  }

  /**
   * 将写作内容转换为社交媒体格式
   */
  async convertToSocial(
    content: string,
    sourceMode: 'academic' | 'blog',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.convertWritingMode({
      prompt: content,
      document_id: documentId,
      mode: sourceMode,
      context: {
        ...context,
        target_mode: 'social'
      }
    })
  }

  /**
   * 扩展写作内容
   */
  async expandWriting(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请扩展以下内容：\n${content}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'expand'
      }
    })
  }

  /**
   * 总结写作内容
   */
  async summarizeWriting(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请总结以下内容：\n${content}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'summarize'
      }
    })
  }

  /**
   * 重写写作内容
   */
  async rewriteWriting(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请重写以下内容：\n${content}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'rewrite'
      }
    })
  }

  /**
   * 优化写作语法
   */
  async optimizeGrammar(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.improveWriting({
      prompt: content,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'grammar'
      }
    })
  }

  /**
   * 优化写作风格
   */
  async optimizeStyle(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.improveWriting({
      prompt: content,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'style'
      }
    })
  }

  /**
   * 优化写作结构
   */
  async optimizeStructure(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.improveWriting({
      prompt: content,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'structure'
      }
    })
  }

  /**
   * 生成写作大纲
   */
  async generateOutline(
    topic: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请为以下主题生成大纲：${topic}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'outline'
      }
    })
  }

  /**
   * 生成写作标题
   */
  async generateTitle(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请为以下内容生成标题：\n${content}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'title'
      }
    })
  }

  /**
   * 生成写作摘要
   */
  async generateAbstract(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请为以下内容生成摘要：\n${content}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'abstract'
      }
    })
  }

  /**
   * 生成写作结论
   */
  async generateConclusion(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请为以下内容生成结论：\n${content}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'conclusion'
      }
    })
  }

  /**
   * 检查写作内容
   */
  async checkWriting(
    content: string,
    mode: 'academic' | 'blog' | 'social',
    checkType: 'grammar' | 'style' | 'plagiarism' | 'readability' = 'grammar',
    documentId?: number,
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请检查以下内容的${checkType}：\n${content}`,
      document_id: documentId,
      mode,
      context: {
        ...context,
        task_type: 'check',
        check_type: checkType
      }
    })
  }

  /**
   * 获取写作灵感
   */
  async getWritingInspiration(
    topic: string,
    mode: 'academic' | 'blog' | 'social',
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请为主题"${topic}"提供写作灵感和想法`,
      mode,
      context: {
        ...context,
        task_type: 'inspiration'
      }
    })
  }

  /**
   * 生成写作模板
   */
  async generateTemplate(
    type: string,
    mode: 'academic' | 'blog' | 'social',
    context?: Record<string, any>
  ): Promise<WritingResponse> {
    return this.generateWriting({
      prompt: `请生成一个${type}模板`,
      mode,
      context: {
        ...context,
        task_type: 'template',
        template_type: type
      }
    })
  }
}

// 创建单例实例
export const writingAPI = new WritingAPI()

// 写作相关的工具函数
export const writingUtils = {
  /**
   * 获取写作模式的描述
   */
  getWritingModeDescription(mode: string): string {
    switch (mode) {
      case 'academic':
        return '学术写作模式，适用于论文、研究报告等正式文档'
      case 'blog':
        return '博客写作模式，适用于博客文章、技术分享等'
      case 'social':
        return '社交媒体写作模式，适用于推文、朋友圈等社交媒体内容'
      default:
        return '未知写作模式'
    }
  },

  /**
   * 获取写作模式的图标
   */
  getWritingModeIcon(mode: string): string {
    switch (mode) {
      case 'academic':
        return '📚'
      case 'blog':
        return '📝'
      case 'social':
        return '📱'
      default:
        return '📄'
    }
  },

  /**
   * 获取写作模式的颜色
   */
  getWritingModeColor(mode: string): string {
    switch (mode) {
      case 'academic':
        return 'blue'
      case 'blog':
        return 'green'
      case 'social':
        return 'purple'
      default:
        return 'gray'
    }
  },

  /**
   * 验证写作请求
   */
  validateWritingRequest(request: WritingRequest): { valid: boolean; message?: string } {
    if (!request.prompt.trim()) {
      return { valid: false, message: '写作提示不能为空' }
    }

    if (request.prompt.length > 10000) {
      return { valid: false, message: '写作提示不能超过10000个字符' }
    }

    const validModes = ['academic', 'blog', 'social']
    if (!validModes.includes(request.mode)) {
      return { valid: false, message: '无效的写作模式' }
    }

    return { valid: true }
  },

  /**
   * 格式化写作响应
   */
  formatWritingResponse(response: WritingResponse): string {
    if (!response.success) {
      return response.error || '写作生成失败'
    }
    return response.content
  },

  /**
   * 计算写作响应的质量评分
   */
  calculateQualityScore(response: WritingResponse): number {
    if (!response.success) {
      return 0
    }

    let score = 50 // 基础分

    // 根据内容长度调整分数
    const contentLength = response.content.length
    if (contentLength > 100) score += 10
    if (contentLength > 500) score += 10
    if (contentLength > 1000) score += 10

    // 根据tokens使用量调整分数
    if (response.tokens_used > 100) score += 5
    if (response.tokens_used > 500) score += 5

    // 根据元数据调整分数
    if (response.metadata.readability_score) {
      score += Math.round(response.metadata.readability_score / 10)
    }

    return Math.min(100, score)
  },

  /**
   * 获取写作任务类型的描述
   */
  getTaskTypeDescription(taskType: string): string {
    switch (taskType) {
      case 'generate':
        return '生成新内容'
      case 'improve':
        return '改进现有内容'
      case 'convert':
        return '转换写作模式'
      case 'expand':
        return '扩展内容'
      case 'summarize':
        return '总结内容'
      case 'rewrite':
        return '重写内容'
      case 'grammar':
        return '优化语法'
      case 'style':
        return '优化风格'
      case 'structure':
        return '优化结构'
      case 'outline':
        return '生成大纲'
      case 'title':
        return '生成标题'
      case 'abstract':
        return '生成摘要'
      case 'conclusion':
        return '生成结论'
      case 'check':
        return '检查内容'
      case 'inspiration':
        return '获取灵感'
      case 'template':
        return '生成模板'
      default:
        return '未知任务'
    }
  },

  /**
   * 估算写作时间
   */
  estimateWritingTime(contentLength: number): string {
    const wordsPerMinute = 200 // 平均写作速度
    const words = contentLength / 5 // 估算字数
    const minutes = Math.ceil(words / wordsPerMinute)

    if (minutes < 1) {
      return '不到1分钟'
    } else if (minutes < 60) {
      return `约${minutes}分钟`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `约${hours}小时${remainingMinutes}分钟`
    }
  }
}

export default writingAPI