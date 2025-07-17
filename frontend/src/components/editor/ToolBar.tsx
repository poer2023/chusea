/**
 * ToolBar - 编辑器工具栏组件
 * 提供格式化、插入、保存等功能
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface ToolBarProps {
  onInsertText: (text: string) => void;
  onSave: () => void;
  onTogglePreview: () => void;
  onUploadFile: () => void;
  isPreviewMode: boolean;
  isSaving: boolean;
  readOnly: boolean;
}

interface ToolBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export function ToolBar({
  onInsertText,
  onSave,
  onTogglePreview,
  onUploadFile,
  isPreviewMode,
  isSaving,
  readOnly
}: ToolBarProps) {
  // 格式化工具
  const formatTools: ToolBarItem[] = [
    {
      id: 'bold',
      label: '粗体 (Ctrl+B)',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      ),
      action: () => onInsertText('**粗体文本**'),
      disabled: readOnly
    },
    {
      id: 'italic',
      label: '斜体 (Ctrl+I)',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4l4 16m-4-8h8" />
        </svg>
      ),
      action: () => onInsertText('*斜体文本*'),
      disabled: readOnly
    },
    {
      id: 'strikethrough',
      label: '删除线',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12M6 8h12M6 16h12" />
        </svg>
      ),
      action: () => onInsertText('~~删除线文本~~'),
      disabled: readOnly
    },
    {
      id: 'code',
      label: '行内代码',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      action: () => onInsertText('`代码`'),
      disabled: readOnly
    },
    {
      id: 'separator1',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    }
  ];

  // 标题工具
  const headingTools: ToolBarItem[] = [
    {
      id: 'h1',
      label: '标题 1',
      icon: <span className="text-lg font-bold">H1</span>,
      action: () => onInsertText('# 标题 1\n'),
      disabled: readOnly
    },
    {
      id: 'h2',
      label: '标题 2',
      icon: <span className="text-base font-bold">H2</span>,
      action: () => onInsertText('## 标题 2\n'),
      disabled: readOnly
    },
    {
      id: 'h3',
      label: '标题 3',
      icon: <span className="text-sm font-bold">H3</span>,
      action: () => onInsertText('### 标题 3\n'),
      disabled: readOnly
    },
    {
      id: 'separator2',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    }
  ];

  // 列表工具
  const listTools: ToolBarItem[] = [
    {
      id: 'ul',
      label: '无序列表',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      action: () => onInsertText('- 列表项 1\n- 列表项 2\n- 列表项 3\n'),
      disabled: readOnly
    },
    {
      id: 'ol',
      label: '有序列表',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ),
      action: () => onInsertText('1. 列表项 1\n2. 列表项 2\n3. 列表项 3\n'),
      disabled: readOnly
    },
    {
      id: 'checklist',
      label: '任务列表',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: () => onInsertText('- [ ] 任务 1\n- [ ] 任务 2\n- [x] 已完成任务\n'),
      disabled: readOnly
    },
    {
      id: 'separator3',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    }
  ];

  // 插入工具
  const insertTools: ToolBarItem[] = [
    {
      id: 'link',
      label: '链接',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      action: () => onInsertText('[链接文本](https://example.com)'),
      disabled: readOnly
    },
    {
      id: 'image',
      label: '图片',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      action: () => onInsertText('![图片描述](image-url)'),
      disabled: readOnly
    },
    {
      id: 'upload',
      label: '上传文件',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      action: onUploadFile,
      disabled: readOnly
    },
    {
      id: 'table',
      label: '表格',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" />
        </svg>
      ),
      action: () => onInsertText('| 标题1 | 标题2 | 标题3 |\n|-------|-------|-------|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n'),
      disabled: readOnly
    },
    {
      id: 'separator4',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    }
  ];

  // 块级工具
  const blockTools: ToolBarItem[] = [
    {
      id: 'quote',
      label: '引用',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      action: () => onInsertText('> 这是一段引用文本\n'),
      disabled: readOnly
    },
    {
      id: 'codeblock',
      label: '代码块',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      action: () => onInsertText('```javascript\n// 在这里写代码\nconsole.log("Hello, World!");\n```\n'),
      disabled: readOnly
    },
    {
      id: 'hr',
      label: '分隔线',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
        </svg>
      ),
      action: () => onInsertText('\n---\n'),
      disabled: readOnly
    },
    {
      id: 'separator5',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    }
  ];

  // 操作工具
  const actionTools: ToolBarItem[] = [
    {
      id: 'preview',
      label: isPreviewMode ? '编辑模式' : '预览模式',
      icon: isPreviewMode ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      action: onTogglePreview,
      disabled: false
    },
    {
      id: 'save',
      label: '保存 (Ctrl+S)',
      icon: isSaving ? (
        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      action: onSave,
      disabled: readOnly || isSaving
    }
  ];

  const allTools = [...formatTools, ...headingTools, ...listTools, ...insertTools, ...blockTools, ...actionTools];

  const renderTool = (tool: ToolBarItem) => {
    if (tool.separator) {
      return (
        <div key={tool.id} className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
      );
    }

    return (
      <Tooltip key={tool.id} content={tool.label}>
        <Button
          variant="ghost"
          size="sm"
          onClick={tool.action}
          disabled={tool.disabled}
          className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tool.icon}
        </Button>
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {allTools.map(renderTool)}
    </div>
  );
}

export default ToolBar;