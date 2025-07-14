// Store exports and configuration - using simplified stores for now
export {
  useSimpleUserStore as useUserStore,
  useSimpleDocumentStore as useDocumentStore,
  useSimpleWorkflowStore as useWorkflowStore,
  useSimpleUIStore as useUIStore,
  useSimpleToast as useToast,
} from './simple-stores';

// Re-export types
export type * from '../../types';

// Store utilities
export { createPersistentStore, safeLocalStorage } from './utils/persistent-store';
export { createAsyncActions, createOptimisticUpdate } from './utils/async-actions';

// Store hydration utility for SSR compatibility
export const hydrateStores = () => {
  if (typeof window === 'undefined') return;
  
  // Initialize stores to trigger hydration
  // These will be called when components mount
};

// Store reset utility (useful for logout)
export const resetAllStores = () => {
  // Reset simplified stores
  // Implementation depends on the simplified store structure
};