// AI services integration hooks for ChUseA
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { call } from '../../lib/api/router';
import { QUERY_KEYS, API_CONFIG } from '../../lib/constants';
import { useAdvancedPermissions } from './use-auth-advanced';
import type {
  AIGenerateInput,
  AIGenerateOutput,
  AIOptimizeInput,
  AIOptimizeOutput
} from '../../types';

// AI generation status
export type AIGenerationStatus = 'idle' | 'generating' | 'completed' | 'error' | 'cancelled';

// AI generation session
export interface AIGenerationSession {
  id: string;
  status: AIGenerationStatus;
  prompt: string;
  result?: string;
  error?: string;
  progress?: number;
  metadata?: any;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// AI TEXT GENERATION HOOKS
// ============================================================================

/**
 * Hook for AI text generation with streaming support
 */
export function useAITextGeneration() {
  const [sessions, setSessions] = React.useState<AIGenerationSession[]>([]);
  const { checkFeature } = useAdvancedPermissions();
  
  const generateText = useMutation({
    mutationFn: async ({
      prompt,
      options,
      onProgress,
      signal
    }: {
      prompt: string;
      options?: Partial<AIGenerateInput>;
      onProgress?: (chunk: string, progress?: number) => void;
      signal?: AbortSignal;
    }) => {
      if (!checkFeature('ai_writing')) {
        throw new Error('AI writing feature not available in your plan');
      }
      
      const sessionId = `ai_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add session
      const session: AIGenerationSession = {
        id: sessionId,
        status: 'generating',
        prompt,
        createdAt: new Date(),
      };
      
      setSessions(prev => [...prev, session]);
      
      try {
        // Use streaming if supported
        if (options?.stream) {
          return await streamGeneration({
            sessionId,
            prompt,
            options,
            onProgress,
            signal,
          });
        } else {
          const result = await call('ai.generate', {
            prompt,
            ...options,
          });
          
          // Update session
          setSessions(prev => 
            prev.map(s => 
              s.id === sessionId 
                ? { 
                    ...s, 
                    status: 'completed',
                    result: result.content,
                    metadata: result.metadata,
                    completedAt: new Date()
                  }
                : s
            )
          );
          
          return result;
        }
      } catch (error) {
        // Update session with error
        setSessions(prev => 
          prev.map(s => 
            s.id === sessionId 
              ? { 
                  ...s, 
                  status: 'error',
                  error: error.message,
                  completedAt: new Date()
                }
              : s
          )
        );
        throw error;
      }
    }
  });
  
  // Streaming generation helper
  const streamGeneration = async ({
    sessionId,
    prompt,
    options,
    onProgress,
    signal
  }: {
    sessionId: string;
    prompt: string;
    options?: Partial<AIGenerateInput>;
    onProgress?: (chunk: string, progress?: number) => void;
    signal?: AbortSignal;
  }) => {
    const response = await fetch('/api/ai/generate-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        prompt,
        ...options,
        stream: true,
      }),
      signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }
    
    const decoder = new TextDecoder();
    let fullContent = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setSessions(prev => 
                prev.map(s => 
                  s.id === sessionId 
                    ? { 
                        ...s, 
                        status: 'completed',
                        result: fullContent,
                        completedAt: new Date()
                      }
                    : s
                )
              );
              return { content: fullContent };
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                fullContent += parsed.content;
                onProgress?.(parsed.content, parsed.progress);
                
                // Update session with current content
                setSessions(prev => 
                  prev.map(s => 
                    s.id === sessionId 
                      ? { 
                          ...s, 
                          result: fullContent,
                          progress: parsed.progress
                        }
                      : s
                  )
                );
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    return { content: fullContent };
  };
  
  const continueGeneration = useMutation({
    mutationFn: async ({
      sessionId,
      additionalPrompt,
      onProgress
    }: {
      sessionId: string;
      additionalPrompt?: string;
      onProgress?: (chunk: string) => void;
    }) => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const context = session.result || '';
      const prompt = additionalPrompt 
        ? `${context}\n\n${additionalPrompt}`
        : `Continue from: ${context.slice(-500)}`; // Last 500 chars as context
      
      return generateText.mutateAsync({
        prompt,
        options: { context, continuationMode: true },
        onProgress,
      });
    }
  });
  
  const regenerateText = useMutation({
    mutationFn: async ({
      sessionId,
      variations = 1
    }: {
      sessionId: string;
      variations?: number;
    }) => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const results = [];
      
      for (let i = 0; i < variations; i++) {
        const result = await generateText.mutateAsync({
          prompt: session.prompt,
          options: { 
            temperature: 0.8 + (i * 0.1), // Vary temperature for diversity
            regenerate: true 
          },
        });
        results.push(result);
      }
      
      return results;
    }
  });
  
  // Cancel generation
  const cancelGeneration = React.useCallback((sessionId: string) => {
    setSessions(prev => 
      prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'cancelled', completedAt: new Date() }
          : s
      )
    );
  }, []);
  
  // Clear sessions
  const clearSessions = React.useCallback(() => {
    setSessions([]);
  }, []);
  
  // Remove session
  const removeSession = React.useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);
  
  return {
    sessions,
    generateText,
    continueGeneration,
    regenerateText,
    cancelGeneration,
    removeSession,
    clearSessions,
    isGenerating: generateText.isLoading || 
                  continueGeneration.isLoading || 
                  regenerateText.isLoading,
  };
}

// ============================================================================
// AI TEXT OPTIMIZATION HOOKS
// ============================================================================

/**
 * Hook for AI text optimization and enhancement
 */
export function useAITextOptimization() {
  const { checkFeature } = useAdvancedPermissions();
  
  const optimizeText = useMutation({
    mutationFn: async (input: AIOptimizeInput) => {
      if (!checkFeature('ai_optimization')) {
        throw new Error('AI optimization feature not available in your plan');
      }
      
      return call('ai.optimize', input);
    }
  });
  
  const checkGrammar = useMutation({
    mutationFn: async ({
      content,
      language = 'en'
    }: {
      content: string;
      language?: string;
    }) => {
      return call('ai.checkGrammar', { content, language });
    }
  });
  
  const improveClarity = useMutation({
    mutationFn: async ({
      content,
      targetAudience,
      readingLevel
    }: {
      content: string;
      targetAudience?: string;
      readingLevel?: 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
    }) => {
      return optimizeText.mutateAsync({
        content,
        optimizationType: 'clarity',
        targetAudience,
        readingLevel,
      });
    }
  });
  
  const adjustTone = useMutation({
    mutationFn: async ({
      content,
      targetTone,
      intensity = 'medium'
    }: {
      content: string;
      targetTone: string;
      intensity?: 'light' | 'medium' | 'strong';
    }) => {
      return optimizeText.mutateAsync({
        content,
        optimizationType: 'tone',
        targetTone,
        intensity,
      });
    }
  });
  
  const changeTense = useMutation({
    mutationFn: async ({
      content,
      targetTense
    }: {
      content: string;
      targetTense: 'past' | 'present' | 'future';
    }) => {
      return call('ai.changeTense', { content, targetTense });
    }
  });
  
  const expandText = useMutation({
    mutationFn: async ({
      content,
      expansionType = 'detail',
      targetLength
    }: {
      content: string;
      expansionType?: 'detail' | 'examples' | 'explanation' | 'context';
      targetLength?: number;
    }) => {
      return call('ai.expandText', { 
        content, 
        expansionType, 
        targetLength 
      });
    }
  });
  
  const summarizeText = useMutation({
    mutationFn: async ({
      content,
      summaryType = 'extractive',
      targetLength,
      keyPoints
    }: {
      content: string;
      summaryType?: 'extractive' | 'abstractive' | 'bullet_points';
      targetLength?: number;
      keyPoints?: number;
    }) => {
      return call('ai.summarize', { 
        content, 
        summaryType, 
        targetLength, 
        keyPoints 
      });
    }
  });
  
  const translateText = useMutation({
    mutationFn: async ({
      content,
      targetLanguage,
      sourceLanguage = 'auto',
      preserveFormatting = true
    }: {
      content: string;
      targetLanguage: string;
      sourceLanguage?: string;
      preserveFormatting?: boolean;
    }) => {
      return call('ai.translate', { 
        content, 
        targetLanguage, 
        sourceLanguage, 
        preserveFormatting 
      });
    }
  });
  
  return {
    optimizeText,
    checkGrammar,
    improveClarity,
    adjustTone,
    changeTense,
    expandText,
    summarizeText,
    translateText,
    isOptimizing: optimizeText.isLoading || 
                  checkGrammar.isLoading || 
                  improveClarity.isLoading || 
                  adjustTone.isLoading || 
                  changeTense.isLoading || 
                  expandText.isLoading || 
                  summarizeText.isLoading || 
                  translateText.isLoading,
  };
}

// ============================================================================
// AI ANALYSIS HOOKS
// ============================================================================

/**
 * Hook for AI content analysis
 */
export function useAIContentAnalysis() {
  const analyzeContent = useMutation({
    mutationFn: async ({
      content,
      analysisTypes = ['readability', 'sentiment', 'keywords']
    }: {
      content: string;
      analysisTypes?: ('readability' | 'sentiment' | 'keywords' | 'topics' | 'entities' | 'structure')[];
    }) => {
      return call('ai.analyzeContent', { content, analysisTypes });
    }
  });
  
  const getReadabilityScore = useMutation({
    mutationFn: async ({
      content,
      metrics = ['flesch_kincaid', 'gunning_fog', 'coleman_liau']
    }: {
      content: string;
      metrics?: string[];
    }) => {
      return call('ai.getReadabilityScore', { content, metrics });
    }
  });
  
  const extractKeywords = useMutation({
    mutationFn: async ({
      content,
      count = 10,
      includeScores = true
    }: {
      content: string;
      count?: number;
      includeScores?: boolean;
    }) => {
      return call('ai.extractKeywords', { content, count, includeScores });
    }
  });
  
  const detectTopics = useMutation({
    mutationFn: async ({
      content,
      topicCount = 5
    }: {
      content: string;
      topicCount?: number;
    }) => {
      return call('ai.detectTopics', { content, topicCount });
    }
  });
  
  const analyzeSentiment = useMutation({
    mutationFn: async ({
      content,
      includeEmotions = false
    }: {
      content: string;
      includeEmotions?: boolean;
    }) => {
      return call('ai.analyzeSentiment', { content, includeEmotions });
    }
  });
  
  const extractEntities = useMutation({
    mutationFn: async ({
      content,
      entityTypes = ['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE']
    }: {
      content: string;
      entityTypes?: string[];
    }) => {
      return call('ai.extractEntities', { content, entityTypes });
    }
  });
  
  const analyzeStructure = useMutation({
    mutationFn: async ({
      content,
      includeOutline = true
    }: {
      content: string;
      includeOutline?: boolean;
    }) => {
      return call('ai.analyzeStructure', { content, includeOutline });
    }
  });
  
  return {
    analyzeContent,
    getReadabilityScore,
    extractKeywords,
    detectTopics,
    analyzeSentiment,
    extractEntities,
    analyzeStructure,
    isAnalyzing: analyzeContent.isLoading || 
                 getReadabilityScore.isLoading || 
                 extractKeywords.isLoading || 
                 detectTopics.isLoading || 
                 analyzeSentiment.isLoading || 
                 extractEntities.isLoading || 
                 analyzeStructure.isLoading,
  };
}

// ============================================================================
// AI SUGGESTIONS HOOKS
// ============================================================================

/**
 * Hook for AI writing suggestions
 */
export function useAISuggestions() {
  const [activeSuggestions, setActiveSuggestions] = React.useState<any[]>([]);
  
  const getSuggestions = useMutation({
    mutationFn: async ({
      content,
      cursorPosition,
      suggestionTypes = ['completion', 'improvement', 'alternative']
    }: {
      content: string;
      cursorPosition?: number;
      suggestionTypes?: ('completion' | 'improvement' | 'alternative' | 'restructure')[];
    }) => {
      return call('ai.getSuggestions', { 
        content, 
        cursorPosition, 
        suggestionTypes 
      });
    },
    onSuccess: (suggestions) => {
      setActiveSuggestions(suggestions);
    }
  });
  
  const getAutoComplete = useMutation({
    mutationFn: async ({
      content,
      cursorPosition,
      maxSuggestions = 3
    }: {
      content: string;
      cursorPosition: number;
      maxSuggestions?: number;
    }) => {
      return call('ai.getAutoComplete', { 
        content, 
        cursorPosition, 
        maxSuggestions 
      });
    }
  });
  
  const getWritingTips = useMutation({
    mutationFn: async ({
      content,
      focusArea
    }: {
      content: string;
      focusArea?: 'grammar' | 'style' | 'structure' | 'clarity' | 'engagement';
    }) => {
      return call('ai.getWritingTips', { content, focusArea });
    }
  });
  
  const applySuggestion = React.useCallback((
    suggestionId: string,
    content: string
  ): string => {
    const suggestion = activeSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return content;
    
    // Apply the suggestion based on its type
    switch (suggestion.type) {
      case 'replacement':
        return content.slice(0, suggestion.start) + 
               suggestion.replacement + 
               content.slice(suggestion.end);
      case 'insertion':
        return content.slice(0, suggestion.position) + 
               suggestion.text + 
               content.slice(suggestion.position);
      case 'deletion':
        return content.slice(0, suggestion.start) + 
               content.slice(suggestion.end);
      default:
        return content;
    }
  }, [activeSuggestions]);
  
  const dismissSuggestion = React.useCallback((suggestionId: string) => {
    setActiveSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);
  
  const clearSuggestions = React.useCallback(() => {
    setActiveSuggestions([]);
  }, []);
  
  return {
    activeSuggestions,
    getSuggestions,
    getAutoComplete,
    getWritingTips,
    applySuggestion,
    dismissSuggestion,
    clearSuggestions,
    isLoading: getSuggestions.isLoading || 
               getAutoComplete.isLoading || 
               getWritingTips.isLoading,
  };
}

// ============================================================================
// AI MODELS MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for AI models and configuration management
 */
export function useAIModels() {
  const queryClient = useQueryClient();
  
  const availableModels = useQuery({
    queryKey: QUERY_KEYS.AI_MODELS(),
    queryFn: () => call('ai.getAvailableModels'),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  
  const modelCapabilities = useQuery({
    queryKey: [...QUERY_KEYS.AI_MODELS(), 'capabilities'],
    queryFn: () => call('ai.getModelCapabilities'),
    staleTime: 30 * 60 * 1000,
  });
  
  const userPreferences = useQuery({
    queryKey: [...QUERY_KEYS.AI, 'preferences'],
    queryFn: () => call('ai.getUserPreferences'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const updatePreferences = useMutation({
    mutationFn: async ({
      defaultModel,
      temperature,
      maxTokens,
      autoSuggestions,
      streamResponses
    }: {
      defaultModel?: string;
      temperature?: number;
      maxTokens?: number;
      autoSuggestions?: boolean;
      streamResponses?: boolean;
    }) => {
      return call('ai.updateUserPreferences', {
        defaultModel,
        temperature,
        maxTokens,
        autoSuggestions,
        streamResponses,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.AI, 'preferences'] });
    }
  });
  
  const getUsageStats = useQuery({
    queryKey: QUERY_KEYS.AI_USAGE(),
    queryFn: () => call('ai.getUsageStats'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const testModel = useMutation({
    mutationFn: async ({
      modelId,
      testPrompt = 'Write a short greeting.'
    }: {
      modelId: string;
      testPrompt?: string;
    }) => {
      return call('ai.testModel', { modelId, testPrompt });
    }
  });
  
  return {
    availableModels: availableModels.data || [],
    modelCapabilities: modelCapabilities.data || {},
    userPreferences: userPreferences.data,
    usageStats: getUsageStats.data,
    updatePreferences,
    testModel,
    isLoading: availableModels.isLoading || 
               modelCapabilities.isLoading || 
               userPreferences.isLoading,
  };
}

// ============================================================================
// AI QUOTA MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for AI usage quota management
 */
export function useAIQuota() {
  const quotaInfo = useQuery({
    queryKey: [...QUERY_KEYS.AI, 'quota'],
    queryFn: () => call('ai.getQuotaInfo'),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
  
  const usageHistory = useQuery({
    queryKey: [...QUERY_KEYS.AI, 'usage-history'],
    queryFn: () => call('ai.getUsageHistory'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const estimateUsage = useMutation({
    mutationFn: async ({
      operation,
      content,
      options
    }: {
      operation: 'generate' | 'optimize' | 'analyze' | 'translate';
      content?: string;
      options?: any;
    }) => {
      return call('ai.estimateUsage', { operation, content, options });
    }
  });
  
  const requestQuotaIncrease = useMutation({
    mutationFn: async ({
      requestedQuota,
      reason,
      businessJustification
    }: {
      requestedQuota: number;
      reason: string;
      businessJustification?: string;
    }) => {
      return call('ai.requestQuotaIncrease', {
        requestedQuota,
        reason,
        businessJustification,
      });
    }
  });
  
  const checkQuotaAvailability = React.useCallback((
    operation: string,
    estimatedTokens?: number
  ): boolean => {
    const quota = quotaInfo.data;
    if (!quota) return true; // Assume available if no quota info
    
    const remaining = quota.limit - quota.used;
    const required = estimatedTokens || quota.averageTokensPerOperation[operation] || 100;
    
    return remaining >= required;
  }, [quotaInfo.data]);
  
  const getQuotaWarningLevel = React.useCallback((): 'none' | 'low' | 'critical' => {
    const quota = quotaInfo.data;
    if (!quota) return 'none';
    
    const usagePercentage = (quota.used / quota.limit) * 100;
    
    if (usagePercentage >= 95) return 'critical';
    if (usagePercentage >= 80) return 'low';
    return 'none';
  }, [quotaInfo.data]);
  
  return {
    quotaInfo: quotaInfo.data,
    usageHistory: usageHistory.data || [],
    estimateUsage,
    requestQuotaIncrease,
    checkQuotaAvailability,
    getQuotaWarningLevel,
    isLoading: quotaInfo.isLoading || usageHistory.isLoading,
  };
}