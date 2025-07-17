'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Save, FileText, Clock, AlertCircle } from 'lucide-react';

export interface SimpleEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  className?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export interface WordCountStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  paragraphs: number;
}

export default function SimpleEditor({
  initialContent = '',
  onContentChange,
  onSave,
  className = '',
  readOnly = false,
  placeholder = '开始写作...',
}: SimpleEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState<WordCountStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    paragraphs: 0,
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const text = editor.getText();
      
      // 更新字数统计
      const stats = calculateWordCount(text);
      setWordCount(stats);
      
      // 触发内容变化回调
      onContentChange?.(content);
      
      // 自动保存
      if (onSave && !readOnly) {
        scheduleAutoSave(content);
      }
    },
  });

  const calculateWordCount = useCallback((text: string): WordCountStats => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      paragraphs,
    };
  }, []);

  const scheduleAutoSave = useCallback((content: string) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave(content, true);
    }, 2000); // 2秒后自动保存
  }, []);

  const handleSave = useCallback(async (content?: string, isAutoSave = false) => {
    if (!onSave || !editor) return;

    const contentToSave = content || editor.getHTML();
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      await onSave(contentToSave);
      
      if (!isAutoSave) {
        setLastSaved(new Date());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存失败';
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave]);

  const handleManualSave = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">文档编辑器</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {saveError && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{saveError}</span>
            </div>
          )}
          
          {lastSaved && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          {onSave && !readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
          )}
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 p-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none min-h-[300px]"
          placeholder={placeholder}
        />
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {wordCount.words} 字
          </Badge>
          <Badge variant="outline">
            {wordCount.characters} 字符
          </Badge>
          <Badge variant="outline">
            {wordCount.paragraphs} 段落
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-1 text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-sm">自动保存中...</span>
            </div>
          )}
          
          {!readOnly && (
            <span className="text-sm text-gray-500">
              实时保存已启用
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}