/**
 * Workflow Store - AI writing workflow state management
 * Handles the 5-step writing process: Plan → Research → Outline → Writing → Review
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';
import { WritingWorkflow, WorkflowStep, WorkflowStepData, AIWritingRequest, AIWritingResponse } from '@/types';

// Workflow state interface
export interface WorkflowState {
  // Current workflow
  currentWorkflow: WritingWorkflow | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Step management
  currentStep: WorkflowStep;
  stepProgress: number; // 0-100 for current step
  overallProgress: number; // 0-100 for entire workflow
  
  // Step data storage
  stepData: Partial<Record<WorkflowStep, any>>;
  stepHistory: WorkflowStepData[];
  
  // AI interaction
  isAIProcessing: boolean;
  aiError: string | null;
  aiResponse: AIWritingResponse | null;
  
  // Workflow configuration
  config: WorkflowConfig;
  
  // Workflow history
  workflowHistory: WritingWorkflow[];
  
  // Actions
  startWorkflow: (documentId: string, config?: Partial<WorkflowConfig>) => Promise<void>;
  pauseWorkflow: () => void;
  resumeWorkflow: () => void;
  cancelWorkflow: () => void;
  completeWorkflow: () => Promise<void>;
  
  // Step management
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: WorkflowStep) => void;
  completeCurrentStep: (data?: any) => Promise<void>;
  skipCurrentStep: () => void;
  
  // Step data management
  updateStepData: (step: WorkflowStep, data: any) => void;
  getStepData: (step: WorkflowStep) => any;
  clearStepData: (step: WorkflowStep) => void;
  
  // AI interactions
  generateWithAI: (request: AIWritingRequest) => Promise<AIWritingResponse>;
  regenerateCurrentStep: () => Promise<void>;
  
  // Configuration
  updateConfig: (config: Partial<WorkflowConfig>) => void;
  resetConfig: () => void;
  
  // History
  loadWorkflowHistory: () => Promise<void>;
  restoreWorkflow: (workflowId: string) => Promise<void>;
  
  // Utils
  getStepIndex: (step: WorkflowStep) => number;
  getNextStep: () => WorkflowStep | null;
  getPreviousStep: () => WorkflowStep | null;
  canGoToNextStep: () => boolean;
  canGoToPreviousStep: () => boolean;
  calculateProgress: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface WorkflowConfig {
  autoAdvance: boolean;
  skipOptionalSteps: boolean;
  aiAssistanceLevel: 'minimal' | 'moderate' | 'full';
  writingStyle: string;
  targetLength: 'short' | 'medium' | 'long';
  includeResearch: boolean;
  includeCitations: boolean;
  reviewType: 'basic' | 'comprehensive';
}

// Workflow steps in order
const WORKFLOW_STEPS: WorkflowStep[] = [
  'planning',
  'research', 
  'outlining',
  'writing',
  'editing'
];

// Default configuration
const DEFAULT_CONFIG: WorkflowConfig = {
  autoAdvance: false,
  skipOptionalSteps: false,
  aiAssistanceLevel: 'moderate',
  writingStyle: 'professional',
  targetLength: 'medium',
  includeResearch: true,
  includeCitations: true,
  reviewType: 'comprehensive',
};

// Initial state
const initialState = {
  currentWorkflow: null,
  isActive: false,
  isLoading: false,
  error: null,
  currentStep: 'planning' as WorkflowStep,
  stepProgress: 0,
  overallProgress: 0,
  stepData: {},
  stepHistory: [],
  isAIProcessing: false,
  aiError: null,
  aiResponse: null,
  config: DEFAULT_CONFIG,
  workflowHistory: [],
};

// Create the workflow store
export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        startWorkflow: async (documentId: string, configOverrides?: Partial<WorkflowConfig>) => {
          set({ isLoading: true, error: null });
          
          try {
            const config = { ...get().config, ...configOverrides };
            
            const workflowData = {
              documentId,
              currentStep: 'planning' as WorkflowStep,
              steps: WORKFLOW_STEPS.map(step => ({
                step,
                status: step === 'planning' ? 'in_progress' as const : 'pending' as const,
                data: {},
              })),
              progress: 0,
              isActive: true,
            };

            // Create workflow on server
            const response = await fetch('/api/workflows', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(workflowData),
            });

            if (!response.ok) {
              throw new Error('Failed to start workflow');
            }

            const workflow = await response.json();

            set({
              currentWorkflow: workflow,
              isActive: true,
              isLoading: false,
              currentStep: 'planning',
              stepProgress: 0,
              overallProgress: 0,
              stepData: {},
              stepHistory: [],
              config,
            });

            get().calculateProgress();
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to start workflow',
            });
            throw error;
          }
        },

        pauseWorkflow: () => {
          set({ isActive: false });
        },

        resumeWorkflow: () => {
          if (get().currentWorkflow) {
            set({ isActive: true });
          }
        },

        cancelWorkflow: () => {
          set({
            currentWorkflow: null,
            isActive: false,
            currentStep: 'planning',
            stepProgress: 0,
            overallProgress: 0,
            stepData: {},
            stepHistory: [],
          });
        },

        completeWorkflow: async () => {
          const { currentWorkflow } = get();
          if (!currentWorkflow) return;

          try {
            await fetch(`/api/workflows/${currentWorkflow.id}/complete`, {
              method: 'POST',
            });

            // Add to history
            set((state) => ({
              workflowHistory: [currentWorkflow, ...state.workflowHistory],
              currentWorkflow: null,
              isActive: false,
              overallProgress: 100,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to complete workflow',
            });
            throw error;
          }
        },

        nextStep: () => {
          const nextStep = get().getNextStep();
          if (nextStep && get().canGoToNextStep()) {
            get().goToStep(nextStep);
          }
        },

        previousStep: () => {
          const previousStep = get().getPreviousStep();
          if (previousStep && get().canGoToPreviousStep()) {
            get().goToStep(previousStep);
          }
        },

        goToStep: (step: WorkflowStep) => {
          const { config } = get();
          
          // Skip research step if not included in config
          if (step === 'research' && !config.includeResearch) {
            const nextIndex = get().getStepIndex('outlining');
            if (nextIndex !== -1) {
              step = WORKFLOW_STEPS[nextIndex];
            }
          }

          set({
            currentStep: step,
            stepProgress: 0,
          });

          get().calculateProgress();
        },

        completeCurrentStep: async (data?: any) => {
          const { currentStep, currentWorkflow } = get();
          
          if (data) {
            get().updateStepData(currentStep, data);
          }

          // Mark step as completed
          const stepHistory = [...get().stepHistory];
          const existingStepIndex = stepHistory.findIndex(s => s.step === currentStep);
          
          const stepData: WorkflowStepData = {
            step: currentStep,
            status: 'completed',
            completedAt: new Date().toISOString(),
          };

          if (existingStepIndex >= 0) {
            stepHistory[existingStepIndex] = stepData;
          } else {
            stepHistory.push(stepData);
          }

          set({
            stepHistory,
            stepProgress: 100,
          });

          // Auto-advance if configured
          if (get().config.autoAdvance) {
            const nextStep = get().getNextStep();
            if (nextStep) {
              setTimeout(() => get().goToStep(nextStep), 1000);
            } else {
              // All steps completed
              await get().completeWorkflow();
            }
          }

          get().calculateProgress();

          // Save progress to server
          if (currentWorkflow) {
            try {
              await fetch(`/api/workflows/${currentWorkflow.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  currentStep: get().currentStep,
                  steps: stepHistory,
                  progress: get().overallProgress,
                }),
              });
            } catch (error) {
              console.warn('Failed to save workflow progress:', error);
            }
          }
        },

        skipCurrentStep: () => {
          const { currentStep } = get();
          const stepHistory = [...get().stepHistory];
          
          stepHistory.push({
            step: currentStep,
            status: 'skipped',
            completedAt: new Date().toISOString(),
          });

          set({ stepHistory });

          // Move to next step
          const nextStep = get().getNextStep();
          if (nextStep) {
            get().goToStep(nextStep);
          }
        },

        updateStepData: (step: WorkflowStep, data: any) => {
          set((state) => ({
            stepData: {
              ...state.stepData,
              [step]: { ...state.stepData[step], ...data },
            },
          }));
        },

        getStepData: (step: WorkflowStep) => {
          return get().stepData[step] || {};
        },

        clearStepData: (step: WorkflowStep) => {
          set((state) => {
            const newStepData = { ...state.stepData };
            delete newStepData[step];
            return { stepData: newStepData };
          });
        },

        generateWithAI: async (request: AIWritingRequest) => {
          set({ isAIProcessing: true, aiError: null });
          
          try {
            const response = await fetch('/api/ai/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(request),
            });

            if (!response.ok) {
              throw new Error('AI generation failed');
            }

            const aiResponse = await response.json();
            
            set({
              isAIProcessing: false,
              aiResponse,
            });

            return aiResponse;
          } catch (error) {
            set({
              isAIProcessing: false,
              aiError: error instanceof Error ? error.message : 'AI generation failed',
            });
            throw error;
          }
        },

        regenerateCurrentStep: async (): Promise<AIWritingResponse> => {
          const { currentStep, stepData, config } = get();
          const currentStepData = stepData[currentStep] || {};
          
          const request: AIWritingRequest = {
            prompt: currentStepData.prompt || `Generate content for ${currentStep} step`,
            style: config.writingStyle,
            length: config.targetLength,
            context: JSON.stringify(stepData),
          };

          const response = await get().generateWithAI(request);
          
          // Update step data with AI response
          get().updateStepData(currentStep, {
            ...currentStepData,
            aiGenerated: response.content,
            lastGenerated: new Date().toISOString(),
          });

          return response;
        },

        updateConfig: (configUpdate: Partial<WorkflowConfig>) => {
          set((state) => ({
            config: { ...state.config, ...configUpdate },
          }));
        },

        resetConfig: () => {
          set({ config: DEFAULT_CONFIG });
        },

        loadWorkflowHistory: async () => {
          try {
            const response = await fetch('/api/workflows/history');
            
            if (!response.ok) {
              throw new Error('Failed to load workflow history');
            }

            const history = await response.json();
            set({ workflowHistory: history });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load workflow history',
            });
          }
        },

        restoreWorkflow: async (workflowId: string) => {
          try {
            const response = await fetch(`/api/workflows/${workflowId}`);
            
            if (!response.ok) {
              throw new Error('Failed to restore workflow');
            }

            const workflow = await response.json();
            
            set({
              currentWorkflow: workflow,
              isActive: true,
              currentStep: workflow.currentStep,
              stepHistory: workflow.steps,
            });

            // Rebuild step data from history
            const stepData: Partial<Record<WorkflowStep, any>> = {};
            workflow.steps.forEach((step: WorkflowStepData) => {
              // Store basic step info since WorkflowStepData doesn't have data field
              stepData[step.step] = { status: step.status };
            });

            set({ stepData });
            get().calculateProgress();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to restore workflow',
            });
            throw error;
          }
        },

        // Utility functions
        getStepIndex: (step: WorkflowStep) => {
          return WORKFLOW_STEPS.indexOf(step);
        },

        getNextStep: () => {
          const currentIndex = get().getStepIndex(get().currentStep);
          const { config } = get();
          
          for (let i = currentIndex + 1; i < WORKFLOW_STEPS.length; i++) {
            const step = WORKFLOW_STEPS[i];
            
            // Skip research if not included
            if (step === 'research' && !config.includeResearch) {
              continue;
            }
            
            return step;
          }
          
          return null;
        },

        getPreviousStep: () => {
          const currentIndex = get().getStepIndex(get().currentStep);
          const { config } = get();
          
          for (let i = currentIndex - 1; i >= 0; i--) {
            const step = WORKFLOW_STEPS[i];
            
            // Skip research if not included
            if (step === 'research' && !config.includeResearch) {
              continue;
            }
            
            return step;
          }
          
          return null;
        },

        canGoToNextStep: () => {
          return get().getNextStep() !== null;
        },

        canGoToPreviousStep: () => {
          return get().getPreviousStep() !== null;
        },

        calculateProgress: () => {
          const { currentStep, stepHistory, config } = get();
          const currentIndex = get().getStepIndex(currentStep);
          
          // Filter out skipped optional steps
          const activeSteps = WORKFLOW_STEPS.filter(step => {
            if (step === 'research' && !config.includeResearch) {
              return false;
            }
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
        },

        clearError: () => {
          set({ error: null, aiError: null });
        },
      }),
      {
        name: 'workflow-store',
        partialize: (state) => ({
          config: state.config,
          stepData: state.stepData,
        }),
      }
    ),
    {
      name: 'workflow-store',
    }
  )
);

// Selectors for common use cases
export const useWorkflow = () => useWorkflowStore((state) => ({
  currentWorkflow: state.currentWorkflow,
  isActive: state.isActive,
  isLoading: state.isLoading,
  error: state.error,
  currentStep: state.currentStep,
  stepProgress: state.stepProgress,
  overallProgress: state.overallProgress,
}));

export const useWorkflowActions = () => useWorkflowStore((state) => ({
  startWorkflow: state.startWorkflow,
  pauseWorkflow: state.pauseWorkflow,
  resumeWorkflow: state.resumeWorkflow,
  cancelWorkflow: state.cancelWorkflow,
  completeWorkflow: state.completeWorkflow,
}));

export const useWorkflowSteps = () => useWorkflowStore((state) => ({
  currentStep: state.currentStep,
  stepHistory: state.stepHistory,
  nextStep: state.nextStep,
  previousStep: state.previousStep,
  goToStep: state.goToStep,
  completeCurrentStep: state.completeCurrentStep,
  skipCurrentStep: state.skipCurrentStep,
  canGoToNextStep: state.canGoToNextStep(),
  canGoToPreviousStep: state.canGoToPreviousStep(),
}));

export const useWorkflowAI = () => useWorkflowStore((state) => ({
  isAIProcessing: state.isAIProcessing,
  aiError: state.aiError,
  aiResponse: state.aiResponse,
  generateWithAI: state.generateWithAI,
  regenerateCurrentStep: state.regenerateCurrentStep,
}));

export const useWorkflowConfig = () => useWorkflowStore((state) => ({
  config: state.config,
  updateConfig: state.updateConfig,
  resetConfig: state.resetConfig,
}));