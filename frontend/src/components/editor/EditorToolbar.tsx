/**
 * Editor Toolbar Component
 * 
 * Comprehensive toolbar for TipTap editor with grouped actions
 */

'use client';

import React, { useMemo } from 'react';
import { Editor } from '@tiptap/react';
import { clsx } from 'clsx';
import { ToolbarConfig, ToolbarAction, ToolbarGroup } from './types';

interface EditorToolbarProps {
  editor: Editor;
  config?: ToolbarConfig;
  theme?: 'light' | 'dark';
  className?: string;
}

// Toolbar action definitions
const TOOLBAR_ACTIONS: Record<string, ToolbarAction> = {
  // Formatting actions
  bold: {
    name: 'bold',
    label: 'Bold',
    icon: ({ className }) => <strong className={className}>B</strong>,
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
    tooltip: 'Bold (Ctrl+B)',
    group: 'formatting',
  },
  italic: {
    name: 'italic',
    label: 'Italic',
    icon: ({ className }) => <em className={className}>I</em>,
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
    tooltip: 'Italic (Ctrl+I)',
    group: 'formatting',
  },
  underline: {
    name: 'underline',
    label: 'Underline',
    icon: ({ className }) => <span className={clsx('underline', className)}>U</span>,
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive('underline'),
    tooltip: 'Underline (Ctrl+U)',
    group: 'formatting',
  },
  strike: {
    name: 'strike',
    label: 'Strikethrough',
    icon: ({ className }) => <span className={clsx('line-through', className)}>S</span>,
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
    tooltip: 'Strikethrough',
    group: 'formatting',
  },
  code: {
    name: 'code',
    label: 'Code',
    icon: ({ className }) => <code className={className}>{'</>'}</code>,
    command: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive('code'),
    tooltip: 'Inline code',
    group: 'formatting',
  },
  highlight: {
    name: 'highlight',
    label: 'Highlight',
    icon: ({ className }) => <span className={clsx('bg-yellow-200', className)}>H</span>,
    command: (editor) => editor.chain().focus().toggleHighlight().run(),
    isActive: (editor) => editor.isActive('highlight'),
    tooltip: 'Highlight text',
    group: 'formatting',
  },
  
  // Block actions
  paragraph: {
    name: 'paragraph',
    label: 'Paragraph',
    icon: ({ className }) => <span className={className}>P</span>,
    command: (editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor) => editor.isActive('paragraph'),
    tooltip: 'Paragraph',
    group: 'blocks',
  },
  heading1: {
    name: 'heading1',
    label: 'Heading 1',
    icon: ({ className }) => <span className={className}>H1</span>,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
    tooltip: 'Heading 1',
    group: 'blocks',
  },
  heading2: {
    name: 'heading2',
    label: 'Heading 2',
    icon: ({ className }) => <span className={className}>H2</span>,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    tooltip: 'Heading 2',
    group: 'blocks',
  },
  heading3: {
    name: 'heading3',
    label: 'Heading 3',
    icon: ({ className }) => <span className={className}>H3</span>,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
    tooltip: 'Heading 3',
    group: 'blocks',
  },
  blockquote: {
    name: 'blockquote',
    label: 'Quote',
    icon: ({ className }) => <span className={className}>"</span>,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive('blockquote'),
    tooltip: 'Blockquote',
    group: 'blocks',
  },
  codeBlock: {
    name: 'codeBlock',
    label: 'Code Block',
    icon: ({ className }) => <span className={className}>{'{ }'}</span>,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive('codeBlock'),
    tooltip: 'Code block',
    group: 'blocks',
  },

  // List actions
  bulletList: {
    name: 'bulletList',
    label: 'Bullet List',
    icon: ({ className }) => <span className={className}>•</span>,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive('bulletList'),
    tooltip: 'Bullet list',
    group: 'lists',
  },
  orderedList: {
    name: 'orderedList',
    label: 'Numbered List',
    icon: ({ className }) => <span className={className}>1.</span>,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive('orderedList'),
    tooltip: 'Numbered list',
    group: 'lists',
  },

  // Alignment actions
  alignLeft: {
    name: 'alignLeft',
    label: 'Align Left',
    icon: ({ className }) => <span className={className}>⬅</span>,
    command: (editor) => editor.chain().focus().setTextAlign('left').run(),
    isActive: (editor) => editor.isActive({ textAlign: 'left' }),
    tooltip: 'Align left',
    group: 'alignment',
  },
  alignCenter: {
    name: 'alignCenter',
    label: 'Align Center',
    icon: ({ className }) => <span className={className}>⬛</span>,
    command: (editor) => editor.chain().focus().setTextAlign('center').run(),
    isActive: (editor) => editor.isActive({ textAlign: 'center' }),
    tooltip: 'Align center',
    group: 'alignment',
  },
  alignRight: {
    name: 'alignRight',
    label: 'Align Right',
    icon: ({ className }) => <span className={className}>➡</span>,
    command: (editor) => editor.chain().focus().setTextAlign('right').run(),
    isActive: (editor) => editor.isActive({ textAlign: 'right' }),
    tooltip: 'Align right',
    group: 'alignment',
  },
  alignJustify: {
    name: 'alignJustify',
    label: 'Justify',
    icon: ({ className }) => <span className={className}>⬌</span>,
    command: (editor) => editor.chain().focus().setTextAlign('justify').run(),
    isActive: (editor) => editor.isActive({ textAlign: 'justify' }),
    tooltip: 'Justify',
    group: 'alignment',
  },

  // Link actions
  link: {
    name: 'link',
    label: 'Link',
    icon: ({ className }) => <span className={className}>🔗</span>,
    command: (editor) => {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
      return true;
    },
    isActive: (editor) => editor.isActive('link'),
    tooltip: 'Add link',
    group: 'links',
  },
  unlink: {
    name: 'unlink',
    label: 'Remove Link',
    icon: ({ className }) => <span className={className}>🔗⃠</span>,
    command: (editor) => editor.chain().focus().unsetLink().run(),
    isDisabled: (editor) => !editor.isActive('link'),
    tooltip: 'Remove link',
    group: 'links',
  },

  // Advanced actions
  undo: {
    name: 'undo',
    label: 'Undo',
    icon: ({ className }) => <span className={className}>↶</span>,
    command: (editor) => editor.chain().focus().undo().run(),
    isDisabled: (editor) => !editor.can().undo(),
    tooltip: 'Undo (Ctrl+Z)',
    group: 'advanced',
  },
  redo: {
    name: 'redo',
    label: 'Redo',
    icon: ({ className }) => <span className={className}>↷</span>,
    command: (editor) => editor.chain().focus().redo().run(),
    isDisabled: (editor) => !editor.can().redo(),
    tooltip: 'Redo (Ctrl+Y)',
    group: 'advanced',
  },
  horizontalRule: {
    name: 'horizontalRule',
    label: 'Horizontal Rule',
    icon: ({ className }) => <span className={className}>—</span>,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    tooltip: 'Horizontal rule',
    group: 'advanced',
  },
  hardBreak: {
    name: 'hardBreak',
    label: 'Hard Break',
    icon: ({ className }) => <span className={className}>↵</span>,
    command: (editor) => editor.chain().focus().setHardBreak().run(),
    tooltip: 'Hard break',
    group: 'advanced',
  },
};

// Default toolbar groups configuration
const DEFAULT_GROUPS: ToolbarGroup[] = [
  'formatting',
  'blocks', 
  'lists',
  'alignment',
  'links',
  'advanced'
];

// Group action mappings
const GROUP_ACTIONS: Record<ToolbarGroup, string[]> = {
  formatting: ['bold', 'italic', 'underline', 'strike', 'code', 'highlight'],
  blocks: ['paragraph', 'heading1', 'heading2', 'heading3', 'blockquote', 'codeBlock'],
  lists: ['bulletList', 'orderedList'],
  alignment: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
  links: ['link', 'unlink'],
  media: [],
  tables: [],
  advanced: ['undo', 'redo', 'horizontalRule', 'hardBreak'],
};

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  config,
  theme = 'light',
  className,
}) => {
  const toolbarConfig = config || {
    groups: DEFAULT_GROUPS,
    position: 'top',
  };

  const renderAction = (actionName: string) => {
    const action = TOOLBAR_ACTIONS[actionName];
    if (!action) return null;

    const isActive = action.isActive?.(editor) || false;
    const isDisabled = action.isDisabled?.(editor) || false;

    return (
      <button
        key={action.name}
        onClick={() => action.command(editor)}
        disabled={isDisabled}
        title={action.tooltip}
        className={clsx(
          'flex items-center justify-center p-2 rounded transition-colors',
          'text-sm font-medium',
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
    );
  };

  const renderGroup = (groupName: ToolbarGroup) => {
    const actions = GROUP_ACTIONS[groupName] || [];
    if (actions.length === 0) return null;

    return (
      <div
        key={groupName}
        className={clsx(
          'flex items-center space-x-1 px-2',
          'border-r border-gray-200 dark:border-gray-600 last:border-r-0'
        )}
      >
        {actions.map(renderAction)}
      </div>
    );
  };

  const groups = useMemo(() => {
    return toolbarConfig.groups || DEFAULT_GROUPS;
  }, [toolbarConfig.groups]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex items-center flex-wrap gap-1 p-2',
        'border-b border-gray-200 dark:border-gray-600',
        'bg-gray-50 dark:bg-gray-800',
        className
      )}
    >
      {groups.map(renderGroup)}
      
      {/* Custom actions */}
      {toolbarConfig.customActions && toolbarConfig.customActions.length > 0 && (
        <div className="flex items-center space-x-1 px-2 border-l border-gray-200 dark:border-gray-600">
          {toolbarConfig.customActions.map((action) => {
            const isActive = action.isActive?.(editor) || false;
            const isDisabled = action.isDisabled?.(editor) || false;

            return (
              <button
                key={action.name}
                onClick={() => action.command(editor)}
                disabled={isDisabled}
                title={action.tooltip}
                className={clsx(
                  'flex items-center justify-center p-2 rounded transition-colors',
                  'text-sm font-medium',
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;