/**
 * Workflow System - Complete AI writing workflow management
 * Phase 3: XState state machine with ProcessBar visualization
 * 
 * This module provides a complete workflow automation system for AI writing
 * with state machine precision, quality checking, and real-time visualization.
 */

// Core workflow machine and configuration
export { 
  workflowMachine, 
  type WorkflowContext, 
  type WorkflowConfig, 
  type WorkflowEvent, 
  type WorkflowActor 
} from './workflow-machine';

// Quality checking system
export { 
  QualityChecker, 
  quickQualityCheck, 
  QUALITY_THRESHOLDS,
  type QualityMetrics, 
  type QualityDetails, 
  type QualityThresholds, 
  type QualityLevel 
} from './quality-checker';

// AI service integration
export { 
  AIWorkflowService, 
  aiWorkflowService, 
  generateStepContent, 
  getStepQualitySuggestions,
  type AIGenerationRequest, 
  type AIGenerationResponse, 
  type WorkflowContext, 
  type AIServiceConfig 
} from './ai-service';

// Event handling and recovery
export { 
  WorkflowEventManager, 
  workflowEventManager, 
  subscribeToWorkflowEvents, 
  unsubscribeFromWorkflowEvents, 
  emitWorkflowEvent, 
  getWorkflowRecoveryPoints, 
  getWorkflowErrorHistory,
  ErrorSeverity,
  RecoveryStrategy,
  type WorkflowEventHandler, 
  type WorkflowRecoveryPoint, 
  type RecoveryOption, 
  type WorkflowError, 
  type EventSubscription 
} from './event-manager';

// Workflow store and hooks
export { 
  useWorkflowStore,
  useWorkflow,
  useWorkflowActions,
  useWorkflowSteps,
  useWorkflowQuality,
  useWorkflowAI,
  useWorkflowConfig,
  useWorkflowPersistence,
  useWorkflowEvents,
  type WorkflowState 
} from '../stores/workflow-store';

// Utility functions and constants
export const WORKFLOW_STEPS = [
  'planning',
  'drafting', 
  'citation',
  'grammar',
  'readability'
] as const;

export const WORKFLOW_STEP_LABELS = {
  planning: 'Plan',
  drafting: 'Draft',
  citation: 'Citation',
  grammar: 'Grammar',
  readability: 'Readability'
} as const;

export const WORKFLOW_STEP_DESCRIPTIONS = {
  planning: 'Generate writing outline and structure',
  drafting: 'Create first draft content',
  citation: 'Validate and format citations',
  grammar: 'Check grammar and style',
  readability: 'Optimize for readability'
} as const;

// Default configurations
export const DEFAULT_WORKFLOW_CONFIG = {
  autoAdvance: false,
  skipOptionalSteps: false,
  aiAssistanceLevel: 'moderate' as const,
  qualityLevel: 'standard' as const,
  writingStyle: 'professional',
  targetLength: 'medium' as const,
  includeResearch: true,
  includeCitations: true,
  reviewType: 'comprehensive' as const,
  enableAutoSave: true,
  saveInterval: 30000,
};

export const DEFAULT_QUALITY_THRESHOLDS = {
  planning: 0.7,
  drafting: 0.6,
  citation: 0.8,
  grammar: 0.85,
  readability: 0.75,
};

// Workflow utilities
export function isWorkflowStep(step: string): step is typeof WORKFLOW_STEPS[number] {
  return WORKFLOW_STEPS.includes(step as any);
}

export function getStepIndex(step: string): number {
  return WORKFLOW_STEPS.indexOf(step as any);
}

export function getNextWorkflowStep(currentStep: string): string | null {
  const currentIndex = getStepIndex(currentStep);
  return currentIndex >= 0 && currentIndex < WORKFLOW_STEPS.length - 1 
    ? WORKFLOW_STEPS[currentIndex + 1]
    : null;
}

export function getPreviousWorkflowStep(currentStep: string): string | null {
  const currentIndex = getStepIndex(currentStep);
  return currentIndex > 0 ? WORKFLOW_STEPS[currentIndex - 1] : null;
}

export function calculateWorkflowProgress(
  currentStep: string, 
  stepProgress: number = 0
): number {
  const currentIndex = getStepIndex(currentStep);
  const totalSteps = WORKFLOW_STEPS.length;
  
  if (currentIndex === -1) return 0;
  
  const completedSteps = currentIndex;
  const currentStepProgress = stepProgress / 100;
  
  return Math.round(((completedSteps + currentStepProgress) / totalSteps) * 100);
}

// Type exports for convenience
export type {
  WorkflowStep,
  WorkflowStatus
} from '../types/layout';

/**
 * Usage Example:
 * 
 * ```typescript
 * import { 
 *   useWorkflowStore, 
 *   useWorkflow, 
 *   useWorkflowActions,
 *   workflowEventManager,
 *   QualityChecker,
 *   DEFAULT_WORKFLOW_CONFIG
 * } from '@/lib/workflow';
 * 
 * // Initialize workflow
 * const { initializeWorkflow, startWorkflow } = useWorkflowActions();
 * 
 * // Start workflow
 * await initializeWorkflow(DEFAULT_WORKFLOW_CONFIG);
 * await startWorkflow('document-id');
 * 
 * // Monitor workflow state
 * const { currentStep, stepProgress, overallProgress } = useWorkflow();
 * 
 * // Subscribe to events
 * workflowEventManager.subscribe('STEP_COMPLETED', (event) => {
 *   console.log('Step completed:', event);
 * });
 * ```
 */