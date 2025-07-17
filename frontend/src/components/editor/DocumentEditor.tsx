/**
 * DocumentEditor - 主要的Markdown文档编辑器
 * 支持Markdown编辑、实时预览、自动保存、拖拽上传等功能
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useDocumentStore } from '@/stores/document-store';
import { apiClient } from '@/lib/api-client';
import { Document } from '@/types/document';
import { toast } from '@/lib/components/toast';
import { ToolBar } from './ToolBar';

interface DocumentEditorProps {
  document: Document;
  onSave?: (document: Document) => void;
  onContentChange?: (content: string) => void;
  className?: string;
  readOnly?: boolean;
}

interface EditorStats {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  readingTime: number; // 分钟
}

export function DocumentEditor({
  document,
  onSave,
  onContentChange,
  className = '',
  readOnly = false
}: DocumentEditorProps) {
  const [content, setContent] = useState(document.content || '');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [stats, setStats] = useState<EditorStats>({
    wordCount: 0,
    characterCount: 0,
    paragraphCount: 0,
    readingTime: 0
  });
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // 防抖的内容，用于自动保存
  const debouncedContent = useDebounce(content, 2000);

  const { updateDocument } = useDocumentStore();

  // 计算统计信息
  const calculateStats = useCallback((text: string): EditorStats => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const readingTime = Math.ceil(words.length / 200); // 假设每分钟读200词

    return {
      wordCount: words.length,
      characterCount: characters,
      paragraphCount: paragraphs.length,
      readingTime
    };
  }, []);

  // 内容变化处理
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
    setStats(calculateStats(newContent));
    onContentChange?.(newContent);
  }, [onContentChange, calculateStats]);

  // 自动保存
  useEffect(() => {
    if (!isDirty || readOnly) return;

    const saveDocument = async () => {
      if (debouncedContent === document.content) return;

      try {
        setIsSaving(true);
        
        const updateData: any = {
          title: document.title,
          content: debouncedContent,
          metadata: {
            ...document.metadata,
            wordCount: stats.wordCount,
            characterCount: stats.characterCount,
            lastModified: new Date().toISOString()
          }
        };

        const updatedDoc = await apiClient.updateDocument(document.id, updateData);
        updateDocument(document.id, updatedDoc as any);
        setLastSaved(new Date());
        setIsDirty(false);
        onSave?.(updatedDoc as any);
        
        toast.success('文档已自动保存');
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('自动保存失败');
      } finally {
        setIsSaving(false);
      }
    };

    saveDocument();
  }, [debouncedContent, document, stats, isDirty, readOnly, updateDocument, onSave]);

  // 手动保存
  const handleSave = useCallback(async () => {
    if (!isDirty || readOnly) return;

    try {
      setIsSaving(true);
      
      const updateData: any = {
        title: document.title,
        content,
        metadata: {
          ...document.metadata,
          wordCount: stats.wordCount,
          characterCount: stats.characterCount,
          lastModified: new Date().toISOString()
        }
      };

      const updatedDoc = await apiClient.updateDocument(document.id, updateData);
      updateDocument(document.id, updatedDoc as any);
      setLastSaved(new Date());
      setIsDirty(false);
      onSave?.(updatedDoc as any);
      
      toast.success('文档已保存');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [content, document, stats, isDirty, readOnly, updateDocument, onSave]);

  // 插入文本
  const insertText = useCallback((text: string) => {
    if (!textareaRef.current || readOnly) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = content.substring(0, start) + text + content.substring(end);
    handleContentChange(newContent);

    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [content, handleContentChange, readOnly]);

  // 文件上传处理
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (readOnly) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          // 图片上传
          const uploadResult = await apiClient.uploadFile(file, {
            purpose: 'document-image',
            documentId: document.id
          });
          
          const imageMarkdown = `![${file.name}](${uploadResult.url})`;
          insertText(imageMarkdown);
        } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
          // 文本文件插入
          const text = await file.text();
          insertText('\n\n' + text + '\n\n');
        }
      }
      
      toast.success('文件上传成功');
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('文件上传失败');
    } finally {
      setIsUploading(false);
    }
  }, [document.id, insertText, readOnly]);

  // 拖拽处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // 键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readOnly) return;

    // Ctrl/Cmd + S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }

    // Ctrl/Cmd + B 粗体
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertText('**粗体文本**');
    }

    // Ctrl/Cmd + I 斜体
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertText('*斜体文本*');
    }

    // Tab 缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('    ');
    }
  }, [handleSave, insertText, readOnly]);

  // 渲染Markdown预览
  const renderPreview = useCallback((markdown: string) => {
    // 简单的Markdown渲染（实际项目中应该使用专业的Markdown解析器）
    const html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img alt="$1" src="$2" style="max-width: 100%; height: auto;" />')
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>');

    return `<p>${html}</p>`;
  }, []);

  // 初始化统计
  useEffect(() => {
    setStats(calculateStats(content));
  }, [content, calculateStats]);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* 工具栏 */}
      <ToolBar
        onInsertText={insertText}
        onSave={handleSave}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        onUploadFile={() => fileInputRef.current?.click()}
        isPreviewMode={isPreviewMode}
        isSaving={isSaving}
        readOnly={readOnly}
      />

      {/* 编辑器主体 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑区域 */}
        {!isPreviewMode && (
          <div 
            className="flex-1 relative"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={readOnly ? '此文档为只读模式' : '开始编写您的文档...支持Markdown语法'}
              readOnly={readOnly}
              className="w-full h-full p-6 resize-none border-none outline-none text-gray-900 dark:text-gray-100 bg-transparent placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm leading-relaxed"
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            />

            {/* 拖拽提示 */}
            {dragCounterRef.current > 0 && !readOnly && (
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 flex items-center justify-center">
                <div className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                  释放以上传文件
                </div>
              </div>
            )}

            {/* 上传中提示 */}
            {isUploading && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>上传中...</span>
              </div>
            )}
          </div>
        )}

        {/* 预览区域 */}
        {isPreviewMode && (
          <div className="flex-1 overflow-auto">
            <div 
              className="p-6 prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100"
              dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            />
          </div>
        )}

        {/* 分屏模式 */}
        {!isPreviewMode && (
          <div className="hidden lg:block w-1/2 border-l border-gray-200 dark:border-gray-700 overflow-auto">
            <div 
              className="p-6 prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100"
              dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            />
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-6">
          <span>{stats.wordCount} 词</span>
          <span>{stats.characterCount} 字符</span>
          <span>{stats.paragraphCount} 段落</span>
          <span>预计阅读时间 {stats.readingTime} 分钟</span>
        </div>

        <div className="flex items-center space-x-4">
          {isDirty && !readOnly && (
            <span className="flex items-center space-x-1 text-orange-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>未保存</span>
            </span>
          )}
          
          {isSaving && (
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>保存中...</span>
            </span>
          )}

          {lastSaved && !isDirty && (
            <span className="text-green-600 dark:text-green-400">
              已保存 {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.md,.txt"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}

export default DocumentEditor;