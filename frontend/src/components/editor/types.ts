/**
 * TipTap Rich Text Editor Type Definitions
 * 
 * Comprehensive type definitions for the TipTap editor integration
 */

import { Editor, JSONContent } from '@tiptap/react';
import { Document } from '@/types/document';

// Editor configuration types
export interface EditorConfig {
  content?: string | JSONContent;
  placeholder?: string;
  autoFocus?: boolean | 'start' | 'end';
  editable?: boolean;
  autofocus?: boolean;
  enableCoreExtensions?: boolean;
  enableCollaboration?: boolean;
  maxCharacters?: number;
  immediatelyRender?: boolean;
}

// Editor toolbar types
export interface ToolbarAction {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (editor: Editor) => boolean;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
  tooltip?: string;
  group?: ToolbarGroup;
}

export type ToolbarGroup = 
  | 'formatting'
  | 'blocks'
  | 'lists'
  | 'alignment'
  | 'links'
  | 'media'
  | 'tables'
  | 'advanced';

export interface ToolbarConfig {
  groups: ToolbarGroup[];
  customActions?: ToolbarAction[];
  floating?: boolean;
  bubble?: boolean;
  position?: 'top' | 'bottom' | 'inline';
}

// Editor content types
export interface EditorContent {
  html: string;
  json: JSONContent;
  text: string;
  markdown?: string;
  wordCount: number;
  characterCount: number;
}

// Editor state types
export interface EditorState {
  isEditable: boolean;
  isEmpty: boolean;
  isFocused: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  currentNode?: string;
  selectedText?: string;
}

// Editor event types
export interface EditorEvents {
  onCreate?: (editor: Editor) => void;
  onUpdate?: (content: EditorContent, editor: Editor) => void;
  onSelectionUpdate?: (editor: Editor) => void;
  onFocus?: (editor: Editor) => void;
  onBlur?: (editor: Editor) => void;
  onDestroy?: () => void;
  onChange?: (content: EditorContent) => void;
  onSave?: (content: EditorContent) => Promise<void>;
  onError?: (error: Error) => void;
}

// Editor theme integration
export interface EditorTheme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    border: string;
    selection: string;
    placeholder: string;
    toolbar: {
      background: string;
      foreground: string;
      hover: string;
      active: string;
      border: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  spacing: {
    padding: string;
    margin: string;
  };
}

// Document integration types
export interface DocumentEditorProps {
  document?: Document;
  onDocumentUpdate?: (document: Partial<Document>) => void;
  onDocumentSave?: (document: Document) => Promise<void>;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

// Rich Text Editor main component props
export interface RichTextEditorProps extends EditorConfig, EditorEvents, DocumentEditorProps {
  className?: string;
  style?: React.CSSProperties;
  toolbar?: ToolbarConfig;
  theme?: EditorTheme;
  extensions?: any[];
  readonly?: boolean;
  loading?: boolean;
  error?: string | null;
  debounceMs?: number;
  maxHeight?: string;
  minHeight?: string;
  showBubbleMenu?: boolean;
  showToolbar?: boolean;
  children?: React.ReactNode;
}

// Floating toolbar props
export interface FloatingToolbarProps {
  editor: Editor;
  actions?: ToolbarAction[];
  visible?: boolean;
  position?: 'top' | 'bottom' | 'auto';
  className?: string;
}

// Bubble menu props  
export interface BubbleMenuProps {
  editor: Editor;
  actions?: ToolbarAction[];
  shouldShow?: (editor: Editor) => boolean;
  className?: string;
}

// Editor extension types
export interface ExtensionConfig {
  name: string;
  enabled: boolean;
  options?: Record<string, any>;
  dependencies?: string[];
}

export interface EditorExtensions {
  basic: ExtensionConfig[];
  formatting: ExtensionConfig[];
  blocks: ExtensionConfig[];
  lists: ExtensionConfig[];
  media: ExtensionConfig[];
  tables: ExtensionConfig[];
  collaboration: ExtensionConfig[];
  advanced: ExtensionConfig[];
}

// Content validation and sanitization
export interface ContentValidator {
  validate: (content: string | JSONContent) => ValidationResult;
  sanitize: (content: string | JSONContent) => string | JSONContent;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  message: string;
  code: string;
  position?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  message: string;
  code: string;
  position?: number;
  suggestion?: string;
}

// Performance monitoring
export interface EditorPerformance {
  renderTime: number;
  updateTime: number;
  contentSize: number;
  nodeCount: number;
  memoryUsage?: number;
}

// Accessibility features
export interface EditorAccessibility {
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  ariaLabels: Record<string, string>;
  focusIndicators: boolean;
  highContrast: boolean;
}

// Export/Import types
export interface ExportOptions {
  format: 'html' | 'markdown' | 'json' | 'text';
  includeStyles?: boolean;
  minify?: boolean;
}

export interface ImportOptions {
  format: 'html' | 'markdown' | 'json' | 'text';
  sanitize?: boolean;
  preserveFormatting?: boolean;
}

// Editor utilities
export interface EditorUtils {
  getContent: (format?: 'html' | 'json' | 'text') => string | JSONContent;
  setContent: (content: string | JSONContent) => void;
  insertContent: (content: string | JSONContent, position?: number) => void;
  focus: (position?: 'start' | 'end' | number) => void;
  blur: () => void;
  undo: () => void;
  redo: () => void;
  selectAll: () => void;
  clearContent: () => void;
  destroy: () => void;
  getWordCount: () => number;
  getCharacterCount: () => number;
  isEmpty: () => boolean;
  exportContent: (options: ExportOptions) => string;
  importContent: (content: string, options: ImportOptions) => void;
}

// Plugin system types
export interface EditorPlugin {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  initialize: (editor: Editor) => void;
  destroy?: (editor: Editor) => void;
  commands?: Record<string, (...args: any[]) => boolean>;
  hooks?: {
    onCreate?: (editor: Editor) => void;
    onUpdate?: (editor: Editor) => void;
    onDestroy?: (editor: Editor) => void;
  };
}

// Error types
export interface EditorError extends Error {
  code: string;
  details?: Record<string, any>;
  recoverable?: boolean;
}

// Context types for React providers
export interface EditorContextValue {
  editor: Editor | null;
  isLoading: boolean;
  error: EditorError | null;
  content: EditorContent | null;
  state: EditorState;
  utils: EditorUtils;
  theme: EditorTheme;
  config: EditorConfig;
}

// Hook return types
export interface UseEditorReturn {
  editor: Editor | null;
  content: EditorContent | null;
  state: EditorState;
  utils: EditorUtils;
  isLoading: boolean;
  error: EditorError | null;
}

// Document store integration
export interface EditorDocumentState {
  currentDocument: Document | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  saveError: string | null;
}

export interface EditorDocumentActions {
  setDocument: (document: Document) => void;
  updateContent: (content: string) => void;
  saveDocument: () => Promise<void>;
  enableAutoSave: (interval?: number) => void;
  disableAutoSave: () => void;
  markClean: () => void;
  markDirty: () => void;
}

// Component ref types
export interface RichTextEditorRef {
  editor: Editor | null;
  focus: () => void;
  blur: () => void;
  getContent: () => EditorContent;
  setContent: (content: string | JSONContent) => void;
  insertContent: (content: string | JSONContent) => void;
  clearContent: () => void;
  undo: () => void;
  redo: () => void;
  destroy: () => void;
}