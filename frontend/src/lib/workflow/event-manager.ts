/**
 * Workflow Event Handling and Recovery System
 * Manages workflow events, error recovery, and state persistence
 */

import { WorkflowEvent, WorkflowContext } from '@/lib/workflow/workflow-machine';
import { QualityMetrics } from '@/lib/workflow/quality-checker';
import type { WorkflowStep } from '@/types/layout';

// Event types and interfaces
export interface WorkflowEventHandler {
  type: string;
  handler: (event: WorkflowEvent, context: WorkflowContext) => Promise<void> | void;
  priority: number;
}

export interface WorkflowRecoveryPoint {
  id: string;
  timestamp: Date;
  workflowId: string;
  step: WorkflowStep;
  context: WorkflowContext;
  error?: string;
  recoveryOptions: RecoveryOption[];
}

export interface RecoveryOption {
  id: string;
  type: 'retry' | 'skip' | 'restart' | 'manual';
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action: () => Promise<void>;
}

export interface WorkflowError {
  id: string;
  step: WorkflowStep;
  type: 'ai_error' | 'quality_error' | 'network_error' | 'validation_error' | 'timeout_error';
  message: string;
  details?: any;
  timestamp: Date;
  retryCount: number;
  recoverable: boolean;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  callback: (event: WorkflowEvent) => void;
  once: boolean;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Recovery strategies
export enum RecoveryStrategy {
  RETRY = 'retry',
  SKIP = 'skip',
  RESTART_STEP = 'restart_step',
  RESTART_WORKFLOW = 'restart_workflow',
  MANUAL_INTERVENTION = 'manual_intervention'
}

export class WorkflowEventManager {
  private eventHandlers: Map<string, WorkflowEventHandler[]> = new Map();
  private subscriptions: Map<string, EventSubscription> = new Map();
  private recoveryPoints: WorkflowRecoveryPoint[] = [];
  private errorHistory: WorkflowError[] = [];
  private eventLog: WorkflowEvent[] = [];
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.setupDefaultHandlers();
  }

  /**
   * Setup default event handlers
   */
  private setupDefaultHandlers(): void {
    // Error handling
    this.registerHandler('ERROR', {
      type: 'ERROR',
      handler: this.handleError.bind(this),
      priority: 1,
    });

    // State changes
    this.registerHandler('STATE_CHANGE', {
      type: 'STATE_CHANGE',
      handler: this.handleStateChange.bind(this),
      priority: 2,
    });

    // Quality checks
    this.registerHandler('QUALITY_CHECK_COMPLETE', {
      type: 'QUALITY_CHECK_COMPLETE',
      handler: this.handleQualityCheck.bind(this),
      priority: 2,
    });

    // AI generation
    this.registerHandler('AI_GENERATION', {
      type: 'AI_GENERATION',
      handler: this.handleAIGeneration.bind(this),
      priority: 3,
    });

    // Step completion
    this.registerHandler('STEP_COMPLETED', {
      type: 'STEP_COMPLETED',
      handler: this.handleStepCompletion.bind(this),
      priority: 2,
    });

    // Workflow lifecycle
    this.registerHandler('WORKFLOW_STARTED', {
      type: 'WORKFLOW_STARTED',
      handler: this.handleWorkflowStart.bind(this),
      priority: 1,
    });

    this.registerHandler('WORKFLOW_COMPLETED', {
      type: 'WORKFLOW_COMPLETED',
      handler: this.handleWorkflowComplete.bind(this),
      priority: 1,
    });
  }

  /**
   * Register an event handler
   */
  registerHandler(eventType: string, handler: WorkflowEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push(handler);
    
    // Sort by priority
    handlers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Unregister an event handler
   */
  unregisterHandler(eventType: string, handler: WorkflowEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    // Add to event log
    this.eventLog.push(event);
    
    // Keep only last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }

    // Get handlers for this event type
    const handlers = this.eventHandlers.get(event.type) || [];

    // Execute handlers in priority order
    for (const handler of handlers) {
      try {
        await handler.handler(event, context);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
        
        // Create error event
        const errorEvent: WorkflowEvent = {
          type: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        
        // Emit error event (but avoid infinite recursion)
        if (event.type !== 'ERROR') {
          await this.emit(errorEvent, context);
        }
      }
    }

    // Notify subscribers
    await this.notifySubscribers(event);
  }

  /**
   * Subscribe to events
   */
  subscribe(eventType: string, callback: (event: WorkflowEvent) => void, once: boolean = false): string {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      callback,
      once,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Notify subscribers
   */
  private async notifySubscribers(event: WorkflowEvent): Promise<void> {
    const subscriptionsToRemove: string[] = [];

    for (const [id, subscription] of this.subscriptions) {
      if (subscription.eventType === event.type || subscription.eventType === '*') {
        try {
          subscription.callback(event);
          
          if (subscription.once) {
            subscriptionsToRemove.push(id);
          }
        } catch (error) {
          console.error('Error in event subscription callback:', error);
        }
      }
    }

    // Remove one-time subscriptions
    subscriptionsToRemove.forEach(id => this.subscriptions.delete(id));
  }

  /**
   * Handle error events
   */
  private async handleError(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    const error: WorkflowError = {
      id: `error_${Date.now()}`,
      step: context.currentStep,
      type: this.categorizeError(event.error || 'Unknown error'),
      message: event.error || 'Unknown error',
      timestamp: new Date(),
      retryCount: context.retryCount,
      recoverable: this.isRecoverable(event.error || 'Unknown error'),
    };

    this.errorHistory.push(error);

    // Create recovery point
    const recoveryPoint: WorkflowRecoveryPoint = {
      id: `recovery_${Date.now()}`,
      timestamp: new Date(),
      workflowId: context.workflowId,
      step: context.currentStep,
      context: { ...context },
      error: error.message,
      recoveryOptions: this.generateRecoveryOptions(error, context),
    };

    this.recoveryPoints.push(recoveryPoint);

    // Auto-recovery logic
    if (error.recoverable && error.retryCount < this.maxRetries) {
      await this.attemptAutoRecovery(error, context);
    }
  }

  /**
   * Handle state change events
   */
  private async handleStateChange(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    // Create recovery point for significant state changes
    if (this.isSignificantStateChange(event, context)) {
      const recoveryPoint: WorkflowRecoveryPoint = {
        id: `state_${Date.now()}`,
        timestamp: new Date(),
        workflowId: context.workflowId,
        step: context.currentStep,
        context: { ...context },
        recoveryOptions: [],
      };

      this.recoveryPoints.push(recoveryPoint);
    }

    // Clean up old recovery points
    this.cleanupRecoveryPoints();
  }

  /**
   * Handle quality check events
   */
  private async handleQualityCheck(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    const metrics = (event as any).metrics as QualityMetrics;
    
    if (metrics.overallScore < 0.5) {
      // Create recovery point for poor quality
      const recoveryPoint: WorkflowRecoveryPoint = {
        id: `quality_${Date.now()}`,
        timestamp: new Date(),
        workflowId: context.workflowId,
        step: context.currentStep,
        context: { ...context },
        error: 'Quality check failed',
        recoveryOptions: this.generateQualityRecoveryOptions(metrics, context),
      };

      this.recoveryPoints.push(recoveryPoint);
    }
  }

  /**
   * Handle AI generation events
   */
  private async handleAIGeneration(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    // Log AI generation for debugging
    console.log(`AI generation for step ${context.currentStep}:`, event);
  }

  /**
   * Handle step completion events
   */
  private async handleStepCompletion(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    // Create completion checkpoint
    const recoveryPoint: WorkflowRecoveryPoint = {
      id: `completed_${context.currentStep}_${Date.now()}`,
      timestamp: new Date(),
      workflowId: context.workflowId,
      step: context.currentStep,
      context: { ...context },
      recoveryOptions: [],
    };

    this.recoveryPoints.push(recoveryPoint);
  }

  /**
   * Handle workflow start events
   */
  private async handleWorkflowStart(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    // Clear previous error history for this workflow
    this.errorHistory = this.errorHistory.filter(e => e.id !== context.workflowId);
    
    // Create initial recovery point
    const recoveryPoint: WorkflowRecoveryPoint = {
      id: `start_${Date.now()}`,
      timestamp: new Date(),
      workflowId: context.workflowId,
      step: context.currentStep,
      context: { ...context },
      recoveryOptions: [],
    };

    this.recoveryPoints.push(recoveryPoint);
  }

  /**
   * Handle workflow completion events
   */
  private async handleWorkflowComplete(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
    // Clean up recovery points for completed workflow
    this.recoveryPoints = this.recoveryPoints.filter(rp => rp.workflowId !== context.workflowId);
  }

  /**
   * Categorize error type
   */
  private categorizeError(errorMessage: string): WorkflowError['type'] {
    if (errorMessage.includes('AI generation')) return 'ai_error';
    if (errorMessage.includes('quality')) return 'quality_error';
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) return 'network_error';
    if (errorMessage.includes('validation')) return 'validation_error';
    if (errorMessage.includes('timeout')) return 'timeout_error';
    return 'ai_error'; // Default
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(errorMessage: string): boolean {
    const unrecoverableErrors = [
      'authentication failed',
      'permission denied',
      'invalid configuration',
      'quota exceeded',
    ];

    return !unrecoverableErrors.some(error => 
      errorMessage.toLowerCase().includes(error)
    );
  }

  /**
   * Generate recovery options
   */
  private generateRecoveryOptions(error: WorkflowError, context: WorkflowContext): RecoveryOption[] {
    const options: RecoveryOption[] = [];

    // Retry option
    if (error.recoverable && error.retryCount < this.maxRetries) {
      options.push({
        id: 'retry',
        type: 'retry',
        label: 'Retry Current Step',
        description: `Retry the ${context.currentStep} step`,
        severity: 'low',
        action: async () => {
          await this.retryStep(context);
        },
      });
    }

    // Skip option
    if (this.isSkippable(context.currentStep)) {
      options.push({
        id: 'skip',
        type: 'skip',
        label: 'Skip Current Step',
        description: `Skip the ${context.currentStep} step and continue`,
        severity: 'medium',
        action: async () => {
          await this.skipStep(context);
        },
      });
    }

    // Restart step option
    options.push({
      id: 'restart_step',
      type: 'restart',
      label: 'Restart Current Step',
      description: `Restart the ${context.currentStep} step from the beginning`,
      severity: 'medium',
      action: async () => {
        await this.restartStep(context);
      },
    });

    // Manual intervention option
    options.push({
      id: 'manual',
      type: 'manual',
      label: 'Manual Intervention',
      description: 'Manually resolve the issue',
      severity: 'high',
      action: async () => {
        await this.requestManualIntervention(context);
      },
    });

    return options;
  }

  /**
   * Generate quality-specific recovery options
   */
  private generateQualityRecoveryOptions(metrics: QualityMetrics, context: WorkflowContext): RecoveryOption[] {
    const options: RecoveryOption[] = [];

    // Regenerate with improvements
    options.push({
      id: 'regenerate',
      type: 'retry',
      label: 'Regenerate with Improvements',
      description: 'Regenerate content with quality suggestions',
      severity: 'low',
      action: async () => {
        await this.regenerateWithImprovements(context);
      },
    });

    // Override quality check
    options.push({
      id: 'override',
      type: 'manual',
      label: 'Override Quality Check',
      description: 'Continue despite quality issues',
      severity: 'high',
      action: async () => {
        await this.overrideQualityCheck(context);
      },
    });

    return options;
  }

  /**
   * Attempt auto-recovery
   */
  private async attemptAutoRecovery(error: WorkflowError, context: WorkflowContext): Promise<void> {
    console.log(`Attempting auto-recovery for error: ${error.message}`);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));

    // Exponential backoff
    this.retryDelay = Math.min(this.retryDelay * 2, 10000);

    // Retry the step
    await this.retryStep(context);
  }

  /**
   * Recovery action implementations
   */
  private async retryStep(context: WorkflowContext): Promise<void> {
    // Implementation would trigger step retry
    console.log(`Retrying step: ${context.currentStep}`);
  }

  private async skipStep(context: WorkflowContext): Promise<void> {
    // Implementation would skip the current step
    console.log(`Skipping step: ${context.currentStep}`);
  }

  private async restartStep(context: WorkflowContext): Promise<void> {
    // Implementation would restart the current step
    console.log(`Restarting step: ${context.currentStep}`);
  }

  private async requestManualIntervention(context: WorkflowContext): Promise<void> {
    // Implementation would request manual intervention
    console.log(`Requesting manual intervention for step: ${context.currentStep}`);
  }

  private async regenerateWithImprovements(context: WorkflowContext): Promise<void> {
    console.log(`Regenerating content for step ${context.currentStep} with improvements...`);
    // Logic to call AI service with suggestions for improvement
    await this.emit({ type: 'REGENERATE_WITH_IMPROVEMENTS' }, context);
  }

  private async overrideQualityCheck(context: WorkflowContext): Promise<void> {
    // Implementation would override quality check
    console.log(`Overriding quality check for step: ${context.currentStep}`);
  }

  /**
   * Utility methods
   */
  private isSignificantStateChange(event: WorkflowEvent, context: WorkflowContext): boolean {
    return context.currentStep !== 'idle' && context.currentStep !== 'completed';
  }

  private isSkippable(step: WorkflowStep): boolean {
    return step === 'citation'; // Only citation step is skippable
  }

  private cleanupRecoveryPoints(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    
    this.recoveryPoints = this.recoveryPoints.filter(rp => rp.timestamp > cutoff);
  }

  /**
   * Public API methods
   */
  getRecoveryPoints(): WorkflowRecoveryPoint[] {
    return [...this.recoveryPoints];
  }

  getErrorHistory(): WorkflowError[] {
    return [...this.errorHistory];
  }

  getEventLog(): WorkflowEvent[] {
    return [...this.eventLog];
  }

  async executeRecoveryOption(recoveryPointId: string, optionId: string): Promise<void> {
    const recoveryPoint = this.recoveryPoints.find(rp => rp.id === recoveryPointId);
    if (!recoveryPoint) {
      throw new Error('Recovery point not found');
    }

    const option = recoveryPoint.recoveryOptions.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error('Recovery option not found');
    }

    await option.action();
  }

  clearHistory(): void {
    this.errorHistory = [];
    this.eventLog = [];
    this.recoveryPoints = [];
  }
}

// Export singleton instance
export const workflowEventManager = new WorkflowEventManager();

// Export utility functions
export function subscribeToWorkflowEvents(
  eventType: string,
  callback: (event: WorkflowEvent) => void,
  once: boolean = false
): string {
  return workflowEventManager.subscribe(eventType, callback, once);
}

export function unsubscribeFromWorkflowEvents(subscriptionId: string): void {
  workflowEventManager.unsubscribe(subscriptionId);
}

export function emitWorkflowEvent(event: WorkflowEvent, context: WorkflowContext): Promise<void> {
  return workflowEventManager.emit(event, context);
}

export function getWorkflowRecoveryPoints(): WorkflowRecoveryPoint[] {
  return workflowEventManager.getRecoveryPoints();
}

export function getWorkflowErrorHistory(): WorkflowError[] {
  return workflowEventManager.getErrorHistory();
}

// Export types
export type {
  WorkflowEventHandler,
  WorkflowRecoveryPoint,
  RecoveryOption,
  WorkflowError,
  EventSubscription,
};