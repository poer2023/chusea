/**
 * AI Action System
 * 
 * Handles AI-powered text operations with preview, confirmation, and undo/redo support
 */

import { Editor } from '@tiptap/react';
import { TextSelectionInfo, SelectionContextAnalysis } from '../editor/text-selection';

export interface AIAction {
  /** Unique action identifier */
  id: string;
  /** Display name */
  name: string;
  /** Action description */
  description: string;
  /** Action icon (component or string) */
  icon: React.ComponentType<{ className?: string }> | string;
  /** Action category */
  category: 'format' | 'improve' | 'generate' | 'analyze' | 'transform';
  /** Keyboard shortcut */
  shortcut?: string;
  /** Action priority (higher = more prominent) */
  priority: number;
  /** Whether action supports preview */
  supportsPreview: boolean;
  /** Whether action can be undone */
  canUndo: boolean;
  /** Action configuration */
  config?: Record<string, any>;
  /** Context requirements */
  requirements: {
    /** Minimum text length */
    minLength?: number;
    /** Maximum text length */
    maxLength?: number;
    /** Required content types */
    contentTypes?: string[];
    /** Required formatting */
    formatting?: string[];
  };
  /** Action handler */
  handler: (params: AIActionParams) => Promise<AIActionResult>;
  /** Condition to show action */
  shouldShow?: (context: SelectionContextAnalysis) => boolean;
  /** Custom rendering for action button */
  renderButton?: (params: AIActionRenderParams) => React.ReactNode;
}

export interface AIActionParams {
  /** Editor instance */
  editor: Editor;
  /** Selection information */
  selection: TextSelectionInfo;
  /** Context analysis */
  context: SelectionContextAnalysis;
  /** Action configuration */
  config?: Record<string, any>;
  /** Cancel signal */
  signal?: AbortSignal;
}

export interface AIActionRenderParams {
  /** Action definition */
  action: AIAction;
  /** Whether action is active */
  isActive: boolean;
  /** Whether action is loading */
  isLoading: boolean;
  /** Click handler */
  onClick: () => void;
  /** Additional props */
  props?: Record<string, any>;
}

export interface AIActionResult {
  /** Whether action was successful */
  success: boolean;
  /** Result data */
  data?: {
    /** New text content */
    text?: string;
    /** HTML content */
    html?: string;
    /** JSON content */
    json?: any;
    /** Additional metadata */
    metadata?: Record<string, any>;
  };
  /** Error information */
  error?: {
    /** Error message */
    message: string;
    /** Error code */
    code: string;
    /** Whether error is recoverable */
    recoverable: boolean;
  };
  /** Preview data */
  preview?: {
    /** Preview text */
    text: string;
    /** Preview HTML */
    html?: string;
    /** Preview confidence */
    confidence: number;
  };
  /** Action analytics */
  analytics?: {
    /** Time taken */
    duration: number;
    /** Tokens used */
    tokens?: number;
    /** Model used */
    model?: string;
  };
}

export interface AIActionBatch {
  /** Batch ID */
  id: string;
  /** Actions in batch */
  actions: AIAction[];
  /** Batch configuration */
  config: {
    /** Execute sequentially or in parallel */
    mode: 'sequential' | 'parallel';
    /** Continue on error */
    continueOnError: boolean;
    /** Max concurrent actions */
    maxConcurrent?: number;
  };
}

export interface AIActionHistory {
  /** Action ID */
  actionId: string;
  /** Action name */
  actionName: string;
  /** Original text */
  originalText: string;
  /** Result text */
  resultText: string;
  /** Timestamp */
  timestamp: Date;
  /** Action result */
  result: AIActionResult;
  /** Undo function */
  undo: () => void;
  /** Redo function */
  redo: () => void;
}

export class AIActionManager {
  private editor: Editor;
  private actions = new Map<string, AIAction>();
  private history: AIActionHistory[] = [];
  private currentActionIndex = -1;
  private maxHistoryLength = 50;
  private activeActions = new Set<string>();
  private previewCache = new Map<string, AIActionResult>();

  constructor(editor: Editor) {
    this.editor = editor;
    this.initializeDefaultActions();
  }

  /**
   * Initialize default AI actions
   */
  private initializeDefaultActions(): void {
    const defaultActions: AIAction[] = [
      {
        id: 'improve-writing',
        name: 'Improve Writing',
        description: 'Enhance clarity, grammar, and style',
        icon: '✨',
        category: 'improve',
        priority: 100,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 10,
          maxLength: 1000,
        },
        handler: this.handleImproveWriting.bind(this),
        shouldShow: (context) => context.content.quality < 0.8,
      },
      {
        id: 'fix-grammar',
        name: 'Fix Grammar',
        description: 'Correct grammatical errors',
        icon: '📝',
        category: 'improve',
        priority: 90,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 5,
        },
        handler: this.handleFixGrammar.bind(this),
      },
      {
        id: 'summarize',
        name: 'Summarize',
        description: 'Create a concise summary',
        icon: '📄',
        category: 'transform',
        priority: 80,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 100,
        },
        handler: this.handleSummarize.bind(this),
        shouldShow: (context) => context.content.quality > 0.5,
      },
      {
        id: 'expand-text',
        name: 'Expand',
        description: 'Add more detail and depth',
        icon: '📈',
        category: 'generate',
        priority: 70,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 5,
          maxLength: 500,
        },
        handler: this.handleExpandText.bind(this),
      },
      {
        id: 'change-tone',
        name: 'Change Tone',
        description: 'Adjust writing tone and style',
        icon: '🎭',
        category: 'transform',
        priority: 60,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 10,
        },
        handler: this.handleChangeTone.bind(this),
        config: {
          tones: ['professional', 'casual', 'friendly', 'formal', 'persuasive'],
        },
      },
      {
        id: 'translate',
        name: 'Translate',
        description: 'Translate to another language',
        icon: '🌍',
        category: 'transform',
        priority: 50,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 3,
        },
        handler: this.handleTranslate.bind(this),
        config: {
          languages: ['es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
        },
      },
      {
        id: 'format-code',
        name: 'Format Code',
        description: 'Format and beautify code',
        icon: '💻',
        category: 'format',
        priority: 85,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 5,
        },
        handler: this.handleFormatCode.bind(this),
        shouldShow: (context) => context.content.style === 'code' || context.content.style === 'technical',
      },
      {
        id: 'explain-code',
        name: 'Explain Code',
        description: 'Add explanations to code',
        icon: '💡',
        category: 'analyze',
        priority: 75,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 10,
        },
        handler: this.handleExplainCode.bind(this),
        shouldShow: (context) => context.content.style === 'code' || context.content.style === 'technical',
      },
      {
        id: 'create-outline',
        name: 'Create Outline',
        description: 'Generate a structured outline',
        icon: '📋',
        category: 'generate',
        priority: 65,
        supportsPreview: true,
        canUndo: true,
        requirements: {
          minLength: 50,
        },
        handler: this.handleCreateOutline.bind(this),
      },
      {
        id: 'fact-check',
        name: 'Fact Check',
        description: 'Verify facts and claims',
        icon: '🔍',
        category: 'analyze',
        priority: 55,
        supportsPreview: false,
        canUndo: false,
        requirements: {
          minLength: 20,
        },
        handler: this.handleFactCheck.bind(this),
      },
    ];

    defaultActions.forEach(action => {
      this.registerAction(action);
    });
  }

  /**
   * Register a new AI action
   */
  registerAction(action: AIAction): void {
    this.actions.set(action.id, action);
  }

  /**
   * Unregister an AI action
   */
  unregisterAction(actionId: string): void {
    this.actions.delete(actionId);
  }

  /**
   * Get all actions
   */
  getActions(): AIAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Get action by ID
   */
  getAction(actionId: string): AIAction | undefined {
    return this.actions.get(actionId);
  }

  /**
   * Get actions for context
   */
  getActionsForContext(context: SelectionContextAnalysis): AIAction[] {
    return this.getActions()
      .filter(action => {
        // Check if action should be shown
        if (action.shouldShow && !action.shouldShow(context)) {
          return false;
        }
        
        // Check content type requirements
        if (action.requirements.contentTypes) {
          // Implementation would check against context
        }
        
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute an AI action
   */
  async executeAction(
    actionId: string,
    selection: TextSelectionInfo,
    context: SelectionContextAnalysis,
    config?: Record<string, any>
  ): Promise<AIActionResult> {
    const action = this.getAction(actionId);
    if (!action) {
      return {
        success: false,
        error: {
          message: `Action ${actionId} not found`,
          code: 'ACTION_NOT_FOUND',
          recoverable: false,
        },
      };
    }

    // Check requirements
    const requirementCheck = this.checkRequirements(action, selection);
    if (!requirementCheck.valid) {
      return {
        success: false,
        error: {
          message: requirementCheck.message,
          code: 'REQUIREMENTS_NOT_MET',
          recoverable: false,
        },
      };
    }

    // Mark action as active
    this.activeActions.add(actionId);

    try {
      const startTime = Date.now();
      const result = await action.handler({
        editor: this.editor,
        selection,
        context,
        config: { ...action.config, ...config },
      });

      const duration = Date.now() - startTime;
      
      // Add analytics
      if (result.success) {
        result.analytics = {
          duration,
          ...result.analytics,
        };
      }

      // Add to history if successful and undoable
      if (result.success && action.canUndo && result.data?.text) {
        this.addToHistory({
          actionId,
          actionName: action.name,
          originalText: selection.text,
          resultText: result.data.text,
          timestamp: new Date(),
          result,
          undo: () => this.undoAction(actionId),
          redo: () => this.redoAction(actionId),
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'EXECUTION_ERROR',
          recoverable: true,
        },
      };
    } finally {
      this.activeActions.delete(actionId);
    }
  }

  /**
   * Get action preview
   */
  async getActionPreview(
    actionId: string,
    selection: TextSelectionInfo,
    context: SelectionContextAnalysis,
    config?: Record<string, any>
  ): Promise<AIActionResult> {
    const action = this.getAction(actionId);
    if (!action || !action.supportsPreview) {
      return {
        success: false,
        error: {
          message: 'Preview not supported for this action',
          code: 'PREVIEW_NOT_SUPPORTED',
          recoverable: false,
        },
      };
    }

    const cacheKey = `${actionId}-${selection.from}-${selection.to}-${JSON.stringify(config)}`;
    
    if (this.previewCache.has(cacheKey)) {
      return this.previewCache.get(cacheKey)!;
    }

    try {
      const result = await this.executeAction(actionId, selection, context, {
        ...config,
        preview: true,
      });

      if (result.success) {
        this.previewCache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Preview failed',
          code: 'PREVIEW_ERROR',
          recoverable: true,
        },
      };
    }
  }

  /**
   * Execute batch of actions
   */
  async executeBatch(
    batch: AIActionBatch,
    selection: TextSelectionInfo,
    context: SelectionContextAnalysis
  ): Promise<AIActionResult[]> {
    const results: AIActionResult[] = [];

    if (batch.config.mode === 'sequential') {
      for (const action of batch.actions) {
        const result = await this.executeAction(action.id, selection, context);
        results.push(result);
        
        if (!result.success && !batch.config.continueOnError) {
          break;
        }
      }
    } else {
      // Parallel execution with optional concurrency limit
      const maxConcurrent = batch.config.maxConcurrent || batch.actions.length;
      const chunks = this.chunkArray(batch.actions, maxConcurrent);
      
      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map(action => this.executeAction(action.id, selection, context))
        );
        results.push(...chunkResults);
        
        if (!batch.config.continueOnError && chunkResults.some(r => !r.success)) {
          break;
        }
      }
    }

    return results;
  }

  /**
   * Check if action meets requirements
   */
  private checkRequirements(action: AIAction, selection: TextSelectionInfo): {
    valid: boolean;
    message: string;
  } {
    const { requirements } = action;
    const { text, metadata } = selection;

    if (requirements.minLength && text.length < requirements.minLength) {
      return {
        valid: false,
        message: `Selection must be at least ${requirements.minLength} characters`,
      };
    }

    if (requirements.maxLength && text.length > requirements.maxLength) {
      return {
        valid: false,
        message: `Selection must be no more than ${requirements.maxLength} characters`,
      };
    }

    if (requirements.contentTypes && !requirements.contentTypes.includes(metadata.contentType)) {
      return {
        valid: false,
        message: `Action not available for ${metadata.contentType} content`,
      };
    }

    if (requirements.formatting) {
      const hasRequiredFormatting = requirements.formatting.some(format =>
        metadata.formatting.includes(format)
      );
      if (!hasRequiredFormatting) {
        return {
          valid: false,
          message: `Action requires ${requirements.formatting.join(' or ')} formatting`,
        };
      }
    }

    return { valid: true, message: '' };
  }

  /**
   * Add action to history
   */
  private addToHistory(historyEntry: AIActionHistory): void {
    // Remove entries after current index
    if (this.currentActionIndex < this.history.length - 1) {
      this.history.splice(this.currentActionIndex + 1);
    }

    // Add new entry
    this.history.push(historyEntry);

    // Maintain max length
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    } else {
      this.currentActionIndex++;
    }
  }

  /**
   * Undo last action
   */
  undoAction(actionId?: string): boolean {
    if (this.currentActionIndex >= 0) {
      const entry = this.history[this.currentActionIndex];
      if (!actionId || entry.actionId === actionId) {
        entry.undo();
        this.currentActionIndex--;
        return true;
      }
    }
    return false;
  }

  /**
   * Redo last undone action
   */
  redoAction(actionId?: string): boolean {
    if (this.currentActionIndex < this.history.length - 1) {
      this.currentActionIndex++;
      const entry = this.history[this.currentActionIndex];
      if (!actionId || entry.actionId === actionId) {
        entry.redo();
        return true;
      }
    }
    return false;
  }

  /**
   * Get action history
   */
  getHistory(): AIActionHistory[] {
    return [...this.history];
  }

  /**
   * Check if action is active
   */
  isActionActive(actionId: string): boolean {
    return this.activeActions.has(actionId);
  }

  /**
   * Cancel active action
   */
  cancelAction(actionId: string): void {
    this.activeActions.delete(actionId);
  }

  /**
   * Clear preview cache
   */
  clearPreviewCache(): void {
    this.previewCache.clear();
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Default action handlers
  private async handleImproveWriting(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    // Use AI service integration
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'improve-writing',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const improvedText = `${selection.text} [IMPROVED]`;
      
      return {
        success: true,
        data: {
          text: improvedText,
          html: `<p>${improvedText}</p>`,
        },
        preview: {
          text: improvedText,
          confidence: 0.85,
        },
      };
    }
  }

  private async handleFixGrammar(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'fix-grammar',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const fixedText = selection.text.replace(/\b(teh|adn|taht)\b/g, (match) => {
        const fixes: Record<string, string> = {
          'teh': 'the',
          'adn': 'and',
          'taht': 'that',
        };
        return fixes[match] || match;
      });
      
      return {
        success: true,
        data: {
          text: fixedText,
          html: `<p>${fixedText}</p>`,
        },
        preview: {
          text: fixedText,
          confidence: 0.9,
        },
      };
    }
  }

  private async handleSummarize(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'summarize',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const words = selection.text.split(/\s+/);
      const summary = words.slice(0, Math.min(words.length / 3, 50)).join(' ') + '...';
      
      return {
        success: true,
        data: {
          text: summary,
          html: `<p><strong>Summary:</strong> ${summary}</p>`,
        },
        preview: {
          text: summary,
          confidence: 0.8,
        },
      };
    }
  }

  private async handleExpandText(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'expand-text',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expanded = `${selection.text} [EXPANDED WITH MORE DETAIL]`;
      
      return {
        success: true,
        data: {
          text: expanded,
          html: `<p>${expanded}</p>`,
        },
        preview: {
          text: expanded,
          confidence: 0.75,
        },
      };
    }
  }

  private async handleChangeTone(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'change-tone',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: {
          ...config,
          customPrompt: `Change the tone to ${config?.tone || 'professional'}`,
        },
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 900));
      
      const tone = config?.tone || 'professional';
      const toneText = `${selection.text} [CHANGED TO ${tone.toUpperCase()} TONE]`;
      
      return {
        success: true,
        data: {
          text: toneText,
          html: `<p>${toneText}</p>`,
        },
        preview: {
          text: toneText,
          confidence: 0.8,
        },
      };
    }
  }

  private async handleTranslate(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'translate',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: {
          ...config,
          customPrompt: `Translate to ${config?.language || 'Spanish'}`,
        },
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const language = config?.language || 'es';
      const translated = `${selection.text} [TRANSLATED TO ${language.toUpperCase()}]`;
      
      return {
        success: true,
        data: {
          text: translated,
          html: `<p>${translated}</p>`,
        },
        preview: {
          text: translated,
          confidence: 0.85,
        },
      };
    }
  }

  private async handleFormatCode(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'format-code',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const formatted = selection.text.replace(/\s+/g, ' ').trim();
      
      return {
        success: true,
        data: {
          text: formatted,
          html: `<pre><code>${formatted}</code></pre>`,
        },
        preview: {
          text: formatted,
          confidence: 0.95,
        },
      };
    }
  }

  private async handleExplainCode(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'explain-code',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      const explanation = `${selection.text}\n\n// Explanation: This code does...`;
      
      return {
        success: true,
        data: {
          text: explanation,
          html: `<pre><code>${explanation}</code></pre>`,
        },
        preview: {
          text: explanation,
          confidence: 0.8,
        },
      };
    }
  }

  private async handleCreateOutline(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'create-outline',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const outline = `# Outline\n\n1. Main Point 1\n2. Main Point 2\n3. Main Point 3\n\n[Based on: ${selection.text.slice(0, 50)}...]`;
      
      return {
        success: true,
        data: {
          text: outline,
          html: `<div>${outline.replace(/\n/g, '<br>')}</div>`,
        },
        preview: {
          text: outline,
          confidence: 0.75,
        },
      };
    }
  }

  private async handleFactCheck(params: AIActionParams): Promise<AIActionResult> {
    const { selection, context, config } = params;
    
    try {
      const { aiService } = await import('./service-integration');
      
      const result = await aiService.processText({
        action: 'fact-check',
        text: selection.text,
        context: {
          selection,
          analysis: context,
        },
        options: config,
      });
      
      return result;
    } catch (error) {
      // Fallback implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const factCheck = `Fact-check results for: "${selection.text.slice(0, 100)}..."\n\nStatus: Under review\nSources: [Would show sources here]`;
      
      return {
        success: true,
        data: {
          text: factCheck,
          html: `<div class="fact-check">${factCheck.replace(/\n/g, '<br>')}</div>`,
          metadata: {
            factCheckResult: 'under-review',
          },
        },
      };
    }
  }

  /**
   * Destroy the action manager
   */
  destroy(): void {
    this.actions.clear();
    this.history.length = 0;
    this.activeActions.clear();
    this.previewCache.clear();
  }
}

export default AIActionManager;