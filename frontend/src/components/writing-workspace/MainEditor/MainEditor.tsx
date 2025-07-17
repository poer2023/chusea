/**
 * Enhanced Main Editor Component
 * 
 * Integrates with AI-powered text selection system and floating toolbar
 * for advanced writing assistance and interaction optimization.
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { FloatingToolbar } from '@/components/writing-workspace/FloatingToolbar/FloatingToolbar';
import { TextSelectionManager, TextSelectionInfo } from '@/lib/editor/text-selection';
import { AIActionManager, AIAction, AIActionResult } from '@/lib/ai/text-actions';
import { cn } from '@/lib/utils';

interface MainEditorProps {
  /** Initial content */
  content?: string;
  /** Content change handler */
  onChange?: (content: string) => void;
  /** Selection change handler */
  onSelectionChange?: (selection: { from: number; to: number; text: string }) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Custom className */
  className?: string;
  /** Enable AI floating toolbar */
  enableAIToolbar?: boolean;
  /** Enable text selection features */
  enableTextSelection?: boolean;
  /** Enable drag and drop */
  enableDragDrop?: boolean;
  /** Enable gesture support */
  enableGestures?: boolean;
  /** Editor configuration */
  config?: {
    /** Auto-save interval in ms */
    autoSaveInterval?: number;
    /** Enable spell check */
    spellCheck?: boolean;
    /** Enable grammar check */
    grammarCheck?: boolean;
    /** Maximum content length */
    maxLength?: number;
    /** Enable collaborative features */
    collaborative?: boolean;
  };
  /** Callback when AI action is executed */
  onAIActionExecuted?: (action: AIAction, result: AIActionResult) => void;
  /** Callback when editor is ready */
  onEditorReady?: (editor: Editor) => void;
}

interface EditorState {
  /** Current editor instance */
  editor: Editor | null;
  /** Current selection info */
  selection: TextSelectionInfo | null;
  /** Whether AI toolbar is visible */
  toolbarVisible: boolean;
  /** Active interactions */
  activeInteractions: Set<string>;
  /** Editor analytics */
  analytics: {
    /** Word count */
    wordCount: number;
    /** Character count */
    charCount: number;
    /** Time spent writing */
    timeSpent: number;
    /** Actions used */
    actionsUsed: number;
  };
}

export const MainEditor: React.FC<MainEditorProps> = ({
  content = '',
  onChange,
  onSelectionChange,
  placeholder = 'Start writing...',
  className,
  enableAIToolbar = true,
  enableTextSelection = true,
  enableDragDrop = true,
  enableGestures = true,
  config = {},
  onAIActionExecuted,
  onEditorReady,
}) => {
  // State management
  const [editorState, setEditorState] = useState<EditorState>({
    editor: null,
    selection: null,
    toolbarVisible: false,
    activeInteractions: new Set(),
    analytics: {
      wordCount: 0,
      charCount: 0,
      timeSpent: 0,
      actionsUsed: 0,
    },
  });

  // Refs for managers
  const selectionManagerRef = useRef<TextSelectionManager | null>(null);
  const actionManagerRef = useRef<AIActionManager | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const editorRef = useRef<Editor | null>(null);

  // Handle editor creation
  const handleEditorCreate = useCallback((editor: Editor) => {
    editorRef.current = editor;
    setEditorState(prev => ({ ...prev, editor }));

    // Initialize selection manager
    if (enableTextSelection) {
      selectionManagerRef.current = new TextSelectionManager(editor);
      
      // Subscribe to selection changes
      selectionManagerRef.current.onSelectionChange((selection) => {
        setEditorState(prev => ({ 
          ...prev, 
          selection,
          toolbarVisible: enableAIToolbar && selection !== null,
        }));

        // Legacy callback for backward compatibility
        if (selection && onSelectionChange) {
          onSelectionChange({
            from: selection.from,
            to: selection.to,
            text: selection.text,
          });
        }
      });
    }

    // Initialize AI action manager
    if (enableAIToolbar) {
      actionManagerRef.current = new AIActionManager(editor);
    }

    // Enable drag and drop
    if (enableDragDrop) {
      enableDragAndDrop(editor);
    }

    // Enable gestures
    if (enableGestures) {
      enableGestureSupport(editor);
    }

    // Setup auto-save
    if (config.autoSaveInterval) {
      setupAutoSave(editor, config.autoSaveInterval);
    }

    // Setup content limits
    if (config.maxLength) {
      setupContentLimits(editor, config.maxLength);
    }

    onEditorReady?.(editor);
  }, [enableTextSelection, enableAIToolbar, enableDragDrop, enableGestures, config, onSelectionChange, onEditorReady]);

  // Handle content changes
  const handleEditorChange = useCallback((newContent: string) => {
    const wordCount = newContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = newContent.length;
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    setEditorState(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        wordCount,
        charCount,
        timeSpent,
      },
    }));

    onChange?.(newContent);
  }, [onChange]);

  // Handle AI action execution
  const handleAIActionExecuted = useCallback((action: AIAction, result: AIActionResult) => {
    setEditorState(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        actionsUsed: prev.analytics.actionsUsed + 1,
      },
    }));

    onAIActionExecuted?.(action, result);
  }, [onAIActionExecuted]);

  // Handle toolbar visibility changes
  const handleToolbarVisibilityChange = useCallback((visible: boolean) => {
    setEditorState(prev => ({ ...prev, toolbarVisible: visible }));
  }, []);

  // Enable drag and drop functionality
  const enableDragAndDrop = useCallback((editor: Editor) => {
    const editorElement = editor.view.dom;

    const handleDragStart = (event: DragEvent) => {
      if (!editorState.selection) return;

      const { selection } = editorState;
      event.dataTransfer?.setData('text/plain', selection.text);
      event.dataTransfer?.setData('text/html', selection.text);

      setEditorState(prev => ({
        ...prev,
        activeInteractions: new Set([...prev.activeInteractions, 'drag']),
      }));
    };

    const handleDragEnd = () => {
      setEditorState(prev => ({
        ...prev,
        activeInteractions: new Set([...prev.activeInteractions].filter(i => i !== 'drag')),
      }));
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      
      const text = event.dataTransfer?.getData('text/plain');
      if (text) {
        const coords = editor.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        
        if (coords) {
          editor.chain().focus().insertContentAt(coords.pos, text).run();
        }
      }
    };

    editorElement.addEventListener('dragstart', handleDragStart);
    editorElement.addEventListener('dragend', handleDragEnd);
    editorElement.addEventListener('drop', handleDrop);
    editorElement.addEventListener('dragover', (e) => e.preventDefault());

    return () => {
      editorElement.removeEventListener('dragstart', handleDragStart);
      editorElement.removeEventListener('dragend', handleDragEnd);
      editorElement.removeEventListener('drop', handleDrop);
      editorElement.removeEventListener('dragover', (e) => e.preventDefault());
    };
  }, [editorState.selection]);

  // Enable gesture support
  const enableGestureSupport = useCallback((editor: Editor) => {
    const editorElement = editor.view.dom;
    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchStartTime = Date.now();
        touchStartPos = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length === 1) {
        const touchEndTime = Date.now();
        const touchEndPos = {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        };

        const duration = touchEndTime - touchStartTime;
        const distance = Math.sqrt(
          Math.pow(touchEndPos.x - touchStartPos.x, 2) +
          Math.pow(touchEndPos.y - touchStartPos.y, 2)
        );

        // Long press gesture
        if (duration > 500 && distance < 10) {
          handleLongPress(touchEndPos);
        }

        // Swipe gesture
        if (duration < 300 && distance > 50) {
          handleSwipe(touchStartPos, touchEndPos);
        }
      }
    };

    const handleLongPress = (position: { x: number; y: number }) => {
      const coords = editor.view.posAtCoords({ left: position.x, top: position.y });
      if (coords && selectionManagerRef.current) {
        selectionManagerRef.current.selectWordAt(coords.pos);
      }
    };

    const handleSwipe = (start: { x: number; y: number }, end: { x: number; y: number }) => {
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe right - redo
          editor.chain().focus().redo().run();
        } else {
          // Swipe left - undo
          editor.chain().focus().undo().run();
        }
      }
    };

    editorElement.addEventListener('touchstart', handleTouchStart);
    editorElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      editorElement.removeEventListener('touchstart', handleTouchStart);
      editorElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Setup auto-save
  const setupAutoSave = useCallback((editor: Editor, interval: number) => {
    const autoSaveInterval = setInterval(() => {
      const content = editor.getHTML();
      // Auto-save logic would go here
      console.log('Auto-saving content:', content);
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, []);

  // Setup content limits
  const setupContentLimits = useCallback((editor: Editor, maxLength: number) => {
    const checkLength = () => {
      const text = editor.getText();
      if (text.length > maxLength) {
        // Truncate content if it exceeds the limit
        const truncated = text.substring(0, maxLength);
        editor.commands.setContent(truncated);
      }
    };

    editor.on('update', checkLength);
    
    return () => {
      editor.off('update', checkLength);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editorState.editor) return;

      // Custom shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            // Quick action menu
            event.preventDefault();
            if (selectionManagerRef.current) {
              const selection = selectionManagerRef.current.getCurrentSelection();
              if (selection) {
                setEditorState(prev => ({ ...prev, toolbarVisible: true }));
              }
            }
            break;
          case 'e':
            // Expand selection
            event.preventDefault();
            if (selectionManagerRef.current) {
              selectionManagerRef.current.extendSelection('right', 10);
            }
            break;
          case 'w':
            // Select word
            event.preventDefault();
            if (selectionManagerRef.current) {
              const pos = editorState.editor.state.selection.from;
              selectionManagerRef.current.selectWordAt(pos);
            }
            break;
          case 'l':
            // Select line/paragraph
            event.preventDefault();
            if (selectionManagerRef.current) {
              const pos = editorState.editor.state.selection.from;
              selectionManagerRef.current.selectParagraphAt(pos);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorState.editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      selectionManagerRef.current?.destroy();
      actionManagerRef.current?.destroy();
    };
  }, []);

  return (
    <div className={cn('main-editor', 'h-full flex flex-col relative', className)}>
      {/* Editor Container */}
      <div className="flex-1 overflow-hidden">
        <RichTextEditor
          content={content}
          onChange={handleEditorChange as any}
          // onSelectionChange={handleEditorChange as any}
          placeholder={placeholder}
          className="h-full"
          // showMenuBar={false}
          // showBubbleMenu={true}
          // showFloatingMenu={false} // Disable default floating menu
          onCreate={handleEditorCreate}
          // spellCheck={config.spellCheck}
        />
      </div>

      {/* AI-Powered Floating Toolbar */}
      {enableAIToolbar && editorState.editor && (
        <FloatingToolbar
          editor={editorState.editor}
          visible={editorState.toolbarVisible}
          onActionExecuted={handleAIActionExecuted}
          onVisibilityChange={handleToolbarVisibilityChange}
        />
      )}

      {/* Editor Analytics (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Words: {editorState.analytics.wordCount}</div>
          <div>Chars: {editorState.analytics.charCount}</div>
          <div>Time: {editorState.analytics.timeSpent}s</div>
          <div>Actions: {editorState.analytics.actionsUsed}</div>
          {editorState.activeInteractions.size > 0 && (
            <div>Active: {Array.from(editorState.activeInteractions).join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
};