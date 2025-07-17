/**
 * Editor Bubble Menu Component
 * 
 * Shows a floating bubble menu when text is selected for quick formatting
 */

'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { clsx } from 'clsx';
import { BubbleMenuProps, ToolbarAction } from './types';

const BUBBLE_ACTIONS: ToolbarAction[] = [
  {
    name: 'bold',
    label: 'Bold',
    icon: ({ className }) => <strong className={className}>B</strong>,
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
    tooltip: 'Bold (Ctrl+B)',
    group: 'formatting',
  },
  {
    name: 'italic',
    label: 'Italic',
    icon: ({ className }) => <em className={className}>I</em>,
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
    tooltip: 'Italic (Ctrl+I)',
    group: 'formatting',
  },
  {
    name: 'underline',
    label: 'Underline',
    icon: ({ className }) => <span className={clsx('underline', className)}>U</span>,
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive('underline'),
    tooltip: 'Underline (Ctrl+U)',
    group: 'formatting',
  },
  {
    name: 'strike',
    label: 'Strikethrough',
    icon: ({ className }) => <span className={clsx('line-through', className)}>S</span>,
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
    tooltip: 'Strikethrough',
    group: 'formatting',
  },
  {
    name: 'code',
    label: 'Code',
    icon: ({ className }) => <code className={className}>{'</>'}</code>,
    command: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive('code'),
    tooltip: 'Inline code',
    group: 'formatting',
  },
  {
    name: 'highlight',
    label: 'Highlight',
    icon: ({ className }) => <span className={clsx('bg-yellow-200 dark:bg-yellow-800', className)}>H</span>,
    command: (editor) => editor.chain().focus().toggleHighlight().run(),
    isActive: (editor) => editor.isActive('highlight'),
    tooltip: 'Highlight text',
    group: 'formatting',
  },
  {
    name: 'link',
    label: 'Link',
    icon: ({ className }) => <span className={className}>🔗</span>,
    command: (editor) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '');
      
      // If text is selected and it's already a link, edit the existing link
      if (editor.isActive('link')) {
        const href = editor.getAttributes('link').href;
        const newUrl = window.prompt('Edit URL:', href);
        if (newUrl !== null) {
          if (newUrl === '') {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href: newUrl }).run();
          }
        }
      } else {
        // Create a new link
        const url = window.prompt('Enter URL:', selectedText.startsWith('http') ? selectedText : '');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }
      return true;
    },
    isActive: (editor) => editor.isActive('link'),
    tooltip: 'Add/edit link',
    group: 'links',
  },
];

export const EditorBubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  actions = BUBBLE_ACTIONS,
  shouldShow,
  className,
}) => {
  if (!editor) {
    return null;
  }

  const defaultShouldShow = ({ editor }: { editor: Editor }) => {
    const { state } = editor;
    const { selection } = state;
    const { empty } = selection;

    // Don't show if selection is empty
    if (empty) return false;

    // Don't show if we're in a code block
    if (editor.isActive('codeBlock')) return false;

    // Don't show if we're selecting an image
    if (editor.isActive('image')) return false;

    return true;
  };

  const handleActionClick = (action: ToolbarAction) => {
    action.command(editor);
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={(shouldShow || defaultShouldShow) as any}
      className={clsx(
        'bubble-menu',
        className
      )}
    >
      <div className={clsx(
        'flex items-center space-x-1 p-2 rounded-lg shadow-lg border',
        'bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-600',
        'max-w-sm'
      )}>
        {actions.map((action, index) => {
          const isActive = action.isActive?.(editor) || false;
          const isDisabled = action.isDisabled?.(editor) || false;

          return (
            <React.Fragment key={action.name}>
              <button
                onClick={() => handleActionClick(action)}
                disabled={isDisabled}
                title={action.tooltip}
                className={clsx(
                  'flex items-center justify-center p-1.5 rounded transition-colors',
                  'text-sm font-medium min-w-[28px] h-8',
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
                <action.icon className="w-4 h-4" />
              </button>
              
              {/* Add separator after formatting actions and before link */}
              {action.name === 'highlight' && index < actions.length - 1 && (
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;