/**
 * AI Library Exports
 * 
 * Centralized exports for AI-related functionality
 */

// AI Action system
export {
  AIActionManager,
  type AIAction,
  type AIActionParams,
  type AIActionResult,
  type AIActionBatch,
  type AIActionHistory,
} from './text-actions';

// AI Service integration
export {
  AIServiceIntegration,
  aiService,
  defaultAIConfig,
  type AIServiceConfig,
  type AIRequest,
  type AIResponse,
} from './service-integration';

// Re-export common types
export type {
  AIAction as Action,
  AIActionResult as ActionResult,
} from './text-actions';