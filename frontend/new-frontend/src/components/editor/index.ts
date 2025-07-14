/**
 * Rich Text Editor Components - Main Export File
 * 
 * Exports all editor-related components and utilities
 */

// Main components
export { default as RichTextEditor } from './RichTextEditor';
export { default as EditorToolbar } from './EditorToolbar';
export { default as FloatingToolbar } from './FloatingToolbar';
export { default as EditorBubbleMenu } from './EditorBubbleMenu';

// Types
export type {
  EditorConfig,
  ToolbarAction,
  ToolbarGroup,
  ToolbarConfig,
  EditorContent,
  EditorState,
  EditorEvents,
  EditorTheme,
  DocumentEditorProps,
  RichTextEditorProps,
  FloatingToolbarProps,
  BubbleMenuProps,
  ExtensionConfig,
  EditorExtensions,
  ContentValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  EditorPerformance,
  EditorAccessibility,
  ExportOptions,
  ImportOptions,
  EditorUtils,
  EditorPlugin,
  EditorError,
  EditorContextValue,
  UseEditorReturn,
  EditorDocumentState,
  EditorDocumentActions,
  RichTextEditorRef,
} from './types';

// Re-export TipTap types for convenience
export type { Editor, JSONContent } from '@tiptap/react';