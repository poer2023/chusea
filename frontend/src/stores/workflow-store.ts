/**
 * Enhanced Workflow Store - XState integration for AI writing workflow
 * Combines XState state machine with Zustand for complete workflow management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';
import { createActor } from 'xstate';
import { workflowMachine, WorkflowContext, WorkflowConfig, WorkflowEvent, WorkflowActor } from '@/lib/workflow/workflow-machine';
import { QualityChecker, QualityMetrics } from '@/lib/workflow/quality-checker';
import type { WorkflowStep, WorkflowStatus } from '@/types/layout';

// Enhanced workflow state interface
export interface WorkflowState {
  // XState machine actor
  workflowActor: WorkflowActor | null;
  
  // Current workflow state
  currentWorkflow: WritingWorkflow | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Step management
  currentStep: WorkflowStep;
  stepProgress: number;
  overallProgress: number;
  workflowStatus: WorkflowStatus;
  
  // Step data and results
  stepData: Record<string, any>;
  stepResults: Record<string, any>;
  stepErrors: Record<string, string>;
  stepHistory: WorkflowStepData[];
  
  // Quality management
  qualityMetrics: QualityMetrics | null;
  qualityThresholds: Record<string, number>;
  qualityChecker: QualityChecker | null;
  
  // AI interaction
  isAIProcessing: boolean;
  aiError: string | null;
  aiResponse: string | null;
  aiGenerationHistory: AIGenerationRecord[];
  
  // Workflow control
  canSkipStep: boolean;
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
  
  // Configuration
  config: WorkflowConfig;
  
  // Persistence and recovery
  lastSavedAt: Date | null;
  checkpointData: any;
  autoSaveEnabled: boolean;
  
  // Event handling
  eventLog: WorkflowEventLog[];
  
  // Actions
  initializeWorkflow: (config?: Partial<WorkflowConfig>) => Promise<void>;
  startWorkflow: (documentId: string, config?: Partial<WorkflowConfig>) => Promise<void>;
  pauseWorkflow: () => void;
  resumeWorkflow: () => void;
  cancelWorkflow: () => void;
  completeWorkflow: () => Promise<void>;
  
  // Step control
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: WorkflowStep) => void;
  completeCurrentStep: (data?: any) => Promise<void>;
  skipCurrentStep: () => void;
  retryCurrentStep: () => void;
  
  // Quality management
  updateQualityMetrics: (metrics: QualityMetrics) => void;
  checkStepQuality: (step: WorkflowStep, data: any) => Promise<QualityMetrics>;
  overrideQualityCheck: () => void;
  
  // AI interactions
  generateWithAI: (prompt: string) => Promise<string>;
  regenerateCurrentStep: () => Promise<void>;
  
  // Configuration
  updateConfig: (config: Partial<WorkflowConfig>) => void;
  resetConfig: () => void;
  
  // Persistence
  saveCheckpoint: () => Promise<void>;
  restoreCheckpoint: (data: any) => Promise<void>;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  
  // Event handling
  sendEvent: (event: WorkflowEvent) => void;
  subscribeToEvents: (callback: (event: WorkflowEvent) => void) => () => void;
  
  // Utilities
  getStepIndex: (step: WorkflowStep) => number;
  getNextStep: () => WorkflowStep | null;
  getPreviousStep: () => WorkflowStep | null;
  canGoToNextStep: () => boolean;
  canGoToPreviousStep: () => boolean;
  calculateProgress: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  cleanup: () => void;
}

// Supporting interfaces
interface WritingWorkflow {
  id: string;
  documentId: string;
  currentStep: WorkflowStep;
  steps: WorkflowStepData[];
  progress: number;
  status: WorkflowStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface WorkflowStepData {
  step: WorkflowStep;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  data?: any;
  metrics?: QualityMetrics;
  completedAt?: string;
  duration?: number;
  retryCount?: number;
}

interface AIGenerationRecord {
  step: WorkflowStep;
  prompt: string;
  response: string;
  timestamp: Date;
  metrics?: QualityMetrics;
}

interface WorkflowEventLog {
  type: string;
  step: WorkflowStep;
  timestamp: Date;
  data?: any;
  error?: string;
}

// Default configuration
const DEFAULT_CONFIG: WorkflowConfig = {
  autoAdvance: false,
  skipOptionalSteps: false,
  aiAssistanceLevel: 'moderate',
  qualityLevel: 'standard',
  writingStyle: 'professional',
  targetLength: 'medium',
  includeResearch: true,
  includeCitations: true,
  reviewType: 'comprehensive',
  enableAutoSave: true,
  saveInterval: 30000,
};

// Default quality thresholds
const DEFAULT_QUALITY_THRESHOLDS = {
  planning: 0.7,
  drafting: 0.6,
  citation: 0.8,
  grammar: 0.85,
  readability: 0.75,
};

// Initial state
const initialState = {
  workflowActor: null,
  currentWorkflow: null,
  isActive: false,
  isLoading: false,
  error: null,
  currentStep: 'idle' as WorkflowStep,
  stepProgress: 0,
  overallProgress: 0,
  workflowStatus: 'idle' as WorkflowStatus,
  stepData: {},
  stepResults: {},
  stepErrors: {},
  stepHistory: [],
  qualityMetrics: null,
  qualityThresholds: DEFAULT_QUALITY_THRESHOLDS,
  qualityChecker: null,
  isAIProcessing: false,
  aiError: null,
  aiResponse: null,
  aiGenerationHistory: [],
  canSkipStep: false,
  canRetry: false,
  retryCount: 0,
  maxRetries: 3,
  config: DEFAULT_CONFIG,
  lastSavedAt: null,
  checkpointData: null,
  autoSaveEnabled: true,
  eventLog: [],
};

// Create the enhanced workflow store
export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initializeWorkflow: async (config?: Partial<WorkflowConfig>) => {
          const finalConfig = { ...get().config, ...config };
          
          // Initialize quality checker
          const qualityChecker = new QualityChecker(finalConfig.qualityLevel);
          
          // Create XState actor
          const workflowActor = createActor(workflowMachine, {
            input: {
              config: finalConfig,
              qualityThresholds: qualityChecker.getThresholds(),
            },
          });
          
          // Subscribe to state changes
          workflowActor.subscribe((state) => {
            const context = state.context as WorkflowContext;
            
            set({
              currentStep: context.currentStep,
              stepProgress: context.stepProgress,
              overallProgress: context.overallProgress,
              workflowStatus: state.matches('paused') ? 'paused' : 
                           state.matches('error') ? 'failed' :
                           state.matches('workflowCompleted') ? 'completed' :
                           state.matches('idle') ? 'idle' : 'running',
              stepData: context.stepData,
              stepResults: context.stepResults,
              qualityMetrics: context.qualityMetrics,
              error: context.error,
              retryCount: context.retryCount,
              canSkipStep: !context.manualMode && context.currentStep !== 'idle',
              canRetry: context.retryCount < context.maxRetries,
              isAIProcessing: state.matches({ [context.currentStep]: 'processing' }),
            });
            
            // Log state changes
            get().logEvent('STATE_CHANGE', context.currentStep, { 
              state: state.value,
              context: context 
            });
          });
          
          workflowActor.start();
          
          set({
            workflowActor,
            qualityChecker,
            config: finalConfig,
            qualityThresholds: qualityChecker.getThresholds(),
          });
          
          // Setup auto-save if enabled
          if (finalConfig.enableAutoSave) {
            get().enableAutoSave();
          }
        },

        startWorkflow: async (documentId: string, config?: Partial<WorkflowConfig>) => {
          const { workflowActor, initializeWorkflow } = get();
          
          if (!workflowActor) {
            await initializeWorkflow(config);
          }
          
          set({ isLoading: true, error: null });
          
          try {
            const workflowId = `workflow_${Date.now()}`;
            const workflow = {
              id: workflowId,
              documentId,
              currentStep: 'planning' as WorkflowStep,
              steps: [],
              progress: 0,
              status: 'running' as WorkflowStatus,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            set({
              currentWorkflow: workflow,
              isActive: true,
              isLoading: false,
              eventLog: [],
            });
            
            // Send start event to machine
            get().sendEvent({ type: 'START_WORKFLOW', documentId, config });
            
            get().logEvent('WORKFLOW_STARTED', 'planning', { documentId, workflowId });
            
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to start workflow',
            });
            throw error;
          }
        },

        pauseWorkflow: () => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'PAUSE_WORKFLOW' });
          }
          set({ isActive: false });
          get().logEvent('WORKFLOW_PAUSED', get().currentStep);
        },

        resumeWorkflow: () => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'RESUME_WORKFLOW' });
          }
          set({ isActive: true });
          get().logEvent('WORKFLOW_RESUMED', get().currentStep);
        },

        cancelWorkflow: () => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'CANCEL_WORKFLOW' });
          }
          
          set({
            currentWorkflow: null,
            isActive: false,
            currentStep: 'idle',
            stepProgress: 0,
            overallProgress: 0,
            workflowStatus: 'idle',
            stepData: {},
            stepResults: {},
            stepErrors: {},
            error: null,
            retryCount: 0,
          });
          
          get().logEvent('WORKFLOW_CANCELLED', 'idle');
        },

        completeWorkflow: async () => {
          const { currentWorkflow, workflowActor } = get();
          if (!currentWorkflow || !workflowActor) return;

          try {
            // Save final state
            await get().saveCheckpoint();
            
            // Update workflow status
            const updatedWorkflow = {
              ...currentWorkflow,
              status: 'completed' as WorkflowStatus,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            set({
              currentWorkflow: updatedWorkflow,
              isActive: false,
              overallProgress: 100,
              workflowStatus: 'completed',
            });
            
            get().logEvent('WORKFLOW_COMPLETED', 'completed');
            
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to complete workflow',
            });
            throw error;
          }
        },

        nextStep: () => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'NEXT_STEP' });
          }
        },

        previousStep: () => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'PREVIOUS_STEP' });
          }
        },

        goToStep: (step: WorkflowStep) => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'GOTO_STEP', step });
          }
          get().logEvent('STEP_NAVIGATION', step);
        },

        completeCurrentStep: async (data?: any) => {
          const { workflowActor, currentStep } = get();
          
          if (workflowActor) {
            workflowActor.send({ type: 'COMPLETE_STEP', data });
          }
          
          // Update step history
          const stepHistory = [...get().stepHistory];
          const existingIndex = stepHistory.findIndex(s => s.step === currentStep);
          
          const stepData = {
            step: currentStep,
            status: 'completed' as const,
            data,
            completedAt: new Date().toISOString(),
            metrics: get().qualityMetrics,
          };
          
          if (existingIndex >= 0) {
            stepHistory[existingIndex] = stepData;
          } else {
            stepHistory.push(stepData);
          }
          
          set({ stepHistory });
          
          get().logEvent('STEP_COMPLETED', currentStep, data);
          
          // Auto-save checkpoint
          if (get().autoSaveEnabled) {
            await get().saveCheckpoint();
          }
        },

        skipCurrentStep: () => {
          const { workflowActor, currentStep } = get();
          
          if (workflowActor) {
            workflowActor.send({ type: 'SKIP_STEP' });
          }
          
          // Update step history
          const stepHistory = [...get().stepHistory];
          stepHistory.push({
            step: currentStep,
            status: 'skipped',
            completedAt: new Date().toISOString(),
          });
          
          set({ stepHistory });
          
          get().logEvent('STEP_SKIPPED', currentStep);
        },

        retryCurrentStep: () => {
          const { workflowActor, currentStep } = get();
          
          if (workflowActor) {
            workflowActor.send({ type: 'RETRY_STEP' });
          }
          
          set((state) => ({
            retryCount: state.retryCount + 1,
            error: null,
            stepErrors: {
              ...state.stepErrors,
              [currentStep]: '',
            },
          }));
          
          get().logEvent('STEP_RETRIED', currentStep);
        },

        updateQualityMetrics: (metrics: QualityMetrics) => {
          set({ qualityMetrics: metrics });
          
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'QUALITY_CHECK_COMPLETE', metrics });
          }
        },

        checkStepQuality: async (step: WorkflowStep, data: any): Promise<QualityMetrics> => {
          const { qualityChecker, stepData } = get();
          
          if (!qualityChecker) {
            throw new Error('Quality checker not initialized');
          }
          
          try {
            const metrics = await qualityChecker.checkStepQuality(step, data, stepData);
            get().updateQualityMetrics(metrics);
            return metrics;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Quality check failed';
            set({ error: errorMessage });
            throw error;
          }
        },

        overrideQualityCheck: () => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send({ type: 'OVERRIDE_QUALITY' });
          }
          get().logEvent('QUALITY_OVERRIDDEN', get().currentStep);
        },

        generateWithAI: async (prompt: string): Promise<string> => {
          const { workflowActor, currentStep } = get();
          
          set({ isAIProcessing: true, aiError: null });
          
          try {
            if (workflowActor) {
              workflowActor.send({ type: 'AI_GENERATE', prompt });
            }
            
            const response = await fetch('/api/ai/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt,
                step: currentStep,
                config: get().config,
                context: get().stepData,
              }),
            });
            
            if (!response.ok) {
              throw new Error(`AI generation failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            const content = data.content;
            
            // Add to generation history
            const generationRecord: AIGenerationRecord = {
              step: currentStep,
              prompt,
              response: content,
              timestamp: new Date(),
            };
            
            set((state) => ({
              aiResponse: content,
              aiGenerationHistory: [...state.aiGenerationHistory, generationRecord],
              isAIProcessing: false,
            }));
            
            if (workflowActor) {
              workflowActor.send({ type: 'AI_RESPONSE', response: content });
            }
            
            get().logEvent('AI_GENERATION', currentStep, { prompt, response: content });
            
            return content;
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'AI generation failed';
            set({
              isAIProcessing: false,
              aiError: errorMessage,
            });
            
            get().logEvent('AI_ERROR', currentStep, { error: errorMessage });
            throw error;
          }
        },

        regenerateCurrentStep: async () => {
          const { currentStep, stepData } = get();
          const currentStepData = stepData[currentStep] || {};
          
          const prompt = currentStepData.prompt || `Regenerate content for ${currentStep} step`;
          await get().generateWithAI(prompt);
        },

        updateConfig: (configUpdate: Partial<WorkflowConfig>) => {
          const newConfig = { ...get().config, ...configUpdate };
          set({ config: newConfig });
          
          // Update quality checker if level changed
          if (configUpdate.qualityLevel) {
            const qualityChecker = new QualityChecker(configUpdate.qualityLevel);
            set({ 
              qualityChecker,
              qualityThresholds: qualityChecker.getThresholds(),
            });
          }
          
          get().logEvent('CONFIG_UPDATED', get().currentStep, configUpdate);
        },

        resetConfig: () => {
          set({ config: DEFAULT_CONFIG });
          const qualityChecker = new QualityChecker(DEFAULT_CONFIG.qualityLevel);
          set({ 
            qualityChecker,
            qualityThresholds: qualityChecker.getThresholds(),
          });
        },

        saveCheckpoint: async () => {
          const { currentWorkflow, currentStep, stepData, stepResults, qualityMetrics } = get();
          
          if (!currentWorkflow) return;
          
          const checkpoint = {
            workflowId: currentWorkflow.id,
            documentId: currentWorkflow.documentId,
            currentStep,
            stepData,
            stepResults,
            qualityMetrics,
            timestamp: new Date().toISOString(),
          };
          
          try {
            const response = await fetch('/api/workflow/checkpoint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(checkpoint),
            });
            
            if (!response.ok) {
              throw new Error('Failed to save checkpoint');
            }
            
            set({ 
              lastSavedAt: new Date(),
              checkpointData: checkpoint,
            });
            
            get().logEvent('CHECKPOINT_SAVED', currentStep);
            
          } catch (error) {
            console.warn('Failed to save checkpoint:', error);
          }
        },

        restoreCheckpoint: async (data: any) => {
          const { workflowActor } = get();
          
          if (workflowActor) {
            workflowActor.send({ type: 'RESTORE_CHECKPOINT', data });
          }
          
          set({
            currentStep: data.currentStep,
            stepData: data.stepData,
            stepResults: data.stepResults,
            qualityMetrics: data.qualityMetrics,
            checkpointData: data,
          });
          
          get().logEvent('CHECKPOINT_RESTORED', data.currentStep);
        },

        enableAutoSave: () => {
          const { config } = get();
          set({ autoSaveEnabled: true });
          
          // Setup auto-save interval
          setInterval(() => {
            if (get().autoSaveEnabled && get().isActive) {
              get().saveCheckpoint();
            }
          }, config.saveInterval);
        },

        disableAutoSave: () => {
          set({ autoSaveEnabled: false });
        },

        sendEvent: (event: WorkflowEvent) => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.send(event);
          }
        },

        subscribeToEvents: (callback: (event: WorkflowEvent) => void) => {
          const { workflowActor } = get();
          if (!workflowActor) return () => {};
          
          return workflowActor.subscribe((state) => {
            // This is a simplified event subscription
            // In a full implementation, you'd capture actual events
            callback({ type: 'STATE_CHANGE' } as WorkflowEvent);
          }).unsubscribe;
        },

        // Utility functions
        getStepIndex: (step: WorkflowStep) => {
          const steps = ['planning', 'drafting', 'citation', 'grammar', 'readability'];
          return steps.indexOf(step);
        },

        getNextStep: () => {
          const currentIndex = get().getStepIndex(get().currentStep);
          const steps = ['planning', 'drafting', 'citation', 'grammar', 'readability'];
          const { config } = get();
          
          for (let i = currentIndex + 1; i < steps.length; i++) {
            const step = steps[i] as WorkflowStep;
            if (step === 'citation' && !config.includeCitations) continue;
            return step;
          }
          
          return null;
        },

        getPreviousStep: () => {
          const currentIndex = get().getStepIndex(get().currentStep);
          const steps = ['planning', 'drafting', 'citation', 'grammar', 'readability'];
          const { config } = get();
          
          for (let i = currentIndex - 1; i >= 0; i--) {
            const step = steps[i] as WorkflowStep;
            if (step === 'citation' && !config.includeCitations) continue;
            return step;
          }
          
          return null;
        },

        canGoToNextStep: () => get().getNextStep() !== null,
        canGoToPreviousStep: () => get().getPreviousStep() !== null,

        calculateProgress: () => {
          const { currentStep, stepHistory, config } = get();
          const steps = ['planning', 'drafting', 'citation', 'grammar', 'readability'];
          const activeSteps = steps.filter(step => {
            if (step === 'citation' && !config.includeCitations) return false;
            return true;
          });
          
          const totalSteps = activeSteps.length;
          const completedSteps = stepHistory.filter(s => 
            s.status === 'completed' && activeSteps.includes(s.step)
          ).length;
          
          const overallProgress = Math.round((completedSteps / totalSteps) * 100);
          set({ overallProgress });
        },

        setError: (error: string | null) => {
          set({ error });
          if (error) {
            get().logEvent('ERROR', get().currentStep, { error });
          }
        },

        clearError: () => {
          set({ error: null, aiError: null });
        },

        cleanup: () => {
          const { workflowActor } = get();
          if (workflowActor) {
            workflowActor.stop();
          }
          set(initialState);
        },

        // Helper method to log events
        logEvent: (type: string, step: WorkflowStep, data?: any) => {
          const eventLog = [...get().eventLog];
          eventLog.push({
            type,
            step,
            timestamp: new Date(),
            data,
          });
          
          // Keep only last 100 events
          if (eventLog.length > 100) {
            eventLog.shift();
          }
          
          set({ eventLog });
        },
      }),
      {
        name: 'workflow-store',
        partialize: (state) => ({
          config: state.config,
          qualityThresholds: state.qualityThresholds,
          lastSavedAt: state.lastSavedAt,
          checkpointData: state.checkpointData,
        }),
      }
    ),
    {
      name: 'workflow-store',
    }
  )
);

// --- Helper functions for step logic ---

// Get next step based on config
const getNextStepFrom = (step: WorkflowStep, config: WorkflowConfig): WorkflowStep | null => {
  const allSteps: WorkflowStep[] = ['planning', 'drafting', 'citation', 'grammar', 'readability'];
  const currentIndex = allSteps.indexOf(step);

  for (let i = currentIndex + 1; i < allSteps.length; i++) {
    const nextStep = allSteps[i];
    if (config.skipOptionalSteps) {
      // Check if step is optional (logic to be defined)
      continue;
    }
    return nextStep;
  }
  return null;
};

// Get previous step
const getPreviousStepFrom = (step: WorkflowStep): WorkflowStep | null => {
  const allSteps: WorkflowStep[] = ['planning', 'drafting', 'citation', 'grammar', 'readability'];
  const currentIndex = allSteps.indexOf(step);
  return currentIndex > 0 ? allSteps[currentIndex - 1] : null;
};

// --- Zustand Hooks ---
export const useWorkflow = () => useWorkflowStore((state) => ({
  currentWorkflow: state.currentWorkflow,
  isActive: state.isActive,
  isLoading: state.isLoading,
  error: state.error,
  currentStep: state.currentStep,
  stepProgress: state.stepProgress,
  overallProgress: state.overallProgress,
  workflowStatus: state.workflowStatus,
}));

export const useWorkflowActions = () => useWorkflowStore((state) => ({
  initializeWorkflow: state.initializeWorkflow,
  startWorkflow: state.startWorkflow,
  pauseWorkflow: state.pauseWorkflow,
  resumeWorkflow: state.resumeWorkflow,
  cancelWorkflow: state.cancelWorkflow,
  completeWorkflow: state.completeWorkflow,
  sendEvent: state.sendEvent,
}));

export const useWorkflowSteps = () => useWorkflowStore((state) => {
  const steps = state.currentWorkflow?.steps || [];
  const currentStep = steps.find(s => s.step === state.currentStep);
  
  return {
    steps,
    currentStep,
    currentStepName: state.currentStep,
    stepHistory: state.stepHistory,
    stepResults: state.stepResults,
    stepErrors: state.stepErrors,
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    goToStep: state.goToStep,
    completeCurrentStep: state.completeCurrentStep,
    skipCurrentStep: state.skipCurrentStep,
    retryCurrentStep: state.retryCurrentStep,
    canGoToNextStep: state.canGoToNextStep,
    canGoToPreviousStep: state.canGoToPreviousStep,
    canSkipStep: state.canSkipStep,
    canRetry: state.canRetry,
    retryCount: state.retryCount,
    maxRetries: state.maxRetries,
  };
});

export const useWorkflowQuality = () => useWorkflowStore((state) => ({
  qualityMetrics: state.qualityMetrics,
  qualityThresholds: state.qualityThresholds,
  qualityChecker: state.qualityChecker,
  checkStepQuality: state.checkStepQuality,
  overrideQualityCheck: state.overrideQualityCheck,
  updateQualityMetrics: state.updateQualityMetrics,
}));

export const useWorkflowAI = () => useWorkflowStore((state) => ({
  isAIProcessing: state.isAIProcessing,
  aiError: state.aiError,
  aiResponse: state.aiResponse,
  aiGenerationHistory: state.aiGenerationHistory,
  generateWithAI: state.generateWithAI,
  regenerateCurrentStep: state.regenerateCurrentStep,
}));

export const useWorkflowConfig = () => useWorkflowStore((state) => ({
  config: state.config,
  updateConfig: state.updateConfig,
  resetConfig: state.resetConfig,
}));

export const useWorkflowPersistence = () => useWorkflowStore((state) => ({
  lastSavedAt: state.lastSavedAt,
  checkpointData: state.checkpointData,
  autoSaveEnabled: state.autoSaveEnabled,
  saveCheckpoint: state.saveCheckpoint,
  restoreCheckpoint: state.restoreCheckpoint,
  enableAutoSave: state.enableAutoSave,
  disableAutoSave: state.disableAutoSave,
}));

export const useWorkflowEvents = () => useWorkflowStore((state) => ({
  eventLog: state.eventLog,
  sendEvent: state.sendEvent,
  subscribeToEvents: state.subscribeToEvents,
}));