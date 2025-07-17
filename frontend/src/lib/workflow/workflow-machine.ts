/**
 * XState Workflow Machine - Complete writing workflow automation
 * Manages the 5-step writing process with state machine precision
 */

import { createMachine, assign, fromPromise, ActorRefFrom } from 'xstate';
import { QualityChecker, QualityMetrics } from './quality-checker';
import type { WorkflowStep } from '@/types/layout';

// Context types for the workflow machine
export interface WorkflowContext {
  documentId: string;
  workflowId: string;
  currentStep: WorkflowStep;
  stepProgress: number;
  overallProgress: number;
  
  // Step data storage
  stepData: Record<string, any>;
  stepResults: Record<string, any>;
  
  // Quality metrics
  qualityMetrics: QualityMetrics;
  qualityThresholds: Record<string, number>;
  
  // AI interaction
  aiPrompt: string;
  aiResponse: string;
  
  // Error handling
  error: string | null;
  retryCount: number;
  maxRetries: number;
  
  // User intervention
  userOverride: boolean;
  manualMode: boolean;
  
  // Configuration
  config: WorkflowConfig;
  
  // Persistence
  lastSavedAt: Date | null;
  checkpointData: any;
}

export interface WorkflowConfig {
  autoAdvance: boolean;
  skipOptionalSteps: boolean;
  aiAssistanceLevel: 'minimal' | 'moderate' | 'full';
  qualityLevel: 'basic' | 'standard' | 'strict';
  writingStyle: string;
  targetLength: 'short' | 'medium' | 'long';
  includeResearch: boolean;
  includeCitations: boolean;
  reviewType: 'basic' | 'comprehensive';
  enableAutoSave: boolean;
  saveInterval: number;
}

// Events that can be sent to the machine
export type WorkflowEvent =
  | { type: 'START_WORKFLOW'; documentId: string; config?: Partial<WorkflowConfig> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GOTO_STEP'; step: WorkflowStep }
  | { type: 'COMPLETE_STEP'; data?: any }
  | { type: 'SKIP_STEP' }
  | { type: 'RETRY_STEP' }
  | { type: 'PAUSE_WORKFLOW' }
  | { type: 'RESUME_WORKFLOW' }
  | { type: 'CANCEL_WORKFLOW' }
  | { type: 'OVERRIDE_QUALITY' }
  | { type: 'ENABLE_MANUAL_MODE' }
  | { type: 'DISABLE_MANUAL_MODE' }
  | { type: 'AI_GENERATE'; prompt: string }
  | { type: 'AI_RESPONSE'; response: string }
  | { type: 'QUALITY_CHECK_COMPLETE'; metrics: QualityMetrics }
  | { type: 'SAVE_CHECKPOINT' }
  | { type: 'RESTORE_CHECKPOINT'; data: any }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' };

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
  saveInterval: 30000, // 30 seconds
};

// Default quality thresholds
const DEFAULT_QUALITY_THRESHOLDS = {
  planning: 0.7,
  drafting: 0.6,
  citation: 0.8,
  grammar: 0.85,
  readability: 0.75,
};

// AI generation function
const aiGenerate = fromPromise(async ({ input }: { input: { prompt: string; context: WorkflowContext } }) => {
  const { prompt, context } = input;
  
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      documentId: context.documentId,
      step: context.currentStep,
      config: context.config,
      context: context.stepData,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content;
});

// Quality checking function
const qualityCheck = fromPromise(async ({ input }: { input: { step: WorkflowStep; data: any; context: WorkflowContext } }) => {
  const { step, data, context } = input;
  const checker = new QualityChecker(context.config.qualityLevel);
  
  const metrics = await checker.checkStepQuality(step, data, context.stepData);
  
  return {
    metrics,
    passed: metrics.overallScore >= context.qualityThresholds[step],
  };
});

// Persistence function
const saveCheckpoint = fromPromise(async ({ input }: { input: { context: WorkflowContext } }) => {
  const { context } = input;
  
  const checkpoint = {
    documentId: context.documentId,
    workflowId: context.workflowId,
    currentStep: context.currentStep,
    stepProgress: context.stepProgress,
    overallProgress: context.overallProgress,
    stepData: context.stepData,
    stepResults: context.stepResults,
    qualityMetrics: context.qualityMetrics,
    config: context.config,
    timestamp: new Date().toISOString(),
  };

  await fetch('/api/workflow/checkpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkpoint),
  });

  return checkpoint;
});

// Create the workflow state machine
export const workflowMachine = createMachine({
  id: 'workflowMachine',
  types: {
    context: {} as WorkflowContext,
    events: {} as WorkflowEvent,
  },
  
  context: {
    documentId: '',
    workflowId: '',
    currentStep: 'idle' as WorkflowStep,
    stepProgress: 0,
    overallProgress: 0,
    stepData: {},
    stepResults: {},
    qualityMetrics: {
      overallScore: 0,
      metrics: {},
      suggestions: [],
      timestamp: new Date(),
    },
    qualityThresholds: DEFAULT_QUALITY_THRESHOLDS,
    aiPrompt: '',
    aiResponse: '',
    error: null,
    retryCount: 0,
    maxRetries: 3,
    userOverride: false,
    manualMode: false,
    config: DEFAULT_CONFIG,
    lastSavedAt: null,
    checkpointData: null,
  },

  initial: 'idle',
  
  states: {
    idle: {
      on: {
        START_WORKFLOW: {
          target: 'initializing',
          actions: assign({
            documentId: ({ event }) => event.documentId,
            workflowId: () => `workflow_${Date.now()}`,
            config: ({ context, event }) => ({ ...context.config, ...event.config }),
            currentStep: () => 'planning' as WorkflowStep,
            stepProgress: () => 0,
            overallProgress: () => 0,
            stepData: () => ({}),
            stepResults: () => ({}),
            error: () => null,
            retryCount: () => 0,
            userOverride: () => false,
            manualMode: () => false,
          }),
        },
      },
    },

    initializing: {
      invoke: {
        src: saveCheckpoint,
        input: ({ context }) => ({ context }),
        onDone: {
          target: 'planning',
          actions: assign({
            lastSavedAt: () => new Date(),
            checkpointData: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => `Initialization failed: ${event.error}`,
          }),
        },
      },
    },

    planning: {
      entry: assign({
        currentStep: () => 'planning' as WorkflowStep,
        stepProgress: () => 0,
      }),
      
      initial: 'processing',
      
      states: {
        processing: {
          invoke: {
            src: aiGenerate,
            input: ({ context }) => ({
              prompt: `Create a detailed writing plan for the document. Consider the target length: ${context.config.targetLength}, writing style: ${context.config.writingStyle}, and whether to include research: ${context.config.includeResearch}.`,
              context,
            }),
            onDone: {
              target: 'qualityChecking',
              actions: assign({
                aiResponse: ({ event }) => event.output,
                stepProgress: () => 60,
              }),
            },
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Planning AI generation failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityChecking: {
          invoke: {
            src: qualityCheck,
            input: ({ context }) => ({
              step: 'planning' as WorkflowStep,
              data: { content: context.aiResponse },
              context,
            }),
            onDone: [
              {
                target: 'completed',
                guard: ({ event }) => event.output.passed,
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                  stepProgress: () => 100,
                  stepResults: ({ context, event }) => ({
                    ...context.stepResults,
                    planning: {
                      content: context.aiResponse,
                      metrics: event.output.metrics,
                      completedAt: new Date().toISOString(),
                    },
                  }),
                }),
              },
              {
                target: 'qualityFailed',
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                }),
              },
            ],
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Quality check failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityFailed: {
          on: {
            RETRY_STEP: {
              target: 'processing',
              guard: ({ context }) => context.retryCount < context.maxRetries,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
                error: () => null,
              }),
            },
            OVERRIDE_QUALITY: {
              target: 'completed',
              actions: assign({
                userOverride: () => true,
                stepProgress: () => 100,
                stepResults: ({ context }) => ({
                  ...context.stepResults,
                  planning: {
                    content: context.aiResponse,
                    metrics: context.qualityMetrics,
                    completedAt: new Date().toISOString(),
                    overridden: true,
                  },
                }),
              }),
            },
          },
        },
        
        completed: {
          on: {
            NEXT_STEP: {
              target: '#workflowMachine.drafting',
              actions: assign({
                overallProgress: ({ context }) => calculateOverallProgress(context, 'planning'),
              }),
            },
            COMPLETE_STEP: {
              target: '#workflowMachine.drafting',
              actions: assign({
                stepData: ({ context, event }) => ({
                  ...context.stepData,
                  planning: event.data || { content: context.aiResponse },
                }),
                overallProgress: ({ context }) => calculateOverallProgress(context, 'planning'),
              }),
            },
          },
        },
        
        error: {
          on: {
            RETRY: {
              target: 'processing',
              actions: assign({
                error: () => null,
                retryCount: ({ context }) => context.retryCount + 1,
              }),
            },
          },
        },
      },
    },

    drafting: {
      entry: assign({
        currentStep: () => 'drafting' as WorkflowStep,
        stepProgress: () => 0,
      }),
      
      initial: 'processing',
      
      states: {
        processing: {
          invoke: {
            src: aiGenerate,
            input: ({ context }) => ({
              prompt: `Based on the planning data, write a ${context.config.targetLength} ${context.config.writingStyle} draft. Planning: ${JSON.stringify(context.stepData.planning)}`,
              context,
            }),
            onDone: {
              target: 'qualityChecking',
              actions: assign({
                aiResponse: ({ event }) => event.output,
                stepProgress: () => 60,
              }),
            },
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Drafting AI generation failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityChecking: {
          invoke: {
            src: qualityCheck,
            input: ({ context }) => ({
              step: 'drafting' as WorkflowStep,
              data: { content: context.aiResponse },
              context,
            }),
            onDone: [
              {
                target: 'completed',
                guard: ({ event }) => event.output.passed,
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                  stepProgress: () => 100,
                  stepResults: ({ context, event }) => ({
                    ...context.stepResults,
                    drafting: {
                      content: context.aiResponse,
                      metrics: event.output.metrics,
                      completedAt: new Date().toISOString(),
                    },
                  }),
                }),
              },
              {
                target: 'qualityFailed',
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                }),
              },
            ],
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Quality check failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityFailed: {
          on: {
            RETRY_STEP: {
              target: 'processing',
              guard: ({ context }) => context.retryCount < context.maxRetries,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
                error: () => null,
              }),
            },
            OVERRIDE_QUALITY: {
              target: 'completed',
              actions: assign({
                userOverride: () => true,
                stepProgress: () => 100,
              }),
            },
          },
        },
        
        completed: {
          on: {
            NEXT_STEP: {
              target: '#workflowMachine.citation',
              actions: assign({
                overallProgress: ({ context }) => calculateOverallProgress(context, 'drafting'),
              }),
            },
            PREVIOUS_STEP: {
              target: '#workflowMachine.planning',
            },
            COMPLETE_STEP: {
              target: '#workflowMachine.citation',
              actions: assign({
                stepData: ({ context, event }) => ({
                  ...context.stepData,
                  drafting: event.data || { content: context.aiResponse },
                }),
                overallProgress: ({ context }) => calculateOverallProgress(context, 'drafting'),
              }),
            },
          },
        },
        
        error: {
          on: {
            RETRY: {
              target: 'processing',
              actions: assign({
                error: () => null,
                retryCount: ({ context }) => context.retryCount + 1,
              }),
            },
          },
        },
      },
    },

    citation: {
      entry: assign({
        currentStep: () => 'citation' as WorkflowStep,
        stepProgress: () => 0,
      }),
      
      initial: 'checking',
      
      states: {
        checking: {
          always: [
            {
              target: 'completed',
              guard: ({ context }) => !context.config.includeCitations,
              actions: assign({
                stepProgress: () => 100,
                stepResults: ({ context }) => ({
                  ...context.stepResults,
                  citation: {
                    content: 'Citations skipped per configuration',
                    skipped: true,
                    completedAt: new Date().toISOString(),
                  },
                }),
              }),
            },
            {
              target: 'processing',
            },
          ],
        },
        
        processing: {
          invoke: {
            src: aiGenerate,
            input: ({ context }) => ({
              prompt: `Review and validate citations in the draft. Add proper formatting and check for accuracy. Draft: ${JSON.stringify(context.stepData.drafting)}`,
              context,
            }),
            onDone: {
              target: 'qualityChecking',
              actions: assign({
                aiResponse: ({ event }) => event.output,
                stepProgress: () => 60,
              }),
            },
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Citation processing failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityChecking: {
          invoke: {
            src: qualityCheck,
            input: ({ context }) => ({
              step: 'citation' as WorkflowStep,
              data: { content: context.aiResponse },
              context,
            }),
            onDone: [
              {
                target: 'completed',
                guard: ({ event }) => event.output.passed,
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                  stepProgress: () => 100,
                  stepResults: ({ context, event }) => ({
                    ...context.stepResults,
                    citation: {
                      content: context.aiResponse,
                      metrics: event.output.metrics,
                      completedAt: new Date().toISOString(),
                    },
                  }),
                }),
              },
              {
                target: 'qualityFailed',
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                }),
              },
            ],
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Quality check failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityFailed: {
          on: {
            RETRY_STEP: {
              target: 'processing',
              guard: ({ context }) => context.retryCount < context.maxRetries,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
                error: () => null,
              }),
            },
            OVERRIDE_QUALITY: {
              target: 'completed',
              actions: assign({
                userOverride: () => true,
                stepProgress: () => 100,
              }),
            },
          },
        },
        
        completed: {
          on: {
            NEXT_STEP: {
              target: '#workflowMachine.grammar',
              actions: assign({
                overallProgress: ({ context }) => calculateOverallProgress(context, 'citation'),
              }),
            },
            PREVIOUS_STEP: {
              target: '#workflowMachine.drafting',
            },
            COMPLETE_STEP: {
              target: '#workflowMachine.grammar',
              actions: assign({
                stepData: ({ context, event }) => ({
                  ...context.stepData,
                  citation: event.data || { content: context.aiResponse },
                }),
                overallProgress: ({ context }) => calculateOverallProgress(context, 'citation'),
              }),
            },
          },
        },
        
        error: {
          on: {
            RETRY: {
              target: 'processing',
              actions: assign({
                error: () => null,
                retryCount: ({ context }) => context.retryCount + 1,
              }),
            },
          },
        },
      },
    },

    grammar: {
      entry: assign({
        currentStep: () => 'grammar' as WorkflowStep,
        stepProgress: () => 0,
      }),
      
      initial: 'processing',
      
      states: {
        processing: {
          invoke: {
            src: aiGenerate,
            input: ({ context }) => ({
              prompt: `Review and correct grammar, spelling, and style in the text. Ensure professional writing quality. Text: ${JSON.stringify(context.stepData.drafting)}`,
              context,
            }),
            onDone: {
              target: 'qualityChecking',
              actions: assign({
                aiResponse: ({ event }) => event.output,
                stepProgress: () => 60,
              }),
            },
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Grammar checking failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityChecking: {
          invoke: {
            src: qualityCheck,
            input: ({ context }) => ({
              step: 'grammar' as WorkflowStep,
              data: { content: context.aiResponse },
              context,
            }),
            onDone: [
              {
                target: 'completed',
                guard: ({ event }) => event.output.passed,
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                  stepProgress: () => 100,
                  stepResults: ({ context, event }) => ({
                    ...context.stepResults,
                    grammar: {
                      content: context.aiResponse,
                      metrics: event.output.metrics,
                      completedAt: new Date().toISOString(),
                    },
                  }),
                }),
              },
              {
                target: 'qualityFailed',
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                }),
              },
            ],
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Quality check failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityFailed: {
          on: {
            RETRY_STEP: {
              target: 'processing',
              guard: ({ context }) => context.retryCount < context.maxRetries,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
                error: () => null,
              }),
            },
            OVERRIDE_QUALITY: {
              target: 'completed',
              actions: assign({
                userOverride: () => true,
                stepProgress: () => 100,
              }),
            },
          },
        },
        
        completed: {
          on: {
            NEXT_STEP: {
              target: '#workflowMachine.readability',
              actions: assign({
                overallProgress: ({ context }) => calculateOverallProgress(context, 'grammar'),
              }),
            },
            PREVIOUS_STEP: {
              target: '#workflowMachine.citation',
            },
            COMPLETE_STEP: {
              target: '#workflowMachine.readability',
              actions: assign({
                stepData: ({ context, event }) => ({
                  ...context.stepData,
                  grammar: event.data || { content: context.aiResponse },
                }),
                overallProgress: ({ context }) => calculateOverallProgress(context, 'grammar'),
              }),
            },
          },
        },
        
        error: {
          on: {
            RETRY: {
              target: 'processing',
              actions: assign({
                error: () => null,
                retryCount: ({ context }) => context.retryCount + 1,
              }),
            },
          },
        },
      },
    },

    readability: {
      entry: assign({
        currentStep: () => 'readability' as WorkflowStep,
        stepProgress: () => 0,
      }),
      
      initial: 'processing',
      
      states: {
        processing: {
          invoke: {
            src: aiGenerate,
            input: ({ context }) => ({
              prompt: `Optimize text for readability and clarity. Ensure appropriate tone and flow. Text: ${JSON.stringify(context.stepData.grammar || context.stepData.drafting)}`,
              context,
            }),
            onDone: {
              target: 'qualityChecking',
              actions: assign({
                aiResponse: ({ event }) => event.output,
                stepProgress: () => 60,
              }),
            },
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Readability optimization failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityChecking: {
          invoke: {
            src: qualityCheck,
            input: ({ context }) => ({
              step: 'readability' as WorkflowStep,
              data: { content: context.aiResponse },
              context,
            }),
            onDone: [
              {
                target: 'completed',
                guard: ({ event }) => event.output.passed,
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                  stepProgress: () => 100,
                  stepResults: ({ context, event }) => ({
                    ...context.stepResults,
                    readability: {
                      content: context.aiResponse,
                      metrics: event.output.metrics,
                      completedAt: new Date().toISOString(),
                    },
                  }),
                }),
              },
              {
                target: 'qualityFailed',
                actions: assign({
                  qualityMetrics: ({ event }) => event.output.metrics,
                }),
              },
            ],
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => `Quality check failed: ${event.error}`,
              }),
            },
          },
        },
        
        qualityFailed: {
          on: {
            RETRY_STEP: {
              target: 'processing',
              guard: ({ context }) => context.retryCount < context.maxRetries,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
                error: () => null,
              }),
            },
            OVERRIDE_QUALITY: {
              target: 'completed',
              actions: assign({
                userOverride: () => true,
                stepProgress: () => 100,
              }),
            },
          },
        },
        
        completed: {
          on: {
            NEXT_STEP: {
              target: 'workflowCompleted',
              actions: assign({
                overallProgress: () => 100,
              }),
            },
            PREVIOUS_STEP: {
              target: '#workflowMachine.grammar',
            },
            COMPLETE_STEP: {
              target: 'workflowCompleted',
              actions: assign({
                stepData: ({ context, event }) => ({
                  ...context.stepData,
                  readability: event.data || { content: context.aiResponse },
                }),
                overallProgress: () => 100,
              }),
            },
          },
        },
        
        error: {
          on: {
            RETRY: {
              target: 'processing',
              actions: assign({
                error: () => null,
                retryCount: ({ context }) => context.retryCount + 1,
              }),
            },
          },
        },
      },
    },

    workflowCompleted: {
      entry: assign({
        currentStep: () => 'completed' as WorkflowStep,
        stepProgress: () => 100,
        overallProgress: () => 100,
      }),
      
      invoke: {
        src: saveCheckpoint,
        input: ({ context }) => ({ context }),
        onDone: {
          actions: assign({
            lastSavedAt: () => new Date(),
          }),
        },
      },
      
      on: {
        START_WORKFLOW: {
          target: 'idle',
          actions: assign({
            documentId: ({ event }) => event.documentId,
            workflowId: () => `workflow_${Date.now()}`,
            config: ({ context, event }) => ({ ...context.config, ...event.config }),
            currentStep: () => 'planning' as WorkflowStep,
            stepProgress: () => 0,
            overallProgress: () => 0,
            stepData: () => ({}),
            stepResults: () => ({}),
            error: () => null,
            retryCount: () => 0,
          }),
        },
      },
    },

    paused: {
      on: {
        RESUME_WORKFLOW: {
          target: 'planning', // Resume from where we left off
        },
        CANCEL_WORKFLOW: {
          target: 'idle',
        },
      },
    },

    error: {
      on: {
        RETRY: {
          target: 'planning',
          actions: assign({
            error: () => null,
            retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
        CANCEL_WORKFLOW: {
          target: 'idle',
        },
      },
    },
  },

  // Global event handlers
  on: {
    PAUSE_WORKFLOW: {
      target: 'paused',
    },
    CANCEL_WORKFLOW: {
      target: 'idle',
    },
    ENABLE_MANUAL_MODE: {
      actions: assign({
        manualMode: () => true,
      }),
    },
    DISABLE_MANUAL_MODE: {
      actions: assign({
        manualMode: () => false,
      }),
    },
    GOTO_STEP: {
      target: ({ event }) => event.step,
      actions: assign({
        currentStep: ({ event }) => event.step,
        stepProgress: () => 0,
      }),
    },
    SAVE_CHECKPOINT: {
      actions: assign({
        lastSavedAt: () => new Date(),
      }),
    },
    RESTORE_CHECKPOINT: {
      actions: assign({
        checkpointData: ({ event }) => event.data,
      }),
    },
  },
});

// Helper function to calculate overall progress
function calculateOverallProgress(context: WorkflowContext, completedStep: WorkflowStep): number {
  const steps = ['planning', 'drafting', 'citation', 'grammar', 'readability'];
  const currentIndex = steps.indexOf(completedStep);
  const totalSteps = context.config.includeCitations ? 5 : 4;
  const completedSteps = currentIndex + 1;
  
  return Math.round((completedSteps / totalSteps) * 100);
}

// Type for the workflow actor
export type WorkflowActor = ActorRefFrom<typeof workflowMachine>;

// Additional exports for convenience
export type { WorkflowContext, WorkflowEvent, WorkflowState, WorkflowConfig };