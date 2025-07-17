/**
 * 写作状态管理 - Writing Store
 * 管理写作模式、生成历史、当前写作内容等
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';

// 写作模式类型
export type WritingMode = 
  | 'creative'    // 创意写作
  | 'academic'    // 学术写作
  | 'technical'   // 技术写作
  | 'business'    // 商业写作
  | 'journalism'  // 新闻写作
  | 'storytelling' // 故事写作
  | 'copywriting' // 文案写作
  | 'email';      // 邮件写作

// 写作风格
export type WritingStyle = 
  | 'formal'      // 正式
  | 'casual'      // 随意
  | 'professional' // 专业
  | 'conversational' // 对话式
  | 'persuasive'  // 说服性
  | 'descriptive' // 描述性
  | 'narrative'   // 叙述性
  | 'analytical'; // 分析性

// 写作语调
export type WritingTone = 
  | 'friendly'    // 友好
  | 'confident'   // 自信
  | 'neutral'     // 中性
  | 'enthusiastic' // 热情
  | 'serious'     // 严肃
  | 'humorous'    // 幽默
  | 'empathetic'  // 共情
  | 'authoritative'; // 权威

// 生成类型
export type GenerationType = 
  | 'complete'    // 完整生成
  | 'continue'    // 继续写作
  | 'rewrite'     // 重写
  | 'expand'      // 扩展
  | 'summarize'   // 总结
  | 'translate'   // 翻译
  | 'improve'     // 改进
  | 'outline';    // 大纲

// 写作提示
export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: WritingMode;
  style: WritingStyle;
  tone: WritingTone;
  template: string;
  variables: Record<string, any>;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

// 生成历史记录
export interface GenerationHistory {
  id: string;
  documentId?: string;
  type: GenerationType;
  input: {
    prompt: string;
    content: string;
    mode: WritingMode;
    style: WritingStyle;
    tone: WritingTone;
    length: number;
    additionalInstructions?: string;
  };
  output: {
    content: string;
    wordCount: number;
    characterCount: number;
    generatedAt: string;
    processingTime: number; // 毫秒
    model: string;
    cost?: number;
  };
  feedback: {
    rating?: number; // 1-5
    useful: boolean;
    comments?: string;
    improvements?: string[];
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId: string;
  };
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// 写作配置
export interface WritingConfig {
  defaultMode: WritingMode;
  defaultStyle: WritingStyle;
  defaultTone: WritingTone;
  defaultLength: number;
  autoSave: boolean;
  showSuggestions: boolean;
  enableGrammarCheck: boolean;
  enableSpellCheck: boolean;
  enableAutoComplete: boolean;
  language: string;
  temperature: number; // 0-1, 控制创意程度
  maxTokens: number;
  stopSequences: string[];
  frequencyPenalty: number;
  presencePenalty: number;
}

// 写作建议
export interface WritingSuggestion {
  id: string;
  type: 'grammar' | 'style' | 'tone' | 'structure' | 'vocabulary' | 'clarity';
  severity: 'low' | 'medium' | 'high';
  position: {
    start: number;
    end: number;
  };
  original: string;
  suggestions: string[];
  explanation: string;
  accepted: boolean;
  dismissed: boolean;
  createdAt: string;
}

// 写作统计
export interface WritingStats {
  totalWords: number;
  totalCharacters: number;
  writingTime: number; // 分钟
  generationsUsed: number;
  averageWordsPerMinute: number;
  sessionsCount: number;
  favoriteMode: WritingMode;
  favoriteStyle: WritingStyle;
  productivity: {
    today: number;
    week: number;
    month: number;
  };
  streakDays: number;
  lastActiveDate: string;
}

// 写作状态接口
export interface WritingState {
  // 当前写作状态
  currentContent: string;
  currentMode: WritingMode;
  currentStyle: WritingStyle;
  currentTone: WritingTone;
  currentLength: number;
  
  // 生成状态
  isGenerating: boolean;
  generationProgress: number;
  generationError: string | null;
  generationAbortController: AbortController | null;
  
  // 历史记录
  history: GenerationHistory[];
  currentHistoryIndex: number;
  
  // 写作配置
  config: WritingConfig;
  
  // 提示管理
  prompts: WritingPrompt[];
  customPrompts: WritingPrompt[];
  favoritePrompts: string[];
  
  // 建议系统
  suggestions: WritingSuggestion[];
  showSuggestions: boolean;
  
  // 统计信息
  stats: WritingStats;
  
  // 会话状态
  sessionId: string;
  sessionStartTime: string;
  sessionWordCount: number;
  sessionWritingTime: number;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  generateContent: (prompt: string, options?: Partial<WritingConfig>) => Promise<string>;
  continueWriting: (content: string, options?: Partial<WritingConfig>) => Promise<string>;
  rewriteContent: (content: string, instructions?: string) => Promise<string>;
  expandContent: (content: string, targetLength: number) => Promise<string>;
  summarizeContent: (content: string, targetLength: number) => Promise<string>;
  translateContent: (content: string, targetLanguage: string) => Promise<string>;
  improveContent: (content: string, improvements: string[]) => Promise<string>;
  generateOutline: (topic: string, details: string) => Promise<string>;
  
  // 历史管理
  saveToHistory: (generation: Omit<GenerationHistory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  loadHistory: () => Promise<void>;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  rateGeneration: (id: string, rating: number, comments?: string) => void;
  
  // 提示管理
  loadPrompts: () => Promise<void>;
  createPrompt: (prompt: Omit<WritingPrompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WritingPrompt>;
  updatePrompt: (id: string, updates: Partial<WritingPrompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  toggleFavoritePrompt: (id: string) => void;
  
  // 建议系统
  generateSuggestions: (content: string) => Promise<void>;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  clearSuggestions: () => void;
  
  // 配置管理
  updateConfig: (updates: Partial<WritingConfig>) => void;
  resetConfig: () => void;
  
  // 内容管理
  setCurrentContent: (content: string) => void;
  setCurrentMode: (mode: WritingMode) => void;
  setCurrentStyle: (style: WritingStyle) => void;
  setCurrentTone: (tone: WritingTone) => void;
  setCurrentLength: (length: number) => void;
  
  // 会话管理
  startSession: () => void;
  endSession: () => void;
  updateSessionStats: (wordCount: number, timeSpent: number) => void;
  
  // 统计更新
  updateStats: (updates: Partial<WritingStats>) => void;
  getProductivityStats: () => WritingStats['productivity'];
  
  // 错误处理
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 生成控制
  cancelGeneration: () => void;
  
  // 工具函数
  getWordCount: (text: string) => number;
  getCharacterCount: (text: string) => number;
  getReadingTime: (text: string) => number;
  
  // 导出功能
  exportHistory: () => string;
  importHistory: (data: string) => void;
  exportConfig: () => string;
  importConfig: (data: string) => void;
}

// 默认配置
const defaultConfig: WritingConfig = {
  defaultMode: 'creative',
  defaultStyle: 'casual',
  defaultTone: 'friendly',
  defaultLength: 500,
  autoSave: true,
  showSuggestions: true,
  enableGrammarCheck: true,
  enableSpellCheck: true,
  enableAutoComplete: true,
  language: 'zh-CN',
  temperature: 0.7,
  maxTokens: 2000,
  stopSequences: [],
  frequencyPenalty: 0.5,
  presencePenalty: 0.5,
};

// 默认统计
const defaultStats: WritingStats = {
  totalWords: 0,
  totalCharacters: 0,
  writingTime: 0,
  generationsUsed: 0,
  averageWordsPerMinute: 0,
  sessionsCount: 0,
  favoriteMode: 'creative',
  favoriteStyle: 'casual',
  productivity: {
    today: 0,
    week: 0,
    month: 0,
  },
  streakDays: 0,
  lastActiveDate: new Date().toISOString(),
};

// 初始状态
const initialState = {
  currentContent: '',
  currentMode: 'creative' as WritingMode,
  currentStyle: 'casual' as WritingStyle,
  currentTone: 'friendly' as WritingTone,
  currentLength: 500,
  isGenerating: false,
  generationProgress: 0,
  generationError: null,
  generationAbortController: null,
  history: [],
  currentHistoryIndex: -1,
  config: defaultConfig,
  prompts: [],
  customPrompts: [],
  favoritePrompts: [],
  suggestions: [],
  showSuggestions: true,
  stats: defaultStats,
  sessionId: '',
  sessionStartTime: '',
  sessionWordCount: 0,
  sessionWritingTime: 0,
  isLoading: false,
  error: null,
};

// 创建写作store
export const useWritingStore = create<WritingState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 生成内容
        generateContent: async (prompt: string, options: Partial<WritingConfig> = {}) => {
          const { config, currentMode, currentStyle, currentTone, currentLength } = get();
          const requestConfig = { ...config, ...options };
          
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
                length: currentLength,
                config: requestConfig,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Generation failed');
            }

            const data = await response.json();
            const generatedContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'complete',
              input: {
                prompt,
                content: '',
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
                length: currentLength,
              },
              output: {
                content: generatedContent,
                wordCount: get().getWordCount(generatedContent),
                characterCount: get().getCharacterCount(generatedContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            // 更新统计
            get().updateStats({
              generationsUsed: get().stats.generationsUsed + 1,
              totalWords: get().stats.totalWords + get().getWordCount(generatedContent),
              totalCharacters: get().stats.totalCharacters + get().getCharacterCount(generatedContent),
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: generatedContent,
            });
            
            return generatedContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Generation failed',
              });
            }
            throw error;
          }
        },

        // 继续写作
        continueWriting: async (content: string, options: Partial<WritingConfig> = {}) => {
          const { config, currentMode, currentStyle, currentTone, currentLength } = get();
          const requestConfig = { ...config, ...options };
          
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/continue', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
                length: currentLength,
                config: requestConfig,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Continue writing failed');
            }

            const data = await response.json();
            const continuedContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'continue',
              input: {
                prompt: '',
                content,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
                length: currentLength,
              },
              output: {
                content: continuedContent,
                wordCount: get().getWordCount(continuedContent),
                characterCount: get().getCharacterCount(continuedContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: content + continuedContent,
            });
            
            return continuedContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Continue writing failed',
              });
            }
            throw error;
          }
        },

        // 重写内容
        rewriteContent: async (content: string, instructions?: string) => {
          const { currentMode, currentStyle, currentTone } = get();
          
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/rewrite', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content,
                instructions,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Rewrite failed');
            }

            const data = await response.json();
            const rewrittenContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'rewrite',
              input: {
                prompt: instructions || '',
                content,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
                length: get().getWordCount(content),
                additionalInstructions: instructions,
              },
              output: {
                content: rewrittenContent,
                wordCount: get().getWordCount(rewrittenContent),
                characterCount: get().getCharacterCount(rewrittenContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: rewrittenContent,
            });
            
            return rewrittenContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Rewrite failed',
              });
            }
            throw error;
          }
        },

        // 扩展内容
        expandContent: async (content: string, targetLength: number) => {
          const { currentMode, currentStyle, currentTone } = get();
          
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/expand', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content,
                targetLength,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Expand failed');
            }

            const data = await response.json();
            const expandedContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'expand',
              input: {
                prompt: '',
                content,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
                length: targetLength,
              },
              output: {
                content: expandedContent,
                wordCount: get().getWordCount(expandedContent),
                characterCount: get().getCharacterCount(expandedContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: expandedContent,
            });
            
            return expandedContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Expand failed',
              });
            }
            throw error;
          }
        },

        // 总结内容
        summarizeContent: async (content: string, targetLength: number) => {
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/summarize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content,
                targetLength,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Summarize failed');
            }

            const data = await response.json();
            const summarizedContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'summarize',
              input: {
                prompt: '',
                content,
                mode: get().currentMode,
                style: get().currentStyle,
                tone: get().currentTone,
                length: targetLength,
              },
              output: {
                content: summarizedContent,
                wordCount: get().getWordCount(summarizedContent),
                characterCount: get().getCharacterCount(summarizedContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: summarizedContent,
            });
            
            return summarizedContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Summarize failed',
              });
            }
            throw error;
          }
        },

        // 翻译内容
        translateContent: async (content: string, targetLanguage: string) => {
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/translate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content,
                targetLanguage,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Translation failed');
            }

            const data = await response.json();
            const translatedContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'translate',
              input: {
                prompt: `Translate to ${targetLanguage}`,
                content,
                mode: get().currentMode,
                style: get().currentStyle,
                tone: get().currentTone,
                length: get().getWordCount(content),
              },
              output: {
                content: translatedContent,
                wordCount: get().getWordCount(translatedContent),
                characterCount: get().getCharacterCount(translatedContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: translatedContent,
            });
            
            return translatedContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Translation failed',
              });
            }
            throw error;
          }
        },

        // 改进内容
        improveContent: async (content: string, improvements: string[]) => {
          const { currentMode, currentStyle, currentTone } = get();
          
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/improve', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content,
                improvements,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Improve failed');
            }

            const data = await response.json();
            const improvedContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'improve',
              input: {
                prompt: improvements.join(', '),
                content,
                mode: currentMode,
                style: currentStyle,
                tone: currentTone,
                length: get().getWordCount(content),
                additionalInstructions: improvements.join(', '),
              },
              output: {
                content: improvedContent,
                wordCount: get().getWordCount(improvedContent),
                characterCount: get().getCharacterCount(improvedContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
                improvements,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: improvedContent,
            });
            
            return improvedContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Improve failed',
              });
            }
            throw error;
          }
        },

        // 生成大纲
        generateOutline: async (topic: string, details: string) => {
          set({ 
            isGenerating: true, 
            generationProgress: 0, 
            generationError: null,
            generationAbortController: new AbortController(),
          });
          
          try {
            const response = await fetch('/api/writing/outline', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                topic,
                details,
                mode: get().currentMode,
              }),
              signal: get().generationAbortController?.signal,
            });

            if (!response.ok) {
              throw new Error('Outline generation failed');
            }

            const data = await response.json();
            const outlineContent = data.content;
            
            // 保存到历史
            get().saveToHistory({
              type: 'outline',
              input: {
                prompt: `Generate outline for: ${topic}`,
                content: details,
                mode: get().currentMode,
                style: get().currentStyle,
                tone: get().currentTone,
                length: 0,
              },
              output: {
                content: outlineContent,
                wordCount: get().getWordCount(outlineContent),
                characterCount: get().getCharacterCount(outlineContent),
                generatedAt: new Date().toISOString(),
                processingTime: data.processingTime || 0,
                model: data.model || 'unknown',
              },
              feedback: {
                useful: true,
              },
              metadata: {
                sessionId: get().sessionId,
              },
              status: 'completed',
            });
            
            set({ 
              isGenerating: false, 
              generationProgress: 100,
              currentContent: outlineContent,
            });
            
            return outlineContent;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              set({ 
                isGenerating: false,
                generationError: 'Generation cancelled',
              });
            } else {
              set({ 
                isGenerating: false,
                generationError: error instanceof Error ? error.message : 'Outline generation failed',
              });
            }
            throw error;
          }
        },

        // 保存到历史
        saveToHistory: (generation: Omit<GenerationHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
          const newGeneration: GenerationHistory = {
            ...generation,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            history: [newGeneration, ...get().history.slice(0, 99)], // 保留最近100条
            currentHistoryIndex: 0,
          });
        },

        // 加载历史
        loadHistory: async () => {
          set({ isLoading: true });
          
          try {
            const response = await fetch('/api/writing/history');
            
            if (!response.ok) {
              throw new Error('Failed to load history');
            }

            const history = await response.json();
            
            set({ 
              history,
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load history',
            });
          }
        },

        // 清除历史
        clearHistory: () => {
          set({
            history: [],
            currentHistoryIndex: -1,
          });
        },

        // 删除历史项
        deleteHistoryItem: (id: string) => {
          const { history, currentHistoryIndex } = get();
          const newHistory = history.filter(item => item.id !== id);
          
          set({
            history: newHistory,
            currentHistoryIndex: currentHistoryIndex >= newHistory.length ? 
              newHistory.length - 1 : currentHistoryIndex,
          });
        },

        // 评价生成结果
        rateGeneration: (id: string, rating: number, comments?: string) => {
          const { history } = get();
          const updatedHistory = history.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  feedback: { 
                    ...item.feedback, 
                    rating, 
                    comments 
                  },
                  updatedAt: new Date().toISOString(),
                }
              : item
          );
          
          set({ history: updatedHistory });
        },

        // 加载提示
        loadPrompts: async () => {
          set({ isLoading: true });
          
          try {
            const response = await fetch('/api/writing/prompts');
            
            if (!response.ok) {
              throw new Error('Failed to load prompts');
            }

            const data = await response.json();
            
            set({ 
              prompts: data.prompts,
              customPrompts: data.customPrompts,
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load prompts',
            });
          }
        },

        // 创建提示
        createPrompt: async (prompt: Omit<WritingPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
          set({ isLoading: true });
          
          try {
            const response = await fetch('/api/writing/prompts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(prompt),
            });

            if (!response.ok) {
              throw new Error('Failed to create prompt');
            }

            const newPrompt = await response.json();
            
            set({
              customPrompts: [...get().customPrompts, newPrompt],
              isLoading: false,
            });
            
            return newPrompt;
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create prompt',
            });
            throw error;
          }
        },

        // 更新提示
        updatePrompt: async (id: string, updates: Partial<WritingPrompt>) => {
          set({ isLoading: true });
          
          try {
            const response = await fetch(`/api/writing/prompts/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update prompt');
            }

            const updatedPrompt = await response.json();
            
            set({
              customPrompts: get().customPrompts.map(p => 
                p.id === id ? updatedPrompt : p
              ),
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update prompt',
            });
            throw error;
          }
        },

        // 删除提示
        deletePrompt: async (id: string) => {
          set({ isLoading: true });
          
          try {
            const response = await fetch(`/api/writing/prompts/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete prompt');
            }

            set({
              customPrompts: get().customPrompts.filter(p => p.id !== id),
              favoritePrompts: get().favoritePrompts.filter(fId => fId !== id),
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete prompt',
            });
            throw error;
          }
        },

        // 切换收藏提示
        toggleFavoritePrompt: (id: string) => {
          const { favoritePrompts } = get();
          const isFavorite = favoritePrompts.includes(id);
          
          set({
            favoritePrompts: isFavorite 
              ? favoritePrompts.filter(fId => fId !== id)
              : [...favoritePrompts, id],
          });
        },

        // 生成建议
        generateSuggestions: async (content: string) => {
          if (!get().showSuggestions) return;
          
          try {
            const response = await fetch('/api/writing/suggestions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content }),
            });

            if (!response.ok) {
              throw new Error('Failed to generate suggestions');
            }

            const suggestions = await response.json();
            
            set({ suggestions });
          } catch (error) {
            console.warn('Failed to generate suggestions:', error);
          }
        },

        // 接受建议
        acceptSuggestion: (id: string) => {
          const { suggestions } = get();
          const updatedSuggestions = suggestions.map(s => 
            s.id === id ? { ...s, accepted: true } : s
          );
          
          set({ suggestions: updatedSuggestions });
        },

        // 忽略建议
        dismissSuggestion: (id: string) => {
          const { suggestions } = get();
          const updatedSuggestions = suggestions.map(s => 
            s.id === id ? { ...s, dismissed: true } : s
          );
          
          set({ suggestions: updatedSuggestions });
        },

        // 清除建议
        clearSuggestions: () => {
          set({ suggestions: [] });
        },

        // 更新配置
        updateConfig: (updates: Partial<WritingConfig>) => {
          set({
            config: { ...get().config, ...updates },
          });
        },

        // 重置配置
        resetConfig: () => {
          set({
            config: defaultConfig,
          });
        },

        // 设置当前内容
        setCurrentContent: (content: string) => {
          set({ currentContent: content });
        },

        // 设置当前模式
        setCurrentMode: (mode: WritingMode) => {
          set({ currentMode: mode });
        },

        // 设置当前风格
        setCurrentStyle: (style: WritingStyle) => {
          set({ currentStyle: style });
        },

        // 设置当前语调
        setCurrentTone: (tone: WritingTone) => {
          set({ currentTone: tone });
        },

        // 设置当前长度
        setCurrentLength: (length: number) => {
          set({ currentLength: length });
        },

        // 开始会话
        startSession: () => {
          const sessionId = Date.now().toString();
          set({
            sessionId,
            sessionStartTime: new Date().toISOString(),
            sessionWordCount: 0,
            sessionWritingTime: 0,
          });
        },

        // 结束会话
        endSession: () => {
          const { sessionWordCount, sessionWritingTime, stats } = get();
          
          // 更新统计
          get().updateStats({
            sessionsCount: stats.sessionsCount + 1,
            totalWords: stats.totalWords + sessionWordCount,
            writingTime: stats.writingTime + sessionWritingTime,
            lastActiveDate: new Date().toISOString(),
          });
          
          set({
            sessionId: '',
            sessionStartTime: '',
            sessionWordCount: 0,
            sessionWritingTime: 0,
          });
        },

        // 更新会话统计
        updateSessionStats: (wordCount: number, timeSpent: number) => {
          set({
            sessionWordCount: get().sessionWordCount + wordCount,
            sessionWritingTime: get().sessionWritingTime + timeSpent,
          });
        },

        // 更新统计
        updateStats: (updates: Partial<WritingStats>) => {
          set({
            stats: { ...get().stats, ...updates },
          });
        },

        // 获取生产力统计
        getProductivityStats: () => {
          return get().stats.productivity;
        },

        // 设置错误
        setError: (error: string | null) => {
          set({ error });
        },

        // 清除错误
        clearError: () => {
          set({ error: null });
        },

        // 取消生成
        cancelGeneration: () => {
          const { generationAbortController } = get();
          if (generationAbortController) {
            generationAbortController.abort();
            set({
              isGenerating: false,
              generationProgress: 0,
              generationError: 'Generation cancelled',
              generationAbortController: null,
            });
          }
        },

        // 工具函数
        getWordCount: (text: string) => {
          return text.trim().split(/\s+/).filter(word => word.length > 0).length;
        },

        getCharacterCount: (text: string) => {
          return text.length;
        },

        getReadingTime: (text: string) => {
          const wordCount = get().getWordCount(text);
          return Math.ceil(wordCount / 200); // 假设每分钟200字
        },

        // 导出历史
        exportHistory: () => {
          const { history } = get();
          return JSON.stringify(history, null, 2);
        },

        // 导入历史
        importHistory: (data: string) => {
          try {
            const history = JSON.parse(data);
            set({ history });
          } catch (error) {
            throw new Error('Invalid history data');
          }
        },

        // 导出配置
        exportConfig: () => {
          const { config } = get();
          return JSON.stringify(config, null, 2);
        },

        // 导入配置
        importConfig: (data: string) => {
          try {
            const config = JSON.parse(data);
            set({ config });
          } catch (error) {
            throw new Error('Invalid config data');
          }
        },
      }),
      {
        name: 'writing-store',
        partialize: (state) => ({
          currentContent: state.currentContent,
          currentMode: state.currentMode,
          currentStyle: state.currentStyle,
          currentTone: state.currentTone,
          currentLength: state.currentLength,
          history: state.history,
          config: state.config,
          customPrompts: state.customPrompts,
          favoritePrompts: state.favoritePrompts,
          stats: state.stats,
          showSuggestions: state.showSuggestions,
        }),
      }
    ),
    {
      name: 'writing-store',
    }
  )
);

// 选择器钩子
export const useWriting = () => useWritingStore((state) => ({
  currentContent: state.currentContent,
  currentMode: state.currentMode,
  currentStyle: state.currentStyle,
  currentTone: state.currentTone,
  currentLength: state.currentLength,
  isGenerating: state.isGenerating,
  generationProgress: state.generationProgress,
  generationError: state.generationError,
}));

export const useWritingActions = () => useWritingStore((state) => ({
  generateContent: state.generateContent,
  continueWriting: state.continueWriting,
  rewriteContent: state.rewriteContent,
  expandContent: state.expandContent,
  summarizeContent: state.summarizeContent,
  translateContent: state.translateContent,
  improveContent: state.improveContent,
  generateOutline: state.generateOutline,
  cancelGeneration: state.cancelGeneration,
  setCurrentContent: state.setCurrentContent,
  setCurrentMode: state.setCurrentMode,
  setCurrentStyle: state.setCurrentStyle,
  setCurrentTone: state.setCurrentTone,
  setCurrentLength: state.setCurrentLength,
}));

export const useWritingHistory = () => useWritingStore((state) => ({
  history: state.history,
  currentHistoryIndex: state.currentHistoryIndex,
  saveToHistory: state.saveToHistory,
  loadHistory: state.loadHistory,
  clearHistory: state.clearHistory,
  deleteHistoryItem: state.deleteHistoryItem,
  rateGeneration: state.rateGeneration,
}));

export const useWritingPrompts = () => useWritingStore((state) => ({
  prompts: state.prompts,
  customPrompts: state.customPrompts,
  favoritePrompts: state.favoritePrompts,
  loadPrompts: state.loadPrompts,
  createPrompt: state.createPrompt,
  updatePrompt: state.updatePrompt,
  deletePrompt: state.deletePrompt,
  toggleFavoritePrompt: state.toggleFavoritePrompt,
}));

export const useWritingSuggestions = () => useWritingStore((state) => ({
  suggestions: state.suggestions,
  showSuggestions: state.showSuggestions,
  generateSuggestions: state.generateSuggestions,
  acceptSuggestion: state.acceptSuggestion,
  dismissSuggestion: state.dismissSuggestion,
  clearSuggestions: state.clearSuggestions,
}));

export const useWritingConfig = () => useWritingStore((state) => ({
  config: state.config,
  updateConfig: state.updateConfig,
  resetConfig: state.resetConfig,
}));

export const useWritingStats = () => useWritingStore((state) => ({
  stats: state.stats,
  sessionId: state.sessionId,
  sessionStartTime: state.sessionStartTime,
  sessionWordCount: state.sessionWordCount,
  sessionWritingTime: state.sessionWritingTime,
  startSession: state.startSession,
  endSession: state.endSession,
  updateSessionStats: state.updateSessionStats,
  updateStats: state.updateStats,
  getProductivityStats: state.getProductivityStats,
}));