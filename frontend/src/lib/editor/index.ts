/**
 * Editor Library Exports
 * 
 * Centralized exports for editor-related functionality
 */

// Text selection system
export {
  TextSelectionManager,
  type TextSelectionInfo,
  type SelectionHistory,
  type SelectionContextAnalysis,
} from './text-selection';

// Interactive features
export {
  useInteractiveFeatures,
  type InteractionConfig,
  type InteractionState,
  type HoverInfo,
  type GestureInfo,
} from './interactive-features';

// Re-export common types
export type {
  TextSelectionInfo as SelectionInfo,
  SelectionContextAnalysis as ContextAnalysis,
} from './text-selection';