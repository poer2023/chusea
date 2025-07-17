/**
 * Text Selection Analysis Types
 * 
 * Types for analyzing and working with text selections
 */

export interface TextSelectionInfo {
  text: string;
  start: number;
  end: number;
  length: number;
  context: {
    before: string;
    after: string;
  };
  metadata: {
    lineNumber?: number;
    columnNumber?: number;
    paragraph?: number;
    sentence?: number;
  };
}

export interface SelectionContextAnalysis {
  selectionType: 'word' | 'sentence' | 'paragraph' | 'block' | 'custom';
  language: string;
  textType: 'prose' | 'code' | 'list' | 'heading' | 'quote' | 'mixed';
  readability: {
    score: number;
    level: string;
    suggestions: string[];
  };
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  keywords: string[];
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  structure: {
    sentences: number;
    words: number;
    characters: number;
    paragraphs: number;
  };
  style: {
    tone: string;
    formality: 'formal' | 'informal' | 'neutral';
    complexity: 'simple' | 'moderate' | 'complex';
  };
  quality: {
    grammar: number;
    clarity: number;
    coherence: number;
    engagement: number;
  };
  content: {
    quality: number;
    style: string;
  };
}

export interface TextSelectionAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'editing' | 'formatting' | 'analysis' | 'ai' | 'utility';
  requiresSelection: boolean;
  supportedTypes: Array<'word' | 'sentence' | 'paragraph' | 'block' | 'custom'>;
  enabled: boolean;
  execute: (selection: TextSelectionInfo, context: SelectionContextAnalysis) => Promise<string>;
}

export interface TextSelectionManager {
  getCurrentSelection(): TextSelectionInfo | null;
  analyzeSelection(selection: TextSelectionInfo): Promise<SelectionContextAnalysis>;
  getAvailableActions(selection: TextSelectionInfo): TextSelectionAction[];
  executeAction(actionId: string, selection: TextSelectionInfo): Promise<string>;
  registerAction(action: TextSelectionAction): void;
  unregisterAction(actionId: string): void;
}

// Utility functions for text selection
export const createTextSelectionInfo = (
  text: string,
  start: number,
  end: number,
  fullText: string
): TextSelectionInfo => {
  const before = fullText.substring(Math.max(0, start - 100), start);
  const after = fullText.substring(end, Math.min(fullText.length, end + 100));
  
  return {
    text,
    start,
    end,
    length: end - start,
    context: {
      before,
      after
    },
    metadata: {
      lineNumber: fullText.substring(0, start).split('\n').length,
      columnNumber: start - fullText.lastIndexOf('\n', start - 1),
      paragraph: fullText.substring(0, start).split('\n\n').length,
      sentence: fullText.substring(0, start).split(/[.!?]+/).length
    }
  };
};

export const analyzeTextSelection = async (
  selection: TextSelectionInfo
): Promise<SelectionContextAnalysis> => {
  const { text } = selection;
  
  // Basic analysis implementation
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Simple keyword extraction
  const keywords = words
    .filter(word => word.length > 3)
    .map(word => word.toLowerCase())
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 10);
  
  // Determine selection type
  let selectionType: 'word' | 'sentence' | 'paragraph' | 'block' | 'custom' = 'custom';
  if (words.length === 1) selectionType = 'word';
  else if (sentences.length === 1) selectionType = 'sentence';
  else if (paragraphs.length === 1) selectionType = 'paragraph';
  else selectionType = 'block';
  
  // Determine text type
  let textType: 'prose' | 'code' | 'list' | 'heading' | 'quote' | 'mixed' = 'prose';
  if (text.includes('```') || text.includes('function') || text.includes('class')) textType = 'code';
  else if (text.includes('- ') || text.includes('1. ')) textType = 'list';
  else if (text.startsWith('#') || text.match(/^[A-Z][^.]*$/)) textType = 'heading';
  else if (text.startsWith('>') || text.startsWith('"')) textType = 'quote';
  
  return {
    selectionType,
    language: 'en', // Default to English
    textType,
    readability: {
      score: 0.7,
      level: 'moderate',
      suggestions: []
    },
    sentiment: {
      score: 0,
      label: 'neutral',
      confidence: 0.5
    },
    keywords,
    entities: [],
    structure: {
      sentences: sentences.length,
      words: words.length,
      characters: text.length,
      paragraphs: paragraphs.length
    },
    style: {
      tone: 'neutral',
      formality: 'neutral',
      complexity: words.length > 20 ? 'complex' : words.length > 10 ? 'moderate' : 'simple'
    },
    quality: {
      grammar: 0.8,
      clarity: 0.7,
      coherence: 0.7,
      engagement: 0.6
    },
    content: {
      quality: 0.7,
      style: textType === 'code' ? 'code' : textType === 'list' ? 'list' : 'prose'
    }
  };
};