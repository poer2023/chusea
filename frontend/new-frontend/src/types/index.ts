// Core types for the ChUseA AI Writing Tool - Unified export

// Re-export all types from organized modules
export * from './api';
export * from './auth';
export * from './document';
export * as WorkflowTypes from './workflow';
export * as ChatTypes from './chat';
export * from './ui';

// Re-export tRPC types for compatibility
export type { 
  Document as TRPCDocument,
  Workflow,
  User as TRPCUser,
  Session,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecution,
  WorkflowExecutionStep,
  UserStats,
  Folder,
  UserPreferences as TRPCUserPreferences
} from './trpc';

// Type aliases for backward compatibility
export type WritingWorkflow = Workflow;
export type WorkflowStep = WorkflowExecutionStep;
export type WorkflowStepData = Record<string, unknown>;

// API operation types
export interface CreateDocumentData {
  title: string;
  content?: string;
  type?: 'markdown' | 'text' | 'html';
  tags?: string[];
  folderId?: string;
  isPublic?: boolean;
  allowComments?: boolean;
}

export interface UpdateDocumentData {
  id: string;
  title?: string;
  content?: string;
  type?: 'markdown' | 'text' | 'html';
  tags?: string[];
  folderId?: string;
  isPublic?: boolean;
  allowComments?: boolean;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateWorkflowData {
  id: string;
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  tags?: string[];
  isActive?: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  category: string;
  tags: string[];
  previewImage?: string;
}

// AI service types (placeholders)
export interface AIGenerateInput {
  prompt: string;
  style?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  context?: string;
}

export interface AIGenerateOutput {
  content: string;
  suggestions?: string[];
  metadata: {
    model: string;
    tokensUsed: number;
    confidence: number;
    processingTime: number;
    requestId: string;
  };
}

export interface AIOptimizeInput {
  content: string;
  optimizationType: 'grammar' | 'style' | 'clarity' | 'tone' | 'length';
  targetAudience?: string;
  language?: string;
}

export interface AIOptimizeOutput {
  optimizedContent: string;
  changes: Array<{
    type: 'addition' | 'deletion' | 'modification';
    original: string;
    modified: string;
    reason: string;
    position: {
      start: number;
      end: number;
    };
  }>;
  metadata: any;
}

// Legacy types for backward compatibility (will be removed in future versions)
// @deprecated Use types from specific modules instead

// User types - moved to auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: UserSubscription;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  defaultWritingStyle: string;
  autoSave: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

// AI types - enhanced versions available in api.ts
export interface AIWritingRequest {
  prompt: string;
  style?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  context?: string;
  previousContent?: string;
}

export interface AIWritingResponse {
  content: string;
  suggestions?: string[];
  metadata: {
    model: string;
    tokensUsed: number;
    confidence: number;
    processingTime: number;
  };
}

// Store types
export interface StoreConfig {
  name: string;
  version: string;
  persist?: {
    enabled: boolean;
    storage?: 'localStorage' | 'sessionStorage';
    whitelist?: string[];
    blacklist?: string[];
  };
}

// Breadcrumb for legacy support - enhanced version in ui.ts
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}