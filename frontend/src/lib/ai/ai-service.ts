/**
 * AI Service Integration
 * Handles AI API calls, prompt engineering, and response processing
 */

import { SlashCommandContext, SlashCommandResult } from './slash-commands';
import { AIWebSocketClient, AIStreamChunk } from './websocket-client';

export interface AIServiceConfig {
  apiUrl: string;
  wsUrl: string;
  defaultModel: string;
  maxRetries: number;
  timeout: number;
  apiKey?: string;
}

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
  context?: string;
  onProgress?: (progress: number) => void;
  onStream?: (chunk: AIStreamChunk) => void;
}

export interface AIAnalysisResult {
  summary?: string;
  keywords?: string[];
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  readability?: {
    score: number;
    level: string;
  };
  structure?: {
    headings: string[];
    paragraphs: number;
    sentences: number;
    words: number;
  };
}

export interface AITranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface AIOptimizationResult {
  optimizedText: string;
  changes: Array<{
    type: 'grammar' | 'style' | 'clarity' | 'tone';
    original: string;
    suggested: string;
    explanation: string;
  }>;
  improvementScore: number;
}

export class AIService {
  private config: AIServiceConfig;
  private wsClient: AIWebSocketClient | null = null;
  private requestCache: Map<string, any> = new Map();

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = {
      apiUrl: '/api/chat',
      wsUrl: '/api/chat/ws',
      defaultModel: 'gpt-4o-mini',
      maxRetries: 3,
      timeout: 30000,
      ...config
    };
  }

  /**
   * Initialize WebSocket connection
   */
  async initializeWebSocket(options: { userId?: string; sessionId?: string } = {}): Promise<void> {
    if (!this.wsClient) {
      this.wsClient = new AIWebSocketClient(this.config.wsUrl, options);
      await this.wsClient.connect();
    }
  }

  /**
   * Execute a slash command
   */
  async executeSlashCommand(
    command: string,
    context: SlashCommandContext,
    options: AIGenerationOptions = {}
  ): Promise<SlashCommandResult> {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized');
    }

    return this.wsClient.executeCommand(command, context, {
      onStream: options.onStream,
      onProgress: options.onProgress,
    });
  }

  /**
   * Generate text using AI
   */
  async generateText(
    prompt: string,
    context: SlashCommandContext,
    options: AIGenerationOptions = {}
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt('generation', context, options);
    
    if (this.wsClient && options.stream) {
      // Use WebSocket for streaming
      let fullResponse = '';
      
      const response = await this.wsClient.sendChatMessage(
        prompt,
        context,
        {
          onStream: (chunk) => {
            fullResponse += chunk.content;
            options.onStream?.(chunk);
          },
          model: options.model || this.config.defaultModel,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
        }
      );

      return fullResponse || response.content;
    } else {
      // Use HTTP API for non-streaming
      const response = await this.makeAPIRequest({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: options.model || this.config.defaultModel,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        stream: false,
        workflowContext: context.workflowId ? { workflowId: context.workflowId } : undefined,
        documentContext: context.documentId ? { documentId: context.documentId } : undefined,
      });

      return response.message.content;
    }
  }

  /**
   * Rewrite text
   */
  async rewriteText(
    text: string,
    context: SlashCommandContext,
    options: {
      style?: string;
      tone?: string;
      length?: 'shorter' | 'longer' | 'same';
    } = {}
  ): Promise<string> {
    const prompt = this.buildRewritePrompt(text, options);
    return this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('rewrite', context),
      temperature: 0.3,
      maxTokens: Math.max(text.length * 2, 500),
    });
  }

  /**
   * Expand text
   */
  async expandText(
    text: string,
    context: SlashCommandContext,
    options: {
      type?: 'detail' | 'examples' | 'context' | 'explanation';
      length?: 'short' | 'medium' | 'long';
    } = {}
  ): Promise<string> {
    const prompt = this.buildExpandPrompt(text, options);
    return this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('expansion', context),
      temperature: 0.5,
      maxTokens: this.calculateExpandedLength(text.length, options.length || 'medium'),
    });
  }

  /**
   * Improve text clarity and readability
   */
  async improveText(
    text: string,
    context: SlashCommandContext,
    options: {
      aspect?: 'clarity' | 'readability' | 'conciseness' | 'flow' | 'engagement';
    } = {}
  ): Promise<AIOptimizationResult> {
    const prompt = this.buildImprovementPrompt(text, options);
    const response = await this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('improvement', context),
      temperature: 0.2,
      maxTokens: Math.max(text.length * 1.5, 500),
    });

    return this.parseOptimizationResult(response, text);
  }

  /**
   * Check and fix grammar
   */
  async checkGrammar(
    text: string,
    context: SlashCommandContext,
    options: {
      autoFix?: boolean;
      language?: string;
    } = {}
  ): Promise<AIOptimizationResult> {
    const prompt = this.buildGrammarPrompt(text, options);
    const response = await this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('grammar', context),
      temperature: 0.1,
      maxTokens: Math.max(text.length * 1.2, 500),
    });

    return this.parseOptimizationResult(response, text);
  }

  /**
   * Summarize text
   */
  async summarizeText(
    text: string,
    context: SlashCommandContext,
    options: {
      length?: 'brief' | 'standard' | 'detailed';
      type?: 'key_points' | 'abstract' | 'bullet_points';
    } = {}
  ): Promise<string> {
    const prompt = this.buildSummaryPrompt(text, options);
    return this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('summary', context),
      temperature: 0.3,
      maxTokens: this.calculateSummaryLength(text.length, options.length || 'standard'),
    });
  }

  /**
   * Translate text
   */
  async translateText(
    text: string,
    targetLanguage: string,
    context: SlashCommandContext,
    options: {
      sourceLanguage?: string;
      preserveFormatting?: boolean;
    } = {}
  ): Promise<AITranslationResult> {
    const prompt = this.buildTranslationPrompt(text, targetLanguage, options);
    const response = await this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('translation', context),
      temperature: 0.2,
      maxTokens: Math.max(text.length * 1.5, 500),
    });

    return this.parseTranslationResult(response, targetLanguage, options.sourceLanguage);
  }

  /**
   * Analyze text
   */
  async analyzeText(
    text: string,
    context: SlashCommandContext,
    options: {
      types?: ('readability' | 'sentiment' | 'keywords' | 'topics' | 'structure')[];
    } = {}
  ): Promise<AIAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(text, options);
    const response = await this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('analysis', context),
      temperature: 0.1,
      maxTokens: 800,
    });

    return this.parseAnalysisResult(response);
  }

  /**
   * Generate citations
   */
  async generateCitations(
    text: string,
    context: SlashCommandContext,
    options: {
      style?: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';
      searchQuery?: string;
    } = {}
  ): Promise<string> {
    const prompt = this.buildCitationPrompt(text, options);
    return this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('citation', context),
      temperature: 0.2,
      maxTokens: 1000,
    });
  }

  /**
   * Format text
   */
  async formatText(
    text: string,
    context: SlashCommandContext,
    options: {
      style?: 'academic' | 'business' | 'blog' | 'technical';
      element?: 'headers' | 'lists' | 'quotes' | 'tables';
    } = {}
  ): Promise<string> {
    const prompt = this.buildFormattingPrompt(text, options);
    return this.generateText(prompt, context, {
      systemPrompt: this.buildSystemPrompt('formatting', context),
      temperature: 0.1,
      maxTokens: Math.max(text.length * 1.2, 500),
    });
  }

  /**
   * Get text completions
   */
  async getCompletions(
    text: string,
    context: SlashCommandContext,
    options: {
      maxSuggestions?: number;
      onStream?: (chunk: AIStreamChunk) => void;
    } = {}
  ): Promise<string[]> {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized');
    }

    return this.wsClient.getCompletion(text, context, options);
  }

  /**
   * Make HTTP API request
   */
  private async makeAPIRequest(payload: any): Promise<any> {
    const cacheKey = JSON.stringify(payload);
    
    // Check cache first
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Cache successful response
        this.requestCache.set(cacheKey, result);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' || (error as any).status === 401) {
          break;
        }
        
        // Exponential backoff
        if (attempt < this.config.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Build system prompt for different AI tasks
   */
  private buildSystemPrompt(
    task: string,
    context: SlashCommandContext,
    options: AIGenerationOptions = {}
  ): string {
    const basePrompt = `You are an advanced AI writing assistant integrated into ChUseA, a comprehensive writing and workflow platform. Your role is to help users improve their writing through various AI-powered features.

Context information:
- Current document: ${context.documentId || 'unknown'}
- Workflow: ${context.workflowId || 'none'}
- User selection: ${context.selectedText ? `"${context.selectedText.substring(0, 100)}..."` : 'none'}
- Full text length: ${context.fullText.length} characters

Always provide helpful, accurate, and contextually appropriate responses. Focus on improving the user's writing while maintaining their voice and intent.`;

    const taskPrompts = {
      generation: `${basePrompt}\n\nTask: Generate new content based on the user's prompt. Consider the context and maintain consistency with the existing text.`,
      
      rewrite: `${basePrompt}\n\nTask: Rewrite the provided text to improve clarity, style, or tone while preserving the original meaning. Focus on making the text more engaging and effective.`,
      
      expansion: `${basePrompt}\n\nTask: Expand the provided text with additional detail, examples, or context. Maintain the original structure and flow while adding valuable information.`,
      
      improvement: `${basePrompt}\n\nTask: Improve the text's clarity, readability, and overall quality. Identify areas for enhancement and provide specific suggestions.`,
      
      grammar: `${basePrompt}\n\nTask: Check for and correct grammar, spelling, and punctuation errors. Provide explanations for corrections when helpful.`,
      
      summary: `${basePrompt}\n\nTask: Create a concise summary of the provided text. Capture the key points and main ideas while maintaining accuracy.`,
      
      translation: `${basePrompt}\n\nTask: Translate the text accurately while preserving meaning, tone, and formatting. Consider cultural context and nuances.`,
      
      analysis: `${basePrompt}\n\nTask: Analyze the text for various aspects such as readability, sentiment, keywords, and structure. Provide detailed insights.`,
      
      citation: `${basePrompt}\n\nTask: Generate appropriate citations or help find sources for the provided text. Follow the specified citation style accurately.`,
      
      formatting: `${basePrompt}\n\nTask: Format the text according to the specified style guidelines. Ensure proper structure and presentation.`,
    };

    return taskPrompts[task] || basePrompt;
  }

  /**
   * Build prompts for specific tasks
   */
  private buildRewritePrompt(text: string, options: { style?: string; tone?: string; length?: string }): string {
    let prompt = `Please rewrite the following text:\n\n"${text}"\n\n`;
    
    if (options.style) {
      prompt += `Style: ${options.style}\n`;
    }
    
    if (options.tone) {
      prompt += `Tone: ${options.tone}\n`;
    }
    
    if (options.length) {
      prompt += `Length: Make it ${options.length}\n`;
    }
    
    prompt += '\nProvide only the rewritten text without additional commentary.';
    
    return prompt;
  }

  private buildExpandPrompt(text: string, options: { type?: string; length?: string }): string {
    let prompt = `Please expand the following text:\n\n"${text}"\n\n`;
    
    if (options.type) {
      prompt += `Expansion type: ${options.type}\n`;
    }
    
    if (options.length) {
      prompt += `Target length: ${options.length}\n`;
    }
    
    prompt += '\nProvide the expanded text that builds upon the original content.';
    
    return prompt;
  }

  private buildImprovementPrompt(text: string, options: { aspect?: string }): string {
    let prompt = `Please improve the following text:\n\n"${text}"\n\n`;
    
    if (options.aspect) {
      prompt += `Focus on: ${options.aspect}\n`;
    }
    
    prompt += '\nProvide the improved text along with a brief explanation of the changes made.';
    
    return prompt;
  }

  private buildGrammarPrompt(text: string, options: { autoFix?: boolean; language?: string }): string {
    let prompt = `Please check the grammar of the following text:\n\n"${text}"\n\n`;
    
    if (options.language) {
      prompt += `Language: ${options.language}\n`;
    }
    
    if (options.autoFix) {
      prompt += 'Please automatically fix any errors found and provide the corrected text.\n';
    } else {
      prompt += 'Please identify errors and provide suggestions for correction.\n';
    }
    
    return prompt;
  }

  private buildSummaryPrompt(text: string, options: { length?: string; type?: string }): string {
    let prompt = `Please summarize the following text:\n\n"${text}"\n\n`;
    
    if (options.length) {
      prompt += `Length: ${options.length}\n`;
    }
    
    if (options.type) {
      prompt += `Format: ${options.type}\n`;
    }
    
    prompt += '\nProvide a clear and concise summary that captures the main points.';
    
    return prompt;
  }

  private buildTranslationPrompt(text: string, targetLanguage: string, options: { sourceLanguage?: string; preserveFormatting?: boolean }): string {
    let prompt = `Please translate the following text to ${targetLanguage}:\n\n"${text}"\n\n`;
    
    if (options.sourceLanguage) {
      prompt += `Source language: ${options.sourceLanguage}\n`;
    }
    
    if (options.preserveFormatting) {
      prompt += 'Please preserve the original formatting and structure.\n';
    }
    
    prompt += '\nProvide an accurate translation that maintains the original meaning and tone.';
    
    return prompt;
  }

  private buildAnalysisPrompt(text: string, options: { types?: string[] }): string {
    let prompt = `Please analyze the following text:\n\n"${text}"\n\n`;
    
    if (options.types && options.types.length > 0) {
      prompt += `Analysis types: ${options.types.join(', ')}\n`;
    }
    
    prompt += '\nProvide a comprehensive analysis including relevant metrics and insights.';
    
    return prompt;
  }

  private buildCitationPrompt(text: string, options: { style?: string; searchQuery?: string }): string {
    let prompt = `Please generate citations for the following text:\n\n"${text}"\n\n`;
    
    if (options.style) {
      prompt += `Citation style: ${options.style}\n`;
    }
    
    if (options.searchQuery) {
      prompt += `Search query: ${options.searchQuery}\n`;
    }
    
    prompt += '\nProvide appropriate citations and/or help find relevant sources.';
    
    return prompt;
  }

  private buildFormattingPrompt(text: string, options: { style?: string; element?: string }): string {
    let prompt = `Please format the following text:\n\n"${text}"\n\n`;
    
    if (options.style) {
      prompt += `Style: ${options.style}\n`;
    }
    
    if (options.element) {
      prompt += `Focus on: ${options.element}\n`;
    }
    
    prompt += '\nProvide the properly formatted text according to the specified guidelines.';
    
    return prompt;
  }

  /**
   * Parse optimization result
   */
  private parseOptimizationResult(response: string, originalText: string): AIOptimizationResult {
    // This is a simplified parser - in a real implementation, you'd want more sophisticated parsing
    return {
      optimizedText: response,
      changes: [],
      improvementScore: 0.8
    };
  }

  /**
   * Parse translation result
   */
  private parseTranslationResult(response: string, targetLanguage: string, sourceLanguage?: string): AITranslationResult {
    return {
      translatedText: response,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      confidence: 0.9
    };
  }

  /**
   * Parse analysis result
   */
  private parseAnalysisResult(response: string): AIAnalysisResult {
    // This is a simplified parser - in a real implementation, you'd want more sophisticated parsing
    return {
      summary: response,
      keywords: [],
      sentiment: { score: 0.5, label: 'neutral' },
      readability: { score: 0.7, level: 'college' },
      structure: { headings: [], paragraphs: 0, sentences: 0, words: 0 }
    };
  }


  /**
   * Calculate expanded text length based on original text length and target length
   */
  private calculateExpandedLength(originalLength: number, targetLength: 'short' | 'medium' | 'long'): number {
    const baseTokens = Math.ceil(originalLength / 4); // Approximate token count
    const multipliers = {
      short: 1.5,
      medium: 2.0,
      long: 3.0
    };
    return Math.min(baseTokens * multipliers[targetLength], 2000);
  }

  /**
   * Calculate summary length based on original text length and target length
   */
  private calculateSummaryLength(originalLength: number, targetLength: 'brief' | 'standard' | 'detailed'): number {
    const baseTokens = Math.ceil(originalLength / 4); // Approximate token count
    const multipliers = {
      brief: 0.2,
      standard: 0.3,
      detailed: 0.5
    };
    return Math.min(baseTokens * multipliers[targetLength], 1000);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Destroy the service
   */
  destroy(): void {
    this.wsClient?.destroy();
    this.requestCache.clear();
  }
}

// Create singleton instance
export const aiService = new AIService();

// Export factory function
export const createAIService = (config: Partial<AIServiceConfig> = {}): AIService => {
  return new AIService(config);
};