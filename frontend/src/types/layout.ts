export interface HolyGrailLayoutProps {
  children?: React.ReactNode;
  documentId?: string;
  workflowId?: string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface LayoutState {
  isChatPanelExpanded: boolean;
  isEditorSidebarOpen: boolean;
  isProcessBarVisible: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  editorFocusMode: boolean;
  chatPanelWidth: number;
  editorSidebarWidth: number;
}

export interface LayoutActions {
  toggleChatPanel: () => void;
  toggleEditorSidebar: () => void;
  toggleProcessBar: () => void;
  setEditorFocusMode: (enabled: boolean) => void;
  setChatPanelWidth: (width: number) => void;
  setEditorSidebarWidth: (width: number) => void;
}

export interface LayoutContextType extends LayoutState, LayoutActions {
  updateLayout: (updates: Partial<LayoutState>) => void;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  lastModified: Date;
  wordCount: number;
  status: 'draft' | 'in_progress' | 'completed';
  isAutoSaving: boolean;
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  currentStep: WorkflowStep;
  progress: number;
  status: WorkflowStatus;
  canRun: boolean;
  isRunning: boolean;
}

export type WorkflowStep = 'idle' | 'planning' | 'drafting' | 'citation' | 'grammar' | 'readability' | 'completed' | 'failed';
export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  shortcut?: string;
}