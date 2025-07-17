/**
 * ContentGenerator - 内容生成器组件
 * 提供基于AI的内容生成功能
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/components/toast';
import { WritingRequest } from '@/types/api';

interface ContentGeneratorProps {
  onInsertText: (text: string) => void;
  context: string;
  documentId: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface GenerationTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  mode: string;
  icon: React.ReactNode;
  category: string;
  placeholders?: string[];
}

interface GeneratedContent {
  text: string;
  mode: string;
  timestamp: Date;
}

export function ContentGenerator({
  onInsertText,
  context,
  documentId,
  isLoading,
  setIsLoading
}: ContentGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<GenerationTemplate | null>(null);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // 内容生成模板
  const templates: GenerationTemplate[] = [
    {
      id: 'intro',
      title: '引言段落',
      description: '生成文章的引言段落',
      prompt: '基于以下内容生成一个引人入胜的引言段落：{context}',
      mode: 'introduction',
      category: 'structure',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'conclusion',
      title: '结论段落',
      description: '生成文章的结论段落',
      prompt: '基于以下内容生成一个总结性的结论段落：{context}',
      mode: 'conclusion',
      category: 'structure',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'outline',
      title: '大纲生成',
      description: '生成文章大纲',
      prompt: '为以下主题生成详细的文章大纲：{custom_prompt}',
      mode: 'outline',
      category: 'structure',
      placeholders: ['请输入文章主题...'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 'expand',
      title: '内容扩展',
      description: '扩展现有段落',
      prompt: '详细扩展以下内容，使其更加丰富和具体：{context}',
      mode: 'expansion',
      category: 'enhancement',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )
    },
    {
      id: 'examples',
      title: '举例说明',
      description: '生成相关例子',
      prompt: '为以下内容生成3个具体的例子来说明：{context}',
      mode: 'examples',
      category: 'enhancement',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
        </svg>
      )
    },
    {
      id: 'transition',
      title: '过渡句',
      description: '生成段落间的过渡句',
      prompt: '为以下两个段落生成自然的过渡句：{context}',
      mode: 'transition',
      category: 'enhancement',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'questions',
      title: '提出问题',
      description: '生成相关问题',
      prompt: '基于以下内容生成5个深入思考的问题：{context}',
      mode: 'questions',
      category: 'creative',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'counterargument',
      title: '反驳观点',
      description: '生成反驳观点',
      prompt: '为以下观点生成可能的反驳观点及其论据：{context}',
      mode: 'counterargument',
      category: 'creative',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'summary',
      title: '内容摘要',
      description: '生成内容摘要',
      prompt: '为以下内容生成简洁的摘要：{context}',
      mode: 'summary',
      category: 'utility',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'keywords',
      title: '关键词提取',
      description: '提取关键词',
      prompt: '从以下内容中提取10个关键词：{context}',
      mode: 'keywords',
      category: 'utility',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    }
  ];

  // 分类配置
  const categories = [
    { id: 'all', label: '全部', count: templates.length },
    { id: 'structure', label: '结构', count: templates.filter(t => t.category === 'structure').length },
    { id: 'enhancement', label: '增强', count: templates.filter(t => t.category === 'enhancement').length },
    { id: 'creative', label: '创意', count: templates.filter(t => t.category === 'creative').length },
    { id: 'utility', label: '实用', count: templates.filter(t => t.category === 'utility').length }
  ];

  // 过滤模板
  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === activeCategory);

  // 生成内容
  const generateContent = useCallback(async (template: GenerationTemplate, prompt?: string) => {
    setIsLoading(true);
    try {
      let finalPrompt = template.prompt;
      
      // 替换占位符
      if (template.placeholders && prompt) {
        finalPrompt = finalPrompt.replace('{custom_prompt}', prompt);
      }
      finalPrompt = finalPrompt.replace('{context}', context || '当前文档内容');

      const request = {
        prompt: finalPrompt,
        mode: template.mode,
        context: context,
        documentId: documentId
      };

      const response = await apiClient.generateWriting(request as any) as { content: string; };
      
      const newContent: GeneratedContent = {
        text: response.content,
        mode: template.mode,
        timestamp: new Date()
      };

      setGeneratedContents(prev => [newContent, ...prev]);
      toast.success('内容生成成功');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Content generation failed:', error);
      }
      toast.error('内容生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [context, documentId, setIsLoading]);

  // 使用模板生成
  const handleTemplateGenerate = useCallback((template: GenerationTemplate) => {
    if (template.placeholders) {
      setSelectedTemplate(template);
      setCustomPrompt('');
    } else {
      generateContent(template);
    }
  }, [generateContent]);

  // 自定义提示生成
  const handleCustomGenerate = useCallback(async () => {
    if (!customPrompt.trim()) {
      toast.error('请输入生成提示');
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        prompt: customPrompt,
        mode: 'custom',
        context: context,
        documentId: documentId
      };

      const response = await apiClient.generateWriting(request as any) as { content: string; };
      
      const newContent: GeneratedContent = {
        text: response.content,
        mode: 'custom',
        timestamp: new Date()
      };

      setGeneratedContents(prev => [newContent, ...prev]);
      setCustomPrompt('');
      toast.success('内容生成成功');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Custom generation failed:', error);
      }
      toast.error('内容生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [customPrompt, context, documentId, setIsLoading]);

  // 应用生成的内容
  const handleApplyContent = useCallback((content: GeneratedContent) => {
    onInsertText(content.text);
    toast.success('内容已插入');
  }, [onInsertText]);

  return (
    <div className="space-y-4">
      {/* 自定义提示 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          自定义生成
        </h3>
        <div className="flex space-x-2">
          <Input
            placeholder="描述您想要生成的内容..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleCustomGenerate()}
            className="flex-1"
          />
          <Button
            onClick={handleCustomGenerate}
            disabled={isLoading || !customPrompt.trim()}
            size="sm"
          >
            生成
          </Button>
        </div>
      </div>

      {/* 分类过滤 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          快速模板
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* 模板网格 */}
      <div className="grid grid-cols-1 gap-2">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateGenerate(template)}
            disabled={isLoading}
            className="flex items-center space-x-3 p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
              {template.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {template.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {template.description}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
          </button>
        ))}
      </div>

      {/* 模板提示输入 */}
      {selectedTemplate && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedTemplate.title}
              </h4>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Input
              placeholder={selectedTemplate.placeholders?.[0] || '请输入...'}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && customPrompt.trim() && generateContent(selectedTemplate, customPrompt)}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={() => generateContent(selectedTemplate, customPrompt)}
                disabled={isLoading || !customPrompt.trim()}
              >
                生成
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 生成结果 */}
      {generatedContents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            生成结果
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {generatedContents.map((content, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {content.mode}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {content.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApplyContent(content)}
                    className="shrink-0"
                  >
                    插入
                  </Button>
                </div>
                
                <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {content.text}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {generatedContents.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            开始创作
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            选择模板或输入自定义提示来生成内容
          </p>
        </div>
      )}
    </div>
  );
}

export default ContentGenerator;