/**
 * AI-Powered Floating Toolbar Component
 * 
 * Advanced floating toolbar with AI-powered text selection actions,
 * smart positioning, animations, and contextual suggestions.
 */

'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { TextSelectionInfo, SelectionContextAnalysis, TextSelectionManager } from '@/lib/editor/text-selection';
import { AIActionManager, AIAction, AIActionResult } from '@/lib/ai/text-actions';

// Icons (using emoji for now, would use proper icon library in production)
const ActionIcons = {
  'improve-writing': '✨',
  'fix-grammar': '📝',
  'summarize': '📄',
  'expand-text': '📈',
  'change-tone': '🎭',
  'translate': '🌍',
  'format-code': '💻',
  'explain-code': '💡',
  'create-outline': '📋',
  'fact-check': '🔍',
  'more': '⋯',
  'preview': '👁️',
  'apply': '✓',
  'cancel': '✕',
  'loading': '⏳',
} as const;

export interface FloatingToolbarProps {
  /** Editor instance */
  editor: Editor;
  /** Whether toolbar is visible */
  visible?: boolean;
  /** Toolbar positioning mode */
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  /** Maximum number of actions to show */
  maxActions?: number;
  /** Enable preview mode */
  enablePreview?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Callback when action is executed */
  onActionExecuted?: (action: AIAction, result: AIActionResult) => void;
  /** Callback when toolbar visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
}

interface ToolbarPosition {
  x: number;
  y: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface ActionPreview {
  action: AIAction;
  result: AIActionResult;
  isVisible: boolean;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  editor,
  visible = true,
  position = 'auto',
  maxActions = 6,
  enablePreview = true,
  animationDuration = 200,
  className,
  style,
  onActionExecuted,
  onVisibilityChange,
}) => {
  // State management
  const [isVisible, setIsVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0, placement: 'top' });
  const [currentSelection, setCurrentSelection] = useState<TextSelectionInfo | null>(null);
  const [contextAnalysis, setContextAnalysis] = useState<SelectionContextAnalysis | null>(null);
  const [availableActions, setAvailableActions] = useState<AIAction[]>([]);
  const [activeActions, setActiveActions] = useState<Set<string>>(new Set());
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Refs
  const toolbarRef = useRef<HTMLDivElement>(null);
  const selectionManagerRef = useRef<TextSelectionManager | null>(null);
  const actionManagerRef = useRef<AIActionManager | null>(null);
  const positionUpdateRef = useRef<number>(0);

  // Initialize managers
  useEffect(() => {
    if (editor) {
      selectionManagerRef.current = new TextSelectionManager(editor);
      actionManagerRef.current = new AIActionManager(editor);

      // Subscribe to selection changes
      const unsubscribe = selectionManagerRef.current.onSelectionChange((selection) => {
        setCurrentSelection(selection);
        
        if (selection) {
          const analysis = selectionManagerRef.current!.analyzeSelectionContext(selection);
          setContextAnalysis(analysis);
          
          const actions = actionManagerRef.current!.getActionsForContext(analysis);
          setAvailableActions(actions);
          
          updateToolbarPosition(selection);
          setIsVisible(true);
          onVisibilityChange?.(true);
        } else {
          setIsVisible(false);
          setActionPreview(null);
          onVisibilityChange?.(false);
        }
      });

      return () => {
        unsubscribe();
        selectionManagerRef.current?.destroy();
        actionManagerRef.current?.destroy();
      };
    }
  }, [editor]);

  // Update toolbar position based on selection
  const updateToolbarPosition = useCallback((selection: TextSelectionInfo) => {
    if (!selection.position.rect) return;

    const rect = selection.position.rect;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let x = rect.left + rect.width / 2;
    let y = rect.top;
    let placement: ToolbarPosition['placement'] = 'top';

    // Auto-positioning logic
    if (position === 'auto') {
      // Check if there's space above
      if (rect.top > 100) {
        y = rect.top - 10;
        placement = 'top';
      } else if (viewport.height - rect.bottom > 100) {
        y = rect.bottom + 10;
        placement = 'bottom';
      } else if (rect.left > 200) {
        x = rect.left - 10;
        y = rect.top + rect.height / 2;
        placement = 'left';
      } else if (viewport.width - rect.right > 200) {
        x = rect.right + 10;
        y = rect.top + rect.height / 2;
        placement = 'right';
      }
    } else {
      placement = position;
    }

    // Ensure toolbar stays within viewport
    const toolbarWidth = 300; // Approximate width
    const toolbarHeight = 50; // Approximate height

    if (x + toolbarWidth / 2 > viewport.width) {
      x = viewport.width - toolbarWidth / 2 - 10;
    }
    if (x - toolbarWidth / 2 < 0) {
      x = toolbarWidth / 2 + 10;
    }
    if (y + toolbarHeight > viewport.height) {
      y = viewport.height - toolbarHeight - 10;
    }
    if (y < 0) {
      y = 10;
    }

    setToolbarPosition({ x, y, placement });
  }, [position]);

  // Handle action execution
  const handleActionClick = useCallback(async (action: AIAction) => {
    if (!currentSelection || !contextAnalysis || !actionManagerRef.current) return;

    // Check if action is already active
    if (activeActions.has(action.id)) return;

    setActiveActions(prev => new Set([...prev, action.id]));

    try {
      const result = await actionManagerRef.current.executeAction(
        action.id,
        currentSelection,
        contextAnalysis
      );

      if (result.success && result.data?.text) {
        // Apply the result to the editor
        editor.chain()
          .focus()
          .deleteRange({ from: currentSelection.from, to: currentSelection.to })
          .insertContent(result.data.text)
          .run();
      }

      onActionExecuted?.(action, result);
    } catch (error) {
      console.error('Action execution failed:', error);
    } finally {
      setActiveActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.id);
        return newSet;
      });
    }
  }, [currentSelection, contextAnalysis, editor, activeActions, onActionExecuted]);

  // Handle action preview
  const handleActionPreview = useCallback(async (action: AIAction) => {
    if (!currentSelection || !contextAnalysis || !actionManagerRef.current || !enablePreview) return;

    try {
      const result = await actionManagerRef.current.getActionPreview(
        action.id,
        currentSelection,
        contextAnalysis
      );

      if (result.success && result.preview) {
        setActionPreview({
          action,
          result,
          isVisible: true,
        });
      }
    } catch (error) {
      console.error('Preview failed:', error);
    }
  }, [currentSelection, contextAnalysis, enablePreview]);

  // Handle preview apply
  const handlePreviewApply = useCallback(() => {
    if (!actionPreview || !currentSelection) return;

    const { result } = actionPreview;
    if (result.data?.text) {
      editor.chain()
        .focus()
        .deleteRange({ from: currentSelection.from, to: currentSelection.to })
        .insertContent(result.data.text)
        .run();
    }

    setActionPreview(null);
    onActionExecuted?.(actionPreview.action, result);
  }, [actionPreview, currentSelection, editor, onActionExecuted]);

  // Handle preview cancel
  const handlePreviewCancel = useCallback(() => {
    setActionPreview(null);
  }, []);

  // Visible actions (limited by maxActions)
  const visibleActions = useMemo(() => {
    if (showMoreActions) return availableActions;
    return availableActions.slice(0, maxActions);
  }, [availableActions, maxActions, showMoreActions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible || !currentSelection) return;

      // Handle action shortcuts
      availableActions.forEach((action, index) => {
        if (action.shortcut && event.key === action.shortcut && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          handleActionClick(action);
        }
      });

      // Handle preview shortcuts
      if (actionPreview) {
        if (event.key === 'Enter') {
          event.preventDefault();
          handlePreviewApply();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          handlePreviewCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentSelection, availableActions, actionPreview, handleActionClick, handlePreviewApply, handlePreviewCancel]);

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setActionPreview(null);
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Animation variants
  const toolbarVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: toolbarPosition.placement === 'top' ? 10 : -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: animationDuration / 1000,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: toolbarPosition.placement === 'top' ? 10 : -10,
      transition: {
        duration: animationDuration / 1000 / 2,
        ease: 'easeIn',
      },
    },
  };

  const actionVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // Render action button
  const renderActionButton = (action: AIAction, index: number) => {
    const isActive = activeActions.has(action.id);
    const icon = ActionIcons[action.id as keyof typeof ActionIcons] || action.icon;

    return (
      <motion.button
        key={action.id}
        variants={actionVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => handleActionClick(action)}
        onMouseEnter={() => enablePreview && handleActionPreview(action)}
        disabled={isActive}
        title={`${action.name} - ${action.description}`}
        className={clsx(
          'relative flex items-center justify-center p-2 rounded-md',
          'text-sm font-medium transition-all duration-200',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isActive && 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
        )}
      >
        {isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            {ActionIcons.loading}
          </motion.div>
        ) : (
          <span className="text-base">{typeof icon === 'string' ? icon : React.createElement(icon as any, { className: 'w-4 h-4' })}</span>
        )}
        
        {/* Action label */}
        <span className="ml-1 text-xs hidden sm:inline">{action.name}</span>
        
        {/* Keyboard shortcut */}
        {action.shortcut && (
          <span className="ml-1 text-xs opacity-60">
            ⌘{action.shortcut}
          </span>
        )}
      </motion.button>
    );
  };

  // Render preview
  const renderPreview = () => {
    if (!actionPreview || !actionPreview.isVisible) return null;

    const { action, result } = actionPreview;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={clsx(
          'absolute z-20 mt-2 p-3 rounded-lg shadow-lg border',
          'bg-white dark:bg-gray-800',
          'border-gray-200 dark:border-gray-600',
          'max-w-md min-w-[300px]',
          toolbarPosition.placement === 'top' ? 'top-full' : 'bottom-full'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {action.name} Preview
          </h4>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">
              {Math.round((result.preview?.confidence || 0) * 100)}% confidence
            </span>
          </div>
        </div>
        
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm">
          {result.preview?.text}
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={handlePreviewCancel}
            className={clsx(
              'px-3 py-1 text-sm rounded',
              'text-gray-600 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-gray-600',
              'focus:outline-none focus:ring-2 focus:ring-gray-500'
            )}
          >
            {ActionIcons.cancel} Cancel
          </button>
          <button
            onClick={handlePreviewApply}
            className={clsx(
              'px-3 py-1 text-sm rounded',
              'bg-blue-500 text-white',
              'hover:bg-blue-600',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            {ActionIcons.apply} Apply
          </button>
        </div>
      </motion.div>
    );
  };

  // Don't render if not visible or no selection
  if (!visible || !isVisible || !currentSelection) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        variants={toolbarVariants as any}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={clsx(
          'fixed z-10 flex items-center space-x-1 p-2 rounded-lg shadow-lg border',
          'bg-white dark:bg-gray-800',
          'border-gray-200 dark:border-gray-600',
          'backdrop-blur-sm',
          className
        )}
        style={{
          left: toolbarPosition.x,
          top: toolbarPosition.y,
          transform: 'translate(-50%, -100%)',
          ...style,
        }}
      >
        {/* Action buttons */}
        <motion.div
          className="flex items-center space-x-1"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {visibleActions.map(renderActionButton)}
          
          {/* More actions button */}
          {availableActions.length > maxActions && (
            <motion.button
              variants={actionVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className={clsx(
                'flex items-center justify-center p-2 rounded-md',
                'text-sm font-medium transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                showMoreActions && 'bg-gray-100 dark:bg-gray-700'
              )}
            >
              <span className="text-base">{ActionIcons.more}</span>
            </motion.button>
          )}
        </motion.div>

        {/* Context information */}
        {contextAnalysis && (
          <div className="ml-3 pl-3 border-l border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentSelection.metadata.wordCount} words • {contextAnalysis.content.style}
            </div>
          </div>
        )}

        {/* Preview */}
        {renderPreview()}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default FloatingToolbar;