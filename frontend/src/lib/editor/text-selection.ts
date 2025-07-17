/**
 * Text Selection System
 * 
 * Handles smart text selection detection, context analysis, and state management
 * for the TipTap editor with AI-powered features.
 */

import { Editor } from '@tiptap/react';
import { Selection } from '@tiptap/pm/state';

export interface TextSelectionInfo {
  /** The selected text content */
  text: string;
  /** Start position of selection */
  from: number;
  /** End position of selection */
  to: number;
  /** Whether the selection is empty */
  empty: boolean;
  /** The selected node type */
  nodeType?: string;
  /** Context around the selection */
  context: {
    /** Text before the selection */
    before: string;
    /** Text after the selection */
    after: string;
    /** Full paragraph/block content */
    fullBlock: string;
    /** Document section containing the selection */
    section: string;
  };
  /** Selection metadata */
  metadata: {
    /** Word count in selection */
    wordCount: number;
    /** Character count in selection */
    charCount: number;
    /** Line count in selection */
    lineCount: number;
    /** Language detected (if any) */
    language?: string;
    /** Content type (paragraph, heading, list, etc.) */
    contentType: string;
    /** Formatting applied */
    formatting: string[];
  };
  /** Selection position info */
  position: {
    /** Bounding rectangle */
    rect: DOMRect | null;
    /** Relative position in document */
    relativePosition: number;
    /** Current viewport position */
    viewportPosition: { x: number; y: number };
  };
}

export interface SelectionHistory {
  /** Previous selections */
  history: TextSelectionInfo[];
  /** Current selection index */
  currentIndex: number;
  /** Maximum history length */
  maxLength: number;
}

export interface SelectionContextAnalysis {
  /** Intent analysis */
  intent: {
    /** Likely user action (format, replace, extend, etc.) */
    action: string;
    /** Confidence score */
    confidence: number;
    /** Suggested actions */
    suggestions: string[];
  };
  /** Content analysis */
  content: {
    /** Text quality score */
    quality: number;
    /** Readability score */
    readability: number;
    /** Sentiment analysis */
    sentiment: 'positive' | 'negative' | 'neutral';
    /** Key topics/themes */
    topics: string[];
    /** Language style */
    style: string;
  };
  /** Structural analysis */
  structure: {
    /** Position in document */
    position: 'beginning' | 'middle' | 'end';
    /** Relation to other elements */
    relations: string[];
    /** Hierarchical level */
    level: number;
  };
}

export class TextSelectionManager {
  private editor: Editor;
  private history: SelectionHistory;
  private currentSelection: TextSelectionInfo | null = null;
  private selectionListeners: ((selection: TextSelectionInfo | null) => void)[] = [];
  private contextAnalysisCache = new Map<string, SelectionContextAnalysis>();

  constructor(editor: Editor, maxHistoryLength: number = 10) {
    this.editor = editor;
    this.history = {
      history: [],
      currentIndex: -1,
      maxLength: maxHistoryLength,
    };

    this.setupSelectionListeners();
  }

  /**
   * Set up editor selection listeners
   */
  private setupSelectionListeners(): void {
    this.editor.on('selectionUpdate', ({ editor: updatedEditor }) => {
      this.handleSelectionUpdate(updatedEditor);
    });

    this.editor.on('update', ({ editor: updatedEditor }) => {
      // Update selection after content changes
      this.handleSelectionUpdate(updatedEditor);
    });
  }

  /**
   * Handle selection updates from the editor
   */
  private handleSelectionUpdate(updatedEditor: Editor): void {
    const selection = this.getSelectionInfo();
    
    if (!selection || selection.empty) {
      this.currentSelection = null;
      this.notifySelectionListeners(null);
      return;
    }

    // Only update if selection has changed
    if (!this.currentSelection || !this.isSelectionEqual(selection, this.currentSelection)) {
      this.currentSelection = selection;
      this.addToHistory(selection);
      this.notifySelectionListeners(selection);
    }
  }

  /**
   * Get current selection information
   */
  getSelectionInfo(): TextSelectionInfo | null {
    const { state } = this.editor;
    const { selection } = state;

    if (selection.empty) {
      return null;
    }

    const { from, to } = selection;
    const text = state.doc.textBetween(from, to);
    const nodeType = this.getNodeTypeAtSelection(selection);
    const context = this.getSelectionContext(state, from, to);
    const metadata = this.getSelectionMetadata(text, nodeType);
    const position = this.getSelectionPosition(selection);

    return {
      text,
      from,
      to,
      empty: selection.empty,
      nodeType,
      context,
      metadata,
      position,
    };
  }

  /**
   * Get the node type at current selection
   */
  private getNodeTypeAtSelection(selection: Selection): string {
    const { $from } = selection;
    const node = $from.parent;
    return node.type.name;
  }

  /**
   * Get context around the selection
   */
  private getSelectionContext(state: any, from: number, to: number): TextSelectionInfo['context'] {
    const { doc } = state;
    const contextRange = 100; // Characters of context

    // Get surrounding context
    const beforeStart = Math.max(0, from - contextRange);
    const afterEnd = Math.min(doc.content.size, to + contextRange);

    const before = doc.textBetween(beforeStart, from);
    const after = doc.textBetween(to, afterEnd);

    // Get full block content
    const $from = doc.resolve(from);
    const $to = doc.resolve(to);
    const blockStart = $from.start($from.depth);
    const blockEnd = $to.end($to.depth);
    const fullBlock = doc.textBetween(blockStart, blockEnd);

    // Get section content (larger context)
    const sectionStart = Math.max(0, from - 500);
    const sectionEnd = Math.min(doc.content.size, to + 500);
    const section = doc.textBetween(sectionStart, sectionEnd);

    return {
      before,
      after,
      fullBlock,
      section,
    };
  }

  /**
   * Get selection metadata
   */
  private getSelectionMetadata(text: string, nodeType: string): TextSelectionInfo['metadata'] {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const lines = text.split('\n');
    const formatting = this.getFormattingAtSelection();

    return {
      wordCount: words.length,
      charCount: text.length,
      lineCount: lines.length,
      language: this.detectLanguage(text),
      contentType: nodeType,
      formatting,
    };
  }

  /**
   * Get formatting applied to selection
   */
  private getFormattingAtSelection(): string[] {
    const formatting: string[] = [];
    const editor = this.editor;

    if (editor.isActive('bold')) formatting.push('bold');
    if (editor.isActive('italic')) formatting.push('italic');
    if (editor.isActive('underline')) formatting.push('underline');
    if (editor.isActive('strike')) formatting.push('strike');
    if (editor.isActive('code')) formatting.push('code');
    if (editor.isActive('highlight')) formatting.push('highlight');

    return formatting;
  }

  /**
   * Detect language of text (basic implementation)
   */
  private detectLanguage(text: string): string | undefined {
    // Simple language detection based on patterns
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /import\s+.*from/,
      /class\s+\w+/,
      /<\w+.*>/,
    ];

    if (codePatterns.some(pattern => pattern.test(text))) {
      return 'code';
    }

    return undefined;
  }

  /**
   * Get selection position information
   */
  private getSelectionPosition(selection: Selection): TextSelectionInfo['position'] {
    const { view } = this.editor;
    const { from, to } = selection;

    // Get DOM coordinates
    const startCoords = view.coordsAtPos(from);
    const endCoords = view.coordsAtPos(to);

    const rect = startCoords && endCoords ? new DOMRect(
      startCoords.left,
      startCoords.top,
      endCoords.right - startCoords.left,
      endCoords.bottom - startCoords.top
    ) : null;

    // Calculate relative position in document
    const docSize = view.state.doc.content.size;
    const relativePosition = from / docSize;

    // Get viewport position
    const viewportPosition = rect ? {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    } : { x: 0, y: 0 };

    return {
      rect,
      relativePosition,
      viewportPosition,
    };
  }

  /**
   * Add selection to history
   */
  private addToHistory(selection: TextSelectionInfo): void {
    const { history } = this.history;
    
    // Remove entries after current index if we're not at the end
    if (this.history.currentIndex < history.length - 1) {
      history.splice(this.history.currentIndex + 1);
    }

    // Add new selection
    history.push(selection);
    
    // Maintain max length
    if (history.length > this.history.maxLength) {
      history.shift();
    } else {
      this.history.currentIndex++;
    }
  }

  /**
   * Check if two selections are equal
   */
  private isSelectionEqual(a: TextSelectionInfo, b: TextSelectionInfo): boolean {
    return a.from === b.from && a.to === b.to && a.text === b.text;
  }

  /**
   * Notify selection listeners
   */
  private notifySelectionListeners(selection: TextSelectionInfo | null): void {
    this.selectionListeners.forEach(listener => listener(selection));
  }

  /**
   * Subscribe to selection changes
   */
  onSelectionChange(listener: (selection: TextSelectionInfo | null) => void): () => void {
    this.selectionListeners.push(listener);
    
    return () => {
      const index = this.selectionListeners.indexOf(listener);
      if (index > -1) {
        this.selectionListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current selection
   */
  getCurrentSelection(): TextSelectionInfo | null {
    return this.currentSelection;
  }

  /**
   * Get selection history
   */
  getSelectionHistory(): SelectionHistory {
    return { ...this.history };
  }

  /**
   * Go to previous selection in history
   */
  goToPreviousSelection(): boolean {
    if (this.history.currentIndex > 0) {
      this.history.currentIndex--;
      const selection = this.history.history[this.history.currentIndex];
      this.selectRange(selection.from, selection.to);
      return true;
    }
    return false;
  }

  /**
   * Go to next selection in history
   */
  goToNextSelection(): boolean {
    if (this.history.currentIndex < this.history.history.length - 1) {
      this.history.currentIndex++;
      const selection = this.history.history[this.history.currentIndex];
      this.selectRange(selection.from, selection.to);
      return true;
    }
    return false;
  }

  /**
   * Select a specific range
   */
  selectRange(from: number, to: number): void {
    this.editor.commands.setTextSelection({ from, to });
  }

  /**
   * Extend current selection
   */
  extendSelection(direction: 'left' | 'right' | 'up' | 'down', amount: number = 1): void {
    const selection = this.getCurrentSelection();
    if (!selection) return;

    let newFrom = selection.from;
    let newTo = selection.to;

    switch (direction) {
      case 'left':
        newFrom = Math.max(0, newFrom - amount);
        break;
      case 'right':
        newTo = Math.min(this.editor.state.doc.content.size, newTo + amount);
        break;
      case 'up':
        // Move to previous line
        const prevLine = this.findPreviousLine(newFrom);
        if (prevLine !== null) newFrom = prevLine;
        break;
      case 'down':
        // Move to next line
        const nextLine = this.findNextLine(newTo);
        if (nextLine !== null) newTo = nextLine;
        break;
    }

    this.selectRange(newFrom, newTo);
  }

  /**
   * Find previous line position
   */
  private findPreviousLine(pos: number): number | null {
    const { state } = this.editor;
    const { doc } = state;
    const $pos = doc.resolve(pos);
    
    if ($pos.nodeBefore) {
      return $pos.nodeBefore.nodeSize;
    }
    
    return null;
  }

  /**
   * Find next line position
   */
  private findNextLine(pos: number): number | null {
    const { state } = this.editor;
    const { doc } = state;
    const $pos = doc.resolve(pos);
    
    if ($pos.nodeAfter) {
      return pos + $pos.nodeAfter.nodeSize;
    }
    
    return null;
  }

  /**
   * Select word at position
   */
  selectWordAt(pos: number): void {
    const { state } = this.editor;
    const { doc } = state;
    const $pos = doc.resolve(pos);
    
    // Find word boundaries
    let start = pos;
    let end = pos;
    
    const text = $pos.parent.textContent;
    const localPos = pos - $pos.start();
    
    // Find start of word
    while (start > $pos.start() && /\w/.test(text[localPos - (pos - start) - 1])) {
      start--;
    }
    
    // Find end of word
    while (end < $pos.end() && /\w/.test(text[localPos + (end - pos)])) {
      end++;
    }
    
    this.selectRange(start, end);
  }

  /**
   * Select sentence at position
   */
  selectSentenceAt(pos: number): void {
    const { state } = this.editor;
    const { doc } = state;
    const $pos = doc.resolve(pos);
    
    const text = $pos.parent.textContent;
    const localPos = pos - $pos.start();
    
    // Find sentence boundaries (simple implementation)
    let start = $pos.start();
    let end = $pos.end();
    
    // Find start of sentence
    for (let i = localPos; i >= 0; i--) {
      if (/[.!?]/.test(text[i])) {
        start = $pos.start() + i + 1;
        break;
      }
    }
    
    // Find end of sentence
    for (let i = localPos; i < text.length; i++) {
      if (/[.!?]/.test(text[i])) {
        end = $pos.start() + i + 1;
        break;
      }
    }
    
    this.selectRange(start, end);
  }

  /**
   * Select paragraph at position
   */
  selectParagraphAt(pos: number): void {
    const { state } = this.editor;
    const { doc } = state;
    const $pos = doc.resolve(pos);
    
    const start = $pos.start();
    const end = $pos.end();
    
    this.selectRange(start, end);
  }

  /**
   * Analyze selection context for AI actions
   */
  analyzeSelectionContext(selection: TextSelectionInfo): SelectionContextAnalysis {
    const cacheKey = `${selection.from}-${selection.to}-${selection.text}`;
    
    if (this.contextAnalysisCache.has(cacheKey)) {
      return this.contextAnalysisCache.get(cacheKey)!;
    }

    const analysis = this.performContextAnalysis(selection);
    this.contextAnalysisCache.set(cacheKey, analysis);
    
    return analysis;
  }

  /**
   * Perform context analysis
   */
  private performContextAnalysis(selection: TextSelectionInfo): SelectionContextAnalysis {
    const intent = this.analyzeIntent(selection.text);
    const content = this.analyzeContent(selection.text, selection.metadata);
    const structure = this.analyzeStructure(selection);

    return {
      intent,
      content,
      structure,
    };
  }

  /**
   * Analyze user intent based on selection
   */
  private analyzeIntent(text: string): SelectionContextAnalysis['intent'] {
    const suggestions: string[] = [];
    let action = 'unknown';
    let confidence = 0.5;

    // Check for common patterns
    if (text.length < 10) {
      suggestions.push('format', 'replace', 'expand');
      action = 'format';
      confidence = 0.7;
    } else if (text.length > 100) {
      suggestions.push('summarize', 'rewrite', 'split');
      action = 'summarize';
      confidence = 0.8;
    } else {
      suggestions.push('improve', 'rephrase', 'format');
      action = 'improve';
      confidence = 0.6;
    }

    // Check for specific content types
    if (this.isCodeLike(text)) {
      suggestions.push('format-code', 'explain-code', 'optimize-code');
      action = 'format-code';
      confidence = 0.9;
    } else if (this.isListLike(text)) {
      suggestions.push('format-list', 'sort-list', 'expand-list');
      action = 'format-list';
      confidence = 0.8;
    }

    return {
      action,
      confidence,
      suggestions,
    };
  }

  /**
   * Analyze content characteristics
   */
  private analyzeContent(text: string, metadata: TextSelectionInfo['metadata']): SelectionContextAnalysis['content'] {
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Quality score based on various factors
    let quality = 0.5;
    if (words.length > 5) quality += 0.2;
    if (sentences.length > 1) quality += 0.1;
    if (metadata.formatting.length > 0) quality += 0.1;
    
    // Readability score (simplified)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const readability = Math.max(0, Math.min(1, 1 - (avgWordsPerSentence - 15) / 20));
    
    // Basic sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst'];
    
    const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Extract key topics (simplified)
    const topics = this.extractTopics(text);
    
    // Determine style
    const style = this.determineStyle(text, metadata);
    
    return {
      quality,
      readability,
      sentiment,
      topics,
      style,
    };
  }

  /**
   * Analyze structural characteristics
   */
  private analyzeStructure(selection: TextSelectionInfo): SelectionContextAnalysis['structure'] {
    const { position: selectionPosition, metadata } = selection;
    
    // Determine position in document
    let position: 'beginning' | 'middle' | 'end' = 'middle';
    if (selectionPosition.relativePosition < 0.1) position = 'beginning';
    else if (selectionPosition.relativePosition > 0.9) position = 'end';
    
    // Analyze relations (simplified)
    const relations: string[] = [];
    if (metadata.contentType === 'heading') {
      relations.push('section-header');
    } else if (metadata.contentType === 'paragraph') {
      relations.push('body-text');
    } else if (metadata.contentType === 'listItem') {
      relations.push('list-item');
    }
    
    // Determine hierarchical level
    const level = this.getHierarchicalLevel(metadata.contentType);
    
    return {
      position,
      relations,
      level,
    };
  }

  /**
   * Check if text looks like code
   */
  private isCodeLike(text: string): boolean {
    const codePatterns = [
      /function\s+\w+/,
      /const\s+\w+\s*=/,
      /import\s+.*from/,
      /class\s+\w+/,
      /<\w+.*>/,
      /\{\s*\w+.*\}/,
    ];
    
    return codePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check if text looks like a list
   */
  private isListLike(text: string): boolean {
    const lines = text.split('\n');
    const listPatterns = [
      /^\s*[-*+]\s+/,
      /^\s*\d+\.\s+/,
      /^\s*[a-zA-Z]\.\s+/,
    ];
    
    return lines.some(line => listPatterns.some(pattern => pattern.test(line)));
  }

  /**
   * Extract topics from text (simplified)
   */
  private extractTopics(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    
    const significantWords = words.filter(word => 
      word.length > 3 && 
      !commonWords.includes(word) &&
      /^[a-zA-Z]+$/.test(word)
    );
    
    // Count word frequency
    const wordCounts = significantWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Return top 5 most frequent words as topics
    return Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Determine text style
   */
  private determineStyle(text: string, metadata: TextSelectionInfo['metadata']): string {
    if (metadata.formatting.includes('code')) return 'code';
    if (metadata.contentType === 'heading') return 'heading';
    if (this.isCodeLike(text)) return 'technical';
    if (this.isFormalText(text)) return 'formal';
    if (this.isCasualText(text)) return 'casual';
    return 'standard';
  }

  /**
   * Check if text is formal
   */
  private isFormalText(text: string): boolean {
    const formalWords = ['therefore', 'furthermore', 'consequently', 'however', 'moreover', 'nevertheless'];
    return formalWords.some(word => text.toLowerCase().includes(word));
  }

  /**
   * Check if text is casual
   */
  private isCasualText(text: string): boolean {
    const casualWords = ['gonna', 'wanna', 'yeah', 'okay', 'cool', 'awesome'];
    return casualWords.some(word => text.toLowerCase().includes(word));
  }

  /**
   * Get hierarchical level
   */
  private getHierarchicalLevel(contentType: string): number {
    switch (contentType) {
      case 'heading': return 1;
      case 'paragraph': return 2;
      case 'listItem': return 3;
      default: return 2;
    }
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.editor.commands.setTextSelection(this.editor.state.selection.from);
  }

  /**
   * Destroy the selection manager
   */
  destroy(): void {
    this.selectionListeners.length = 0;
    this.contextAnalysisCache.clear();
  }
}

export default TextSelectionManager;