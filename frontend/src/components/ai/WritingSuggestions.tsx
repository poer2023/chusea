/**
 * WritingSuggestions - 写作建议组件
 * 显示AI生成的写作建议并允许用户应用
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WritingSuggestion } from '@/types/api';

interface WritingSuggestionsProps {
  content: string;
  suggestions: WritingSuggestion[];
  onApplySuggestion: (suggestion: WritingSuggestion) => void;
  onGetSuggestions: (mode: string) => void;
  isLoading: boolean;
}

interface SuggestionMode {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export function WritingSuggestions({
  content,
  suggestions,
  onApplySuggestion,
  onGetSuggestions,
  isLoading
}: WritingSuggestionsProps) {
  const [selectedMode, setSelectedMode] = useState('general');

  // 建议模式配置
  const modes: SuggestionMode[] = [
    {
      id: 'general',
      label: '通用建议',
      description: '获取全面的写作建议',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'grammar',
      label: '语法检查',
      description: '检查语法和拼写错误',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'style',
      label: '风格优化',
      description: '改进文本风格和流畅度',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      id: 'structure',
      label: '结构建议',
      description: '优化文档结构和逻辑',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
        </svg>
      )
    },
    {
      id: 'clarity',
      label: '清晰度',
      description: '提高表达清晰度',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  // 获取建议类型的样式
  const getSuggestionTypeStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'improvement':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'suggestion':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // 获取建议类型的中文名称
  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'error':
        return '错误';
      case 'warning':
        return '警告';
      case 'improvement':
        return '改进';
      case 'suggestion':
        return '建议';
      case 'replacement':
        return '替换';
      default:
        return '其他';
    }
  };

  // 获取建议类型图标
  const getSuggestionTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'improvement':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'suggestion':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'replacement':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 模式选择 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          选择建议类型
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center space-x-2 p-2 rounded-md border text-left transition-colors ${
                selectedMode === mode.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              {mode.icon}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{mode.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {mode.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 获取建议按钮 */}
      <Button
        onClick={() => onGetSuggestions(selectedMode)}
        disabled={isLoading || !content.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            分析中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            获取建议
          </>
        )}
      </Button>

      {/* 建议列表 */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            写作建议 ({suggestions.length})
          </h4>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`p-1 rounded-full ${getSuggestionTypeStyle(suggestion.type)}`}>
                      {getSuggestionTypeIcon(suggestion.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getSuggestionTypeStyle(suggestion.type)}`}
                      >
                        {getSuggestionTypeLabel(suggestion.type)}
                      </Badge>
                      {suggestion.confidence && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          置信度: {Math.round(suggestion.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {suggestion.message}
                    </p>
                    
                    {suggestion.originalText && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          原文本:
                        </div>
                        <div className="text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded border-l-2 border-red-300 dark:border-red-600">
                          {suggestion.originalText}
                        </div>
                      </div>
                    )}
                    
                    {suggestion.suggestedText && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          建议修改:
                        </div>
                        <div className="text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded border-l-2 border-green-300 dark:border-green-600">
                          {suggestion.suggestedText}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {suggestion.category && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.category}
                          </Badge>
                        )}
                        {suggestion.position && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            位置: {suggestion.position.start}-{suggestion.position.end}
                          </span>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplySuggestion(suggestion)}
                        className="text-xs"
                      >
                        应用
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {suggestions.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            暂无建议
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            点击上方按钮获取AI写作建议
          </p>
        </div>
      )}
    </div>
  );
}

export default WritingSuggestions;