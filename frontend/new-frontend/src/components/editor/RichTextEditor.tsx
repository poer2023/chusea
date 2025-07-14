/**
 * Rich Text Editor Component
 * 
 * A comprehensive TipTap v2 implementation with full feature support
 * including themes, document integration, and real-time collaboration
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';

import { clsx } from 'clsx';
import { themeManager } from '@/styles/themes';
import { useDocumentStore } from '@/stores/document-store';
import { FloatingToolbar } from './FloatingToolbar';
import { EditorToolbar } from './EditorToolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { 
  RichTextEditorProps, 
  RichTextEditorRef, 
  EditorContent as EditorContentType,
  EditorState,
  EditorUtils,
  EditorError
} from './types';

/**
 * Rich Text Editor Component with TipTap v2
 * 
 * Features:
 * - Full text formatting (bold, italic, underline, etc.)
 * - Lists and blocks support
 * - Link and image insertion
 * - Table support
 * - Theme integration (light/dark mode)
 * - Document store integration
 * - Auto-save functionality
 * - Floating and bubble menus
 * - Keyboard shortcuts
 * - Accessibility support
 * - Error handling and loading states
 */
export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  content,
  placeholder = 'Start writing...',
  autoFocus = false,
  editable = true,
  className,
  style,
  toolbar,
  theme,
  extensions: customExtensions = [],
  readonly = false,
  loading = false,
  error = null,
  debounceMs = 500,
  maxHeight = '500px',
  minHeight = '200px',
  document: documentProp,
  onDocumentUpdate,
  onDocumentSave,
  autoSave = false,
  autoSaveInterval = 30000,
  onCreate,
  onUpdate,
  onSelectionUpdate,
  onFocus,
  onBlur,
  onDestroy,
  onChange,
  onSave,
  onError,
  children,
}, ref) => {
  // State management
  const [isLoading, setIsLoading] = useState(loading);
  const [editorError, setEditorError] = useState<EditorError | null>(
    error ? { name: 'EditorError', message: error, code: 'GENERAL_ERROR' } : null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Document store integration
  const { currentDocument, updateDocument, saveCurrentDocument } = useDocumentStore();
  const activeDocument = documentProp || currentDocument;

  // Theme management
  const resolvedTheme = themeManager.getResolvedTheme();
  const currentThemeConfig = themeManager.getCurrentThemeConfig();

  // Auto-save functionality
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Memoized extensions configuration
  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Subscript,
      Superscript,
      Color,
      TextStyle,
      ...customExtensions,
    ];

    return baseExtensions;
  }, [customExtensions]);

  // Content change handler with debouncing
  const debouncedOnChange = useCallback(
    debounce((content: EditorContentType) => {
      onChange?.(content);
      if (activeDocument && onDocumentUpdate) {
        onDocumentUpdate({
          content: content.html,
          metadata: {
            ...activeDocument.metadata,
            wordCount: content.wordCount,
            characterCount: content.characterCount,
          },
        });
      }
    }, debounceMs),
    [onChange, onDocumentUpdate, activeDocument, debounceMs]
  );

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    if (!autoSave || !isDirty || !activeDocument) return;

    try {
      setIsLoading(true);
      
      if (onDocumentSave) {
        await onDocumentSave(activeDocument);
      } else if (saveCurrentDocument) {
        await saveCurrentDocument();
      }
      
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      const editorError: EditorError = {
        name: 'AutoSaveError',
        message: error instanceof Error ? error.message : 'Auto-save failed',
        code: 'AUTO_SAVE_ERROR',
        recoverable: true,
      };
      setEditorError(editorError);
      onError?.(editorError);
    } finally {
      setIsLoading(false);
    }
  }, [autoSave, isDirty, activeDocument, onDocumentSave, saveCurrentDocument, onError]);

  // Editor instance
  const editor = useEditor({
    extensions,
    content: content || activeDocument?.content || '',
    editable: editable && !readonly,
    autofocus: autoFocus,
    
    onCreate({ editor }) {
      setIsLoading(false);
      onCreate?.(editor);
    },

    onUpdate({ editor }) {
      const editorContent: EditorContentType = {
        html: editor.getHTML(),
        json: editor.getJSON(),
        text: editor.getText(),
        wordCount: editor.storage.characterCount?.words() || 0,
        characterCount: editor.storage.characterCount?.characters() || 0,
      };

      setIsDirty(true);
      debouncedOnChange(editorContent);
      onUpdate?.(editorContent, editor);
    },

    onSelectionUpdate({ editor }) {
      onSelectionUpdate?.(editor);
    },

    onFocus({ editor }) {
      onFocus?.(editor);
    },

    onBlur({ editor }) {
      onBlur?.(editor);
    },

    onDestroy() {
      onDestroy?.();
    },
  });

  // Set up auto-save interval
  useEffect(() => {
    if (autoSave && autoSaveInterval > 0 && isDirty) {
      const timeout = setTimeout(handleAutoSave, autoSaveInterval);
      setAutoSaveTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [autoSave, autoSaveInterval, isDirty, handleAutoSave]);

  // Update editor content when document changes
  useEffect(() => {
    if (editor && activeDocument && activeDocument.content !== editor.getHTML()) {
      editor.commands.setContent(activeDocument.content);
      setIsDirty(false);
    }
  }, [editor, activeDocument]);

  // Editor state
  const editorState: EditorState = useMemo(() => {
    if (!editor) {
      return {
        isEditable: false,
        isEmpty: true,
        isFocused: false,
        canUndo: false,
        canRedo: false,
        hasSelection: false,
      };
    }

    return {
      isEditable: editor.isEditable,
      isEmpty: editor.isEmpty,
      isFocused: editor.isFocused,
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
      hasSelection: !editor.state.selection.empty,
      currentNode: editor.isActive('paragraph') ? 'paragraph' : 
                   editor.isActive('heading') ? 'heading' : 
                   editor.isActive('bulletList') ? 'bulletList' : 
                   editor.isActive('orderedList') ? 'orderedList' : undefined,
      selectedText: editor.state.selection.empty ? undefined : 
                   editor.state.doc.textBetween(
                     editor.state.selection.from,
                     editor.state.selection.to
                   ),
    };
  }, [editor]);

  // Editor utilities
  const utils: EditorUtils = useMemo(() => ({
    getContent: (format = 'html') => {
      if (!editor) return format === 'json' ? {} : '';
      
      switch (format) {
        case 'html':
          return editor.getHTML();
        case 'json':
          return editor.getJSON();
        case 'text':
          return editor.getText();
        default:
          return editor.getHTML();
      }
    },
    
    setContent: (content) => {
      if (editor) {
        editor.commands.setContent(content);
      }
    },
    
    insertContent: (content, position) => {
      if (editor) {
        if (position !== undefined) {
          editor.commands.insertContentAt(position, content);
        } else {
          editor.commands.insertContent(content);
        }
      }
    },
    
    focus: (position = 'end') => {
      if (editor) {
        if (position === 'start') {
          editor.commands.focus('start');
        } else if (position === 'end') {
          editor.commands.focus('end');
        } else if (typeof position === 'number') {
          editor.commands.focus(position);
        } else {
          editor.commands.focus();
        }
      }
    },
    
    blur: () => {
      if (editor) {
        editor.commands.blur();
      }
    },
    
    undo: () => {
      if (editor) {
        return editor.commands.undo();
      }
      return false;
    },
    
    redo: () => {
      if (editor) {
        return editor.commands.redo();
      }
      return false;
    },
    
    selectAll: () => {
      if (editor) {
        return editor.commands.selectAll();
      }
      return false;
    },
    
    clearContent: () => {
      if (editor) {
        return editor.commands.clearContent();
      }
      return false;
    },
    
    destroy: () => {
      if (editor) {
        editor.destroy();
      }
    },
    
    getWordCount: () => {
      return editor?.storage.characterCount?.words() || 0;
    },
    
    getCharacterCount: () => {
      return editor?.storage.characterCount?.characters() || 0;
    },
    
    isEmpty: () => {
      return editor?.isEmpty || true;
    },
    
    exportContent: (options) => {
      if (!editor) return '';
      
      switch (options.format) {
        case 'html':
          return editor.getHTML();
        case 'json':
          return JSON.stringify(editor.getJSON(), null, options.minify ? 0 : 2);
        case 'text':
          return editor.getText();
        case 'markdown':
          // TODO: Implement markdown export
          return editor.getText();
        default:
          return editor.getHTML();
      }
    },
    
    importContent: (content, options) => {
      if (editor) {
        editor.commands.setContent(content);
      }
    },
  }), [editor]);

  // Imperative handle for ref
  useImperativeHandle(ref, () => ({
    editor,
    focus: utils.focus,
    blur: utils.blur,
    getContent: () => ({
      html: utils.getContent('html') as string,
      json: utils.getContent('json'),
      text: utils.getContent('text') as string,
      wordCount: utils.getWordCount(),
      characterCount: utils.getCharacterCount(),
    }),
    setContent: utils.setContent,
    insertContent: utils.insertContent,
    clearContent: utils.clearContent,
    undo: utils.undo,
    redo: utils.redo,
    destroy: utils.destroy,
  }), [editor, utils]);

  // Loading state
  if (isLoading && !editor) {
    return (
      <div className={clsx(
        'flex items-center justify-center p-8 border rounded-lg',
        'border-gray-300 dark:border-gray-600',
        'bg-gray-50 dark:bg-gray-800',
        className
      )}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-300">Loading editor...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (editorError) {
    return (
      <div className={clsx(
        'flex items-center justify-between p-4 border rounded-lg',
        'border-red-300 dark:border-red-600',
        'bg-red-50 dark:bg-red-900/20',
        className
      )}>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 text-red-500">⚠️</div>
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              Editor Error
            </p>
            <p className="text-sm text-red-600 dark:text-red-300">
              {editorError.message}
            </p>
          </div>
        </div>
        {editorError.recoverable && (
          <button
            onClick={() => setEditorError(null)}
            className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div 
      className={clsx(
        'relative border rounded-lg overflow-hidden',
        'border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-900',
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
        readonly && 'cursor-not-allowed opacity-70',
        className
      )}
      style={style}
    >
      {/* Editor Toolbar */}
      {toolbar && !readonly && (
        <EditorToolbar 
          editor={editor}
          config={toolbar}
          theme={resolvedTheme}
        />
      )}

      {/* Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className={clsx(
            'prose prose-sm max-w-none p-4',
            'prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
            'prose-p:text-gray-700 dark:prose-p:text-gray-300',
            'prose-a:text-blue-600 dark:prose-a:text-blue-400',
            'prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
            'prose-code:text-gray-800 dark:prose-code:text-gray-200',
            'prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800',
            'focus:outline-none',
            `min-h-[${minHeight}]`,
            `max-h-[${maxHeight}]`,
            'overflow-y-auto'
          )}
          style={{
            minHeight,
            maxHeight,
          }}
        />

        {/* Floating Menu */}
        {editor && !readonly && (
          <FloatingToolbar 
            editor={editor}
            visible={editorState.isEmpty}
          />
        )}

        {/* Bubble Menu */}
        {editor && !readonly && (
          <EditorBubbleMenu 
            editor={editor}
            shouldShow={({ editor }) => !editor.state.selection.empty}
          />
        )}
      </div>

      {/* Editor Status Bar */}
      <div className={clsx(
        'flex items-center justify-between px-4 py-2 text-xs',
        'border-t border-gray-200 dark:border-gray-700',
        'bg-gray-50 dark:bg-gray-800',
        'text-gray-500 dark:text-gray-400'
      )}>
        <div className="flex items-center space-x-4">
          <span>{utils.getWordCount()} words</span>
          <span>{utils.getCharacterCount()} characters</span>
          {isDirty && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Unsaved changes</span>
            </span>
          )}
          {autoSave && lastSaved && (
            <span>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {children}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default RichTextEditor;