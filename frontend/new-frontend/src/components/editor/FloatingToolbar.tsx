/**
 * Floating Toolbar Component
 * 
 * Shows a floating menu when the editor is empty for quick block insertion
 */

'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import { clsx } from 'clsx';
import { FloatingToolbarProps, ToolbarAction } from './types';

const FLOATING_ACTIONS: ToolbarAction[] = [
  {
    name: 'heading1',
    label: 'Heading 1',
    icon: ({ className }) => <span className={className}>H1</span>,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    tooltip: 'Large heading',
    group: 'blocks',
  },
  {
    name: 'heading2',
    label: 'Heading 2',
    icon: ({ className }) => <span className={className}>H2</span>,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    tooltip: 'Medium heading',
    group: 'blocks',
  },
  {
    name: 'heading3',
    label: 'Heading 3',
    icon: ({ className }) => <span className={className}>H3</span>,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    tooltip: 'Small heading',
    group: 'blocks',
  },
  {
    name: 'bulletList',
    label: 'Bullet List',
    icon: ({ className }) => <span className={className}>•</span>,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
    tooltip: 'Bullet list',
    group: 'lists',
  },
  {
    name: 'orderedList',
    label: 'Numbered List',
    icon: ({ className }) => <span className={className}>1.</span>,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    tooltip: 'Numbered list',
    group: 'lists',
  },
  {
    name: 'blockquote',
    label: 'Quote',
    icon: ({ className }) => <span className={className}>"</span>,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    tooltip: 'Quote block',
    group: 'blocks',
  },
  {
    name: 'codeBlock',
    label: 'Code Block',
    icon: ({ className }) => <span className={className}>{'{ }'}</span>,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    tooltip: 'Code block',
    group: 'blocks',
  },
  {
    name: 'horizontalRule',
    label: 'Divider',
    icon: ({ className }) => <span className={className}>—</span>,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    tooltip: 'Horizontal divider',
    group: 'advanced',
  },
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  editor,
  actions = FLOATING_ACTIONS,
  visible = true,
  position = 'auto',
  className,
}) => {
  if (!editor || !visible) {
    return null;
  }

  const handleActionClick = (action: ToolbarAction) => {
    action.command(editor);
  };

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: position === 'auto' ? 'top-start' : position,
        offset: [0, 8],
        maxWidth: 'none',
      }}
      shouldShow={({ editor, view, state, oldState }) => {
        // Show when editor is empty or at the start of a new line
        const { selection } = state;
        const { $anchor } = selection;
        const isRootDepth = $anchor.depth === 1;
        const isEmptyTextBlock = $anchor.parent.isTextblock && !$anchor.parent.type.spec.code && !$anchor.parent.textContent;
        
        return isRootDepth && isEmptyTextBlock;
      }}
      className={clsx(
        'floating-menu',
        className
      )}
    >
      <div className={clsx(
        'flex items-center space-x-1 p-2 rounded-lg shadow-lg border',
        'bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-600',
        'max-w-md overflow-x-auto'
      )}>
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mr-2 whitespace-nowrap">
          <span>Type</span>
          <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">
            /
          </kbd>
          <span>for blocks or click:</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {actions.map((action) => {
            const isActive = action.isActive?.(editor) || false;
            const isDisabled = action.isDisabled?.(editor) || false;

            return (
              <button
                key={action.name}
                onClick={() => handleActionClick(action)}
                disabled={isDisabled}
                title={action.tooltip}
                className={clsx(
                  'flex items-center justify-center p-1.5 rounded transition-colors',
                  'text-xs font-medium min-w-[28px] h-7',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isActive && [
                    'bg-blue-100 dark:bg-blue-900',
                    'text-blue-700 dark:text-blue-300',
                    'border border-blue-300 dark:border-blue-600'
                  ],
                  !isActive && [
                    'text-gray-700 dark:text-gray-300',
                    'border border-transparent'
                  ]
                )}
              >
                <action.icon className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      </div>
    </FloatingMenu>
  );
};

export default FloatingToolbar;