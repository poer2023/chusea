/**
 * AI Service Integration
 * 
 * Connects the editor to AI services for text processing and analysis
 */

import { TextSelectionInfo, SelectionContextAnalysis } from '@/lib/editor/text-selection';
import { AIActionResult } from '@/lib/ai/text-actions';

export interface AIServiceConfig {
  /** API endpoint */
  endpoint: string;
  /** API key */
  apiKey: string;
  /** Model to use */
  model: string;
  /** Request timeout */
  timeout: number;
  /** Max retries */
  maxRetries: number;
  /** Enable caching */
  enableCache: boolean;
}

export interface AIRequest {
  /** Action type */
  action: string;
  /** Input text */
  text: string;
  /** Context information */
  context: {
    /** Selection info */
    selection: TextSelectionInfo;
    /** Context analysis */
    analysis: SelectionContextAnalysis;
    /** Additional context */
    documentContext?: string;
    /** User preferences */
    preferences?: Record<string, any>;
  };
  /** Request options */
  options?: {
    /** Temperature for generation */
    temperature?: number;
    /** Max tokens */
    maxTokens?: number;
    /** Custom prompt */
    customPrompt?: string;
    /** Format preference */
    format?: 'text' | 'html' | 'markdown';
  };
}

export interface AIResponse {
  /** Request ID */
  requestId: string;
  /** Response text */
  text: string;
  /** Confidence score */
  confidence: number;
  /** Processing time */
  processingTime: number;
  /** Tokens used */
  tokensUsed: number;
  /** Model used */
  model: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Error information */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class AIServiceIntegration {
  private config: AIServiceConfig;
  private cache = new Map<string, AIResponse>();
  private requestQueue: AIRequest[] = [];
  private processing = false;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * Process text with AI service
   */
  async processText(request: AIRequest): Promise<AIActionResult> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      if (this.config.enableCache && this.cache.has(cacheKey)) {
        const cachedResponse = this.cache.get(cacheKey)!;
        return this.transformResponse(cachedResponse);
      }

      // Make API request
      const response = await this.makeAPIRequest(request);
      
      // Cache the response
      if (this.config.enableCache) {
        this.cache.set(cacheKey, response);
      }

      return this.transformResponse(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'AI service error',
          code: 'AI_SERVICE_ERROR',
          recoverable: true,
        },
        analytics: {
          duration: Date.now() - startTime,
          model: this.config.model,
        },
      };
    }
  }

  /**
   * Make API request to AI service
   */
  private async makeAPIRequest(request: AIRequest): Promise<AIResponse> {
    const requestId = this.generateRequestId();
    const prompt = this.buildPrompt(request);
    
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.action),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: request.options?.temperature || 0.7,
        max_tokens: request.options?.maxTokens || 1000,
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      requestId,
      text: data.choices[0].message.content,
      confidence: this.calculateConfidence(data),
      processingTime: Date.now() - Date.now(),
      tokensUsed: data.usage?.total_tokens || 0,
      model: this.config.model,
      metadata: {
        usage: data.usage,
        finish_reason: data.choices[0].finish_reason,
      },
    };
  }

  /**
   * Build prompt for AI service
   */
  private buildPrompt(request: AIRequest): string {
    const { action, text, context } = request;
    const { selection, analysis } = context;

    let prompt = '';

    // Add context information
    if (context.documentContext) {
      prompt += `Document context: ${context.documentContext}\n\n`;
    }

    // Add selection information
    prompt += `Selected text: "${text}"\n`;
    prompt += `Selection type: ${selection.metadata.contentType}\n`;
    prompt += `Word count: ${selection.metadata.wordCount}\n`;
    prompt += `Context: ${selection.context.fullBlock}\n\n`;

    // Add analysis information
    prompt += `Content analysis:\n`;
    prompt += `- Style: ${analysis.content.style}\n`;
    prompt += `- Quality: ${analysis.content.quality}\n`;
    prompt += `- Readability: ${analysis.content.readability}\n`;
    prompt += `- Sentiment: ${analysis.content.sentiment}\n`;
    prompt += `- Topics: ${analysis.content.topics.join(', ')}\n\n`;

    // Add action-specific instructions
    prompt += this.getActionInstructions(action);

    // Add custom prompt if provided
    if (request.options?.customPrompt) {
      prompt += `\n\nAdditional instructions: ${request.options.customPrompt}`;
    }

    return prompt;
  }

  /**
   * Get system prompt for action
   */
  private getSystemPrompt(action: string): string {
    const basePrompt = 'You are an AI writing assistant. Provide helpful, accurate, and concise responses.';
    
    switch (action) {
      case 'improve-writing':
        return `${basePrompt} Focus on improving clarity, grammar, style, and overall quality while maintaining the original meaning and tone.`;
      case 'fix-grammar':
        return `${basePrompt} Correct grammatical errors, spelling mistakes, and punctuation issues while preserving the original style and meaning.`;
      case 'summarize':
        return `${basePrompt} Create a concise summary that captures the key points and main ideas of the text.`;
      case 'expand-text':
        return `${basePrompt} Expand the text by adding relevant details, examples, and explanations while maintaining coherence and flow.`;
      case 'change-tone':
        return `${basePrompt} Adjust the tone and style of the text according to the specified requirements while preserving the core message.`;
      case 'translate':
        return `${basePrompt} Translate the text accurately while maintaining the original meaning, context, and nuance.`;
      case 'format-code':
        return `${basePrompt} Format and improve code readability with proper indentation, spacing, and best practices.`;
      case 'explain-code':
        return `${basePrompt} Explain code functionality with clear comments and descriptions for better understanding.`;
      case 'create-outline':
        return `${basePrompt} Create a well-structured outline that organizes the main points and supporting details logically.`;
      case 'fact-check':
        return `${basePrompt} Verify factual claims and provide accurate information with appropriate caveats about verification.`;
      default:
        return basePrompt;
    }
  }

  /**
   * Get action-specific instructions
   */
  private getActionInstructions(action: string): string {
    switch (action) {
      case 'improve-writing':
        return 'Please improve the writing quality of the selected text. Focus on clarity, conciseness, and style.';
      case 'fix-grammar':
        return 'Please correct any grammatical errors, spelling mistakes, and punctuation issues in the selected text.';
      case 'summarize':
        return 'Please create a concise summary of the selected text, capturing the main points and key ideas.';
      case 'expand-text':
        return 'Please expand the selected text by adding relevant details, examples, and explanations.';
      case 'change-tone':
        return 'Please adjust the tone of the selected text to match the specified style or audience.';
      case 'translate':
        return 'Please translate the selected text to the specified language while maintaining meaning and context.';
      case 'format-code':
        return 'Please format the selected code with proper indentation, spacing, and style conventions.';
      case 'explain-code':
        return 'Please explain what the selected code does and add helpful comments for better understanding.';
      case 'create-outline':
        return 'Please create a structured outline based on the selected text, organizing main points and sub-points.';
      case 'fact-check':
        return 'Please verify the factual accuracy of the claims in the selected text and provide corrections if needed.';
      default:
        return 'Please process the selected text according to the specified action.';
    }
  }

  /**
   * Transform AI response to action result
   */
  private transformResponse(response: AIResponse): AIActionResult {
    if (response.error) {
      return {
        success: false,
        error: {
          message: response.error.message,
          code: response.error.code,
          recoverable: true,
        },
        analytics: {
          duration: response.processingTime,
          model: response.model,
          tokens: response.tokensUsed,
        },
      };
    }

    return {
      success: true,
      data: {
        text: response.text,
        html: this.formatAsHTML(response.text),
        metadata: response.metadata,
      },
      preview: {
        text: response.text,
        confidence: response.confidence,
      },
      analytics: {
        duration: response.processingTime,
        model: response.model,
        tokens: response.tokensUsed,
      },
    };
  }

  /**
   * Format text as HTML
   */
  private formatAsHTML(text: string): string {
    // Simple text to HTML conversion
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p>$1</p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(data: any): number {
    // Simple confidence calculation based on finish reason and response length
    const finishReason = data.choices[0].finish_reason;
    const responseLength = data.choices[0].message.content.length;
    
    let confidence = 0.8;
    
    if (finishReason === 'stop') {
      confidence += 0.1;
    } else if (finishReason === 'length') {
      confidence -= 0.1;
    }
    
    if (responseLength > 50) {
      confidence += 0.05;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(request: AIRequest): string {
    return `${request.action}:${JSON.stringify({
      text: request.text,
      options: request.options,
      contentType: request.context.selection.metadata.contentType,
    })}`;
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Default configuration
export const defaultAIConfig: AIServiceConfig = {
  endpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
  apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
  model: 'gpt-3.5-turbo',
  timeout: 30000,
  maxRetries: 3,
  enableCache: true,
};

// Create singleton instance
export const aiService = new AIServiceIntegration(defaultAIConfig);

export default AIServiceIntegration;