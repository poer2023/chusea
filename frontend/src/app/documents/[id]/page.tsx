'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocumentEditor } from '@/components/editor/DocumentEditor';
import { AIWritingAssistant } from '@/components/ai/AIWritingAssistant';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { useDocumentStore } from '@/stores/document-store';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/components/toast';
import { Document } from '@/types/document';

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const [id, setId] = useState<string>('');
  const router = useRouter();
  
  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);
  
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { setCurrentDocument } = useDocumentStore();

  // 加载文档
  useEffect(() => {
    if (!id) return;
    
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const doc = await apiClient.getDocument(id);
        setDocumentData(doc as unknown as Document);
        setCurrentDocument(doc as unknown as Document);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load document:', error);
        }
        setError('加载文档失败');
        toast.error('加载文档失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [id, setCurrentDocument]);

  // 处理文本选择
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  }, []);

  // 监听文本选择
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('selectionchange', handleTextSelection);
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('selectionchange', handleTextSelection);
      }
    };
  }, [handleTextSelection]);

  // 插入文本
  const handleInsertText = useCallback((text: string) => {
    // 这里应该与编辑器组件通信
    // 暂时通过事件或状态管理来实现
    if (process.env.NODE_ENV === 'development') {
      console.log('Insert text:', text);
    }
    // TODO: Implement text insertion logic
  }, []);

  // 替换文本
  const handleReplaceText = useCallback((oldText: string, newText: string) => {
    // 这里应该与编辑器组件通信
    // 暂时通过事件或状态管理来实现
    if (process.env.NODE_ENV === 'development') {
      console.log('Replace text:', oldText, '->', newText);
    }
    // TODO: Implement text replacement logic
  }, []);

  // 保存文档
  const handleSave = useCallback(async (updatedDocument: Document) => {
    setDocumentData(updatedDocument);
  }, []);

  // 内容变化
  const handleContentChange = useCallback(() => {
    // 可以在这里添加实时保存逻辑
  }, []);

  // 分享文档
  const handleShare = useCallback(async () => {
    try {
      // 这里应该实现分享逻辑
      await navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制到剪贴板');
    } catch {
      toast.error('分享失败');
    }
  }, []);

  // 切换只读模式
  const handleToggleReadOnly = useCallback(() => {
    setIsReadOnly(!isReadOnly);
    toast.success(isReadOnly ? '已切换到编辑模式' : '已切换到只读模式');
  }, [isReadOnly]);

  // 导出文档
  const handleExport = useCallback(async () => {
    if (!documentData) return;
    
    try {
      const blob = new Blob([documentData.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentData.title}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('文档导出成功');
    } catch {
      toast.error('导出失败');
    }
  }, [documentData]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !documentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              文档加载失败
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error || '文档不存在或已被删除'}
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                返回
              </Button>
              <Button onClick={() => window.location.reload()}>
                重试
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/documents" className="hover:text-gray-700 dark:hover:text-gray-200">
              文档
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 dark:text-gray-100">{documentData.title}</span>
          </nav>
        </div>

        {/* 文档头部 */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {documentData.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>创建于 {new Date(documentData.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span>修改于 {new Date(documentData.updatedAt).toLocaleDateString()}</span>
                <span>·</span>
                <Badge variant={documentData.status === 'published' ? 'default' : 'secondary'}>
                  {documentData.status === 'published' ? '已发布' : '草稿'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tooltip content="切换只读模式">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleReadOnly}
                  className={isReadOnly ? 'bg-blue-50 text-blue-600' : ''}
                >
                  {isReadOnly ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </Button>
              </Tooltip>

              <Tooltip content="导出文档">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </Button>
              </Tooltip>

              <Tooltip content="分享文档">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </Button>
              </Tooltip>

              <Tooltip content="AI写作助手">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                  className={isAIAssistantOpen ? 'bg-blue-50 text-blue-600' : ''}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex space-x-6">
          {/* 编辑器区域 */}
          <div className="flex-1">
            <DocumentEditor
              document={documentData}
              onSave={handleSave}
              onContentChange={handleContentChange}
              readOnly={isReadOnly}
              className="h-[calc(100vh-200px)]"
            />
          </div>

          {/* AI助手侧边栏 */}
          {isAIAssistantOpen && (
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-6">
                <AIWritingAssistant
                  content={documentData.content}
                  selectedText={selectedText}
                  onInsertText={handleInsertText}
                  onReplaceText={handleReplaceText}
                  documentId={documentData.id}
                  className="h-[calc(100vh-200px)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}