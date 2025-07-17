/**
 * AIWritingAssistant - AI写作助手面板
 * 提供内容生成、改进、建议等AI辅助功能
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/components/toast';
import { ContentGenerator } from './ContentGenerator';
import { WritingSuggestions } from './WritingSuggestions';
import { WritingSuggestion } from '@/types/api';

interface SimpleWritingRequest {
  prompt: string;
  mode?: string;
  context?: string;
  documentId?: string;
}

interface AIWritingAssistantProps {
  content: string;
  selectedText?: string;
  onInsertText: (text: string) => void;
  onReplaceText: (oldText: string, newText: string) => void;
  documentId: string;
  className?: string;
}

type TabType = 'generate' | 'improve' | 'suggestions' | 'convert';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function AIWritingAssistant({
  content,
  selectedText,
  onInsertText,
  onReplaceText,
  documentId,
  className = ''
}: AIWritingAssistantProps) {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [improvedText, setImprovedText] = useState<string>('');
  const [convertedText, setConvertedText] = useState<string>('');

  // 标签配置
  const tabs: Tab[] = [
    {
      id: 'generate',
      label: '内容生成',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      description: '根据提示生成新内容'
    },
    {
      id: 'improve',
      label: '内容改进',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: '改进和优化现有文本'
    },
    {
      id: 'suggestions',
      label: '写作建议',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: '获取智能写作建议'
    },
    {
      id: 'convert',
      label: '格式转换',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      description: '转换写作风格和格式'
    }
  ];

  // 改进文本
  const handleImproveText = useCallback(async (textToImprove: string, mode: string = 'general') => {
    if (!textToImprove.trim()) {
      toast.error('请先选择要改进的文本');
      return;
    }

    setIsLoading(true);
    try {
      const request: SimpleWritingRequest = {
        prompt: textToImprove,
        mode,
        context: content,
        documentId
      };

      const response = await apiClient.improveWriting(request as any) as { content: string; };
      setImprovedText(response.content);
      toast.success('文本改进完成');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Text improvement failed:', error);
      }
      toast.error('文本改进失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [content, documentId]);

  // 获取写作建议
  const handleGetSuggestions = useCallback(async (mode: string = 'general') => {
    if (!content.trim()) {
      toast.error('请先输入一些内容');
      return;
    }

    setIsLoading(true);
    try {
      const suggestions = await apiClient.getWritingSuggestions(content, mode);
      setSuggestions(suggestions as any);
      toast.success('获取建议成功');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Get suggestions failed:', error);
      }
      toast.error('获取建议失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  // 转换文本格式
  const handleConvertText = useCallback(async (textToConvert: string, targetMode: string) => {
    if (!textToConvert.trim()) {
      toast.error('请先选择要转换的文本');
      return;
    }

    setIsLoading(true);
    try {
      const request: SimpleWritingRequest = {
        prompt: textToConvert,
        mode: targetMode,
        context: content,
        documentId
      };

      const response = await apiClient.convertWritingMode(request as any) as { content: string; };
      setConvertedText(response.content);
      toast.success('格式转换完成');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Text conversion failed:', error);
      }
      toast.error('格式转换失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [content, documentId]);

  // 应用改进建议
  const handleApplyImprovement = useCallback(() => {
    if (!improvedText) return;

    if (selectedText) {
      onReplaceText(selectedText, improvedText);
    } else {
      onInsertText(improvedText);
    }

    setImprovedText('');
    toast.success('改进内容已应用');
  }, [improvedText, selectedText, onReplaceText, onInsertText]);

  // 应用转换结果
  const handleApplyConversion = useCallback(() => {
    if (!convertedText) return;

    if (selectedText) {
      onReplaceText(selectedText, convertedText);
    } else {
      onInsertText(convertedText);
    }

    setConvertedText('');
    toast.success('转换内容已应用');
  }, [convertedText, selectedText, onReplaceText, onInsertText]);

  // 应用建议
  const handleApplySuggestion = useCallback((suggestion: WritingSuggestion) => {
    if (suggestion.type === 'replacement' && suggestion.originalText && suggestion.suggestedText) {
      onReplaceText(suggestion.originalText, suggestion.suggestedText);
    } else if (suggestion.suggestedText) {
      onInsertText(suggestion.suggestedText);
    }

    toast.success('建议已应用');
  }, [onReplaceText, onInsertText]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <ContentGenerator
            onInsertText={onInsertText}
            context={content}
            documentId={documentId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );

      case 'improve':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                文本改进
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {selectedText ? '将改进您选中的文本' : '选择文本后进行改进，或改进整个文档'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleImproveText(selectedText || content, 'clarity')}
                disabled={isLoading}
              >
                提高清晰度
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleImproveText(selectedText || content, 'conciseness')}
                disabled={isLoading}
              >
                增强简洁性
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleImproveText(selectedText || content, 'grammar')}
                disabled={isLoading}
              >
                语法检查
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleImproveText(selectedText || content, 'style')}
                disabled={isLoading}
              >
                风格优化
              </Button>
            </div>

            {improvedText && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    改进建议
                  </h4>
                  <Button
                    size="sm"
                    onClick={handleApplyImprovement}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    应用
                  </Button>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                  {improvedText}
                </div>
              </Card>
            )}
          </div>
        );

      case 'suggestions':
        return (
          <WritingSuggestions
            content={content}
            suggestions={suggestions}
            onApplySuggestion={handleApplySuggestion}
            onGetSuggestions={handleGetSuggestions}
            isLoading={isLoading}
          />
        );

      case 'convert':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                格式转换
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {selectedText ? '转换选中文本的格式' : '选择文本后进行格式转换'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConvertText(selectedText || content, 'formal')}
                disabled={isLoading || !selectedText}
              >
                转为正式文体
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConvertText(selectedText || content, 'casual')}
                disabled={isLoading || !selectedText}
              >
                转为口语化
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConvertText(selectedText || content, 'academic')}
                disabled={isLoading || !selectedText}
              >
                转为学术文体
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConvertText(selectedText || content, 'summary')}
                disabled={isLoading || !selectedText}
              >
                生成摘要
              </Button>
            </div>

            {convertedText && (
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                    转换结果
                  </h4>
                  <Button
                    size="sm"
                    onClick={handleApplyConversion}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    应用
                  </Button>
                </div>
                <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {convertedText}
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* 标签头部 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <Tooltip key={tab.id} content={tab.description}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">AI处理中...</span>
            </div>
          </div>
        )}

        {!isLoading && renderTabContent()}
      </div>

      {/* 状态信息 */}
      {selectedText && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            已选择 {selectedText.length} 个字符的文本
          </div>
        </div>
      )}
    </div>
  );
}

export default AIWritingAssistant;