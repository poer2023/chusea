/**
 * ChUseA Stores - Centralized State Management
 * 
 * This file exports all Zustand stores and related utilities for the ChUseA AI Writing Tool.
 * Built with Zustand v5, TypeScript, and includes persistence, devtools integration.
 * 
 * Store Architecture:
 * - Auth Store: User authentication, permissions, subscription management
 * - Document Store: Document CRUD, search, filtering, batch operations
 * - Workflow Store: AI writing workflow state (Plan→Research→Outline→Write→Review)
 * - UI Store: Theme, layout, modals, notifications, responsive design
 */

// Store exports
export * from './auth-store';
export * from './document-store';
export * from './workflow-store';
export * from './ui-store';

// Utility exports
export * from './utils/persistence';

// Re-export commonly used hooks with better names
export {
  useAuthStore,
  useAuth,
  useAuthActions,
  usePermissions,
} from './auth-store';

export {
  useDocumentStore,
  useDocuments,
  useCurrentDocument,
  useDocumentActions,
  useDocumentFilters,
  useDocumentSelection,
} from './document-store';

export {
  useWorkflowStore,
  useWorkflow,
  useWorkflowActions,
  useWorkflowSteps,
  useWorkflowAI,
  useWorkflowConfig,
} from './workflow-store';

export {
  useUIStore,
  useTheme,
  useLayout,
  useLoading,
  useToasts,
  useModals,
  useNavigation,
  useScreenInfo,
  useUIPreferences,
} from './ui-store';

// Store configuration and initialization
export interface StoreInitConfig {
  enableDevtools?: boolean;
  enablePersistence?: boolean;
  persistenceStorage?: 'localStorage' | 'sessionStorage';
}

/**
 * Initialize all stores with configuration
 * Call this in your app initialization to set up stores properly
 */
export const initializeStores = (config: StoreInitConfig = {}) => {
  const {
    enableDevtools = process.env.NODE_ENV === 'development',
    enablePersistence = true,
    persistenceStorage = 'localStorage',
  } = config;

  // Log store initialization
  if (enableDevtools) {
    console.log('🏪 Initializing ChUseA Stores:', {
      devtools: enableDevtools,
      persistence: enablePersistence,
      storage: persistenceStorage,
    });
  }

  // Initialize theme on app start
  if (typeof window !== 'undefined') {
    // Get UI store instance to initialize theme
    const { setTheme, theme, updateScreenInfo } = useUIStore.getState();
    
    // Apply initial theme
    setTheme(theme);
    
    // Update screen info
    updateScreenInfo();
    
    // Set up event listeners
    const handleResize = () => updateScreenInfo();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (theme === 'system') {
        setTheme('system');
      }
    };

    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup function (can be called on app unmount)
    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }

  return () => {}; // No-op cleanup for SSR
};

/**
 * Clear all persisted store data
 * Useful for logout or data reset scenarios
 */
export const clearAllPersistedStores = () => {
  if (typeof window !== 'undefined') {
    const storesToClear = [
      'auth-store',
      'document-store', 
      'workflow-store',
      'ui-store'
    ];

    storesToClear.forEach(storeName => {
      try {
        localStorage.removeItem(storeName);
        sessionStorage.removeItem(storeName);
      } catch (error) {
        console.warn(`Failed to clear store ${storeName}:`, error);
      }
    });

    console.log('🗑️ All persisted store data cleared');
  }
};

/**
 * Get current state snapshot from all stores
 * Useful for debugging or state export
 */
export const getAllStoresState = () => {
  return {
    auth: useAuthStore.getState(),
    documents: useDocumentStore.getState(),
    workflow: useWorkflowStore.getState(),
    ui: useUIStore.getState(),
  };
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Log current state of all stores
   */
  logAllStates: () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🏪 ChUseA Stores State');
      console.log('Auth:', useAuthStore.getState());
      console.log('Documents:', useDocumentStore.getState());
      console.log('Workflow:', useWorkflowStore.getState());
      console.log('UI:', useUIStore.getState());
      console.groupEnd();
    }
  },

  /**
   * Reset all stores to initial state
   */
  resetAllStores: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Resetting all stores to initial state');
      
      // Reset auth store
      useAuthStore.getState().logout();
      
      // Reset UI store
      useUIStore.setState({
        sidebarOpen: true,
        theme: 'system',
        toasts: [],
        modals: [],
        breadcrumbs: [],
        activeRoute: '/',
        globalLoading: false,
        loadingStates: {},
      });

      // Reset workflow store
      useWorkflowStore.getState().cancelWorkflow();
      
      // Reset document store
      useDocumentStore.setState({
        documents: [],
        currentDocument: null,
        searchQuery: '',
        filters: {},
        selectedDocuments: [],
        isSelectMode: false,
      });
    }
  },

  /**
   * Export stores state as JSON
   */
  exportState: () => {
    const state = getAllStoresState();
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chusea-stores-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// Export type definitions for better developer experience
export type {
  // Auth types
  AuthState,
  LoginCredentials,
  
  // Document types  
  DocumentState,
  DocumentFilters,
  DocumentSortKey,
  LoadDocumentsParams,
  
  // Workflow types
  WorkflowState,
  WorkflowConfig,
  
  // UI types
  UIStoreState,
  UIPreferences,
  ScreenSize,
} from './auth-store';

export type {
  DocumentState,
  DocumentFilters,
  DocumentSortKey,
  LoadDocumentsParams,
} from './document-store';

export type {
  WorkflowState,
  WorkflowConfig,
} from './workflow-store';

export type {
  UIStoreState,
  UIPreferences,
  ScreenSize,
} from './ui-store';