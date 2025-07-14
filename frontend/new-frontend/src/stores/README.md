# ChUseA Stores - State Management Documentation

## Overview

ChUseA uses Zustand v5 for state management with TypeScript, persistence, and devtools integration. The store architecture is divided into 4 core stores:

- **Auth Store**: User authentication, permissions, and subscription management
- **Document Store**: Document CRUD operations, search, filtering, and batch operations
- **Workflow Store**: AI writing workflow state management (5-step process)
- **UI Store**: Theme, layout, modals, notifications, and responsive design

## Quick Start

```typescript
import { initializeStores, useAuth, useDocuments, useWorkflow, useTheme } from '@/stores';

// Initialize stores in your app root
const cleanup = initializeStores({
  enableDevtools: true,
  enablePersistence: true,
  persistenceStorage: 'localStorage'
});

// Use stores in components
function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const { documents, isLoading } = useDocuments();
  const { currentStep, overallProgress } = useWorkflow();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      {isAuthenticated && (
        <p>Welcome, {user?.name}!</p>
      )}
      <button onClick={toggleTheme}>
        Toggle Theme ({theme})
      </button>
    </div>
  );
}
```

## Store Architecture

### Auth Store

Manages user authentication, permissions, and subscription state.

#### Key Features
- JWT token management with auto-refresh
- Persistent login state
- Permission-based access control
- Subscription status tracking
- Secure logout with token cleanup

#### Usage Examples

```typescript
import { useAuth, useAuthActions, usePermissions } from '@/stores';

// Basic auth state
function LoginStatus() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const { login, logout } = useAuthActions();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return (
      <button onClick={() => login({ email: 'user@example.com', password: 'password' })}>
        Login
      </button>
    );
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Permission-based rendering
function AdminPanel() {
  const { hasPermission, isSubscriptionActive } = usePermissions();
  
  if (!hasPermission('admin')) {
    return <div>Access denied</div>;
  }
  
  if (!isSubscriptionActive()) {
    return <div>Please upgrade your subscription</div>;
  }
  
  return <div>Admin panel content</div>;
}

// Manual token refresh
function TokenManager() {
  const { refreshAuth, isTokenExpired } = useAuthStore();
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        refreshAuth().catch(() => {
          // Token refresh failed, user will be logged out automatically
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}
```

### Document Store

Handles all document-related operations including CRUD, search, filtering, and batch operations.

#### Key Features
- Real-time document synchronization
- Advanced search and filtering
- Batch operations for multiple documents
- Version history tracking
- Optimistic updates

#### Usage Examples

```typescript
import { 
  useDocuments, 
  useCurrentDocument, 
  useDocumentActions, 
  useDocumentFilters,
  useDocumentSelection 
} from '@/stores';

// Document list with search
function DocumentList() {
  const { documents, isLoading, error } = useDocuments();
  const { loadDocuments, createDocument } = useDocumentActions();
  const { searchQuery, setSearchQuery, setFilters } = useDocumentFilters();
  
  useEffect(() => {
    loadDocuments();
  }, []);
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search documents..."
      />
      
      <button onClick={() => setFilters({ status: ['draft'] })}>
        Show Drafts Only
      </button>
      
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <p>{doc.status}</p>
        </div>
      ))}
      
      <button onClick={() => createDocument({
        title: 'New Document',
        content: '',
        metadata: { wordCount: 0, readingTime: 0, language: 'en' },
        status: 'draft',
        tags: [],
        userId: 'user-id'
      })}>
        Create New Document
      </button>
    </div>
  );
}

// Document editor
function DocumentEditor({ documentId }: { documentId: string }) {
  const { currentDocument, setCurrentDocument, saveCurrentDocument } = useCurrentDocument();
  const { getDocumentById, updateDocument } = useDocumentActions();
  
  useEffect(() => {
    const document = getDocumentById(documentId);
    setCurrentDocument(document || null);
  }, [documentId]);
  
  const handleSave = async () => {
    if (currentDocument) {
      try {
        await saveCurrentDocument();
        // Show success message
      } catch (error) {
        // Handle error
      }
    }
  };
  
  if (!currentDocument) return <div>Document not found</div>;
  
  return (
    <div>
      <input 
        value={currentDocument.title}
        onChange={(e) => setCurrentDocument({
          ...currentDocument,
          title: e.target.value
        })}
      />
      <textarea 
        value={currentDocument.content}
        onChange={(e) => setCurrentDocument({
          ...currentDocument,
          content: e.target.value
        })}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

// Batch operations
function DocumentBatchActions() {
  const { 
    selectedDocuments, 
    isSelectMode, 
    toggleSelectMode,
    selectAllDocuments,
    clearSelection 
  } = useDocumentSelection();
  const { batchDelete, batchUpdateStatus } = useDocumentActions();
  
  return (
    <div>
      <button onClick={toggleSelectMode}>
        {isSelectMode ? 'Exit Select Mode' : 'Enter Select Mode'}
      </button>
      
      {isSelectMode && (
        <>
          <button onClick={selectAllDocuments}>Select All</button>
          <button onClick={clearSelection}>Clear Selection</button>
          
          {selectedDocuments.length > 0 && (
            <>
              <button onClick={() => batchDelete(selectedDocuments)}>
                Delete Selected ({selectedDocuments.length})
              </button>
              <button onClick={() => batchUpdateStatus(selectedDocuments, 'published')}>
                Publish Selected
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
```

### Workflow Store

Manages the 5-step AI writing workflow: Planning → Research → Outlining → Writing → Review.

#### Key Features
- Step-by-step workflow progression
- AI-powered content generation
- Configurable workflow options
- Progress tracking and history
- Error handling and retry logic

#### Usage Examples

```typescript
import { 
  useWorkflow, 
  useWorkflowActions, 
  useWorkflowSteps, 
  useWorkflowAI,
  useWorkflowConfig 
} from '@/stores';

// Workflow progress display
function WorkflowProgress() {
  const { 
    currentWorkflow, 
    isActive, 
    currentStep, 
    overallProgress 
  } = useWorkflow();
  
  if (!isActive || !currentWorkflow) {
    return <div>No active workflow</div>;
  }
  
  return (
    <div>
      <h3>Writing Progress</h3>
      <div>Current Step: {currentStep}</div>
      <div>Progress: {overallProgress}%</div>
      <progress value={overallProgress} max={100} />
    </div>
  );
}

// Workflow controls
function WorkflowControls({ documentId }: { documentId: string }) {
  const { isActive } = useWorkflow();
  const { startWorkflow, pauseWorkflow, resumeWorkflow, cancelWorkflow } = useWorkflowActions();
  const { config, updateConfig } = useWorkflowConfig();
  
  if (!isActive) {
    return (
      <div>
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={config.includeResearch}
              onChange={(e) => updateConfig({ includeResearch: e.target.checked })}
            />
            Include Research Step
          </label>
        </div>
        
        <button onClick={() => startWorkflow(documentId, { 
          writingStyle: 'academic',
          targetLength: 'long' 
        })}>
          Start AI Writing Workflow
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <button onClick={pauseWorkflow}>Pause</button>
      <button onClick={resumeWorkflow}>Resume</button>
      <button onClick={cancelWorkflow}>Cancel</button>
    </div>
  );
}

// Step navigation
function WorkflowStepNavigation() {
  const { 
    currentStep,
    canGoToNextStep,
    canGoToPreviousStep,
    nextStep,
    previousStep,
    completeCurrentStep,
    skipCurrentStep
  } = useWorkflowSteps();
  
  return (
    <div>
      <h4>Current Step: {currentStep}</h4>
      
      <div>
        <button 
          onClick={previousStep} 
          disabled={!canGoToPreviousStep}
        >
          Previous
        </button>
        
        <button onClick={skipCurrentStep}>
          Skip Step
        </button>
        
        <button onClick={() => completeCurrentStep()}>
          Complete Step
        </button>
        
        <button 
          onClick={nextStep} 
          disabled={!canGoToNextStep}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// AI generation
function AIContentGenerator() {
  const { 
    isAIProcessing, 
    aiError, 
    aiResponse, 
    generateWithAI,
    regenerateCurrentStep 
  } = useWorkflowAI();
  
  const handleGenerate = async () => {
    try {
      await generateWithAI({
        prompt: 'Generate an outline for my essay about climate change',
        style: 'academic',
        length: 'medium'
      });
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  };
  
  return (
    <div>
      <button onClick={handleGenerate} disabled={isAIProcessing}>
        {isAIProcessing ? 'Generating...' : 'Generate with AI'}
      </button>
      
      <button onClick={regenerateCurrentStep} disabled={isAIProcessing}>
        Regenerate Current Step
      </button>
      
      {aiError && <div className="error">{aiError}</div>}
      
      {aiResponse && (
        <div>
          <h4>AI Generated Content:</h4>
          <pre>{aiResponse.content}</pre>
        </div>
      )}
    </div>
  );
}
```

### UI Store

Manages all UI-related state including theme, layout, modals, notifications, and responsive design.

#### Key Features
- Dark/light/system theme support
- Responsive design utilities
- Toast notification system
- Modal management
- Layout state persistence

#### Usage Examples

```typescript
import { 
  useTheme, 
  useLayout, 
  useToasts, 
  useModals, 
  useScreenInfo,
  useUIPreferences 
} from '@/stores';

// Theme switcher
function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <button onClick={toggleTheme}>
        Current theme: {theme}
      </button>
      
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

// Layout controls
function LayoutControls() {
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    toggleSidebar, 
    setSidebarCollapsed 
  } = useLayout();
  
  return (
    <div>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? 'Hide' : 'Show'} Sidebar
      </button>
      
      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
        {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
      </button>
    </div>
  );
}

// Toast notifications
function NotificationExample() {
  const { toasts, addToast, removeToast } = useToasts();
  
  const showSuccess = () => {
    addToast({
      type: 'success',
      title: 'Success!',
      description: 'Operation completed successfully',
      duration: 3000
    });
  };
  
  const showError = () => {
    addToast({
      type: 'error',
      title: 'Error',
      description: 'Something went wrong',
      action: {
        label: 'Retry',
        onClick: () => console.log('Retrying...')
      }
    });
  };
  
  return (
    <div>
      <button onClick={showSuccess}>Show Success</button>
      <button onClick={showError}>Show Error</button>
      
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <h4>{toast.title}</h4>
            {toast.description && <p>{toast.description}</p>}
            <button onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modal management
function ModalExample() {
  const { openModal, closeModal, closeAllModals } = useModals();
  
  const openConfirmDialog = () => {
    const modalId = openModal({
      title: 'Confirm Action',
      content: (
        <div>
          <p>Are you sure you want to delete this item?</p>
          <button onClick={() => {
            console.log('Confirmed');
            closeModal(modalId);
          }}>
            Confirm
          </button>
          <button onClick={() => closeModal(modalId)}>
            Cancel
          </button>
        </div>
      ),
      size: 'sm'
    });
  };
  
  return (
    <div>
      <button onClick={openConfirmDialog}>Open Confirm Dialog</button>
      <button onClick={closeAllModals}>Close All Modals</button>
    </div>
  );
}

// Responsive design
function ResponsiveComponent() {
  const { screenSize, isMobile, isTablet, isDesktop } = useScreenInfo();
  
  return (
    <div>
      <p>Screen size: {screenSize}</p>
      
      {isMobile && <div>Mobile layout</div>}
      {isTablet && <div>Tablet layout</div>}
      {isDesktop && <div>Desktop layout</div>}
    </div>
  );
}

// User preferences
function PreferencesPanel() {
  const { preferences, updatePreferences } = useUIPreferences();
  
  return (
    <div>
      <label>
        <input 
          type="checkbox"
          checked={preferences.animations}
          onChange={(e) => updatePreferences({ animations: e.target.checked })}
        />
        Enable animations
      </label>
      
      <label>
        <input 
          type="checkbox"
          checked={preferences.compactMode}
          onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
        />
        Compact mode
      </label>
      
      <label>
        <input 
          type="checkbox"
          checked={preferences.autoSave}
          onChange={(e) => updatePreferences({ autoSave: e.target.checked })}
        />
        Auto-save
      </label>
    </div>
  );
}
```

## Advanced Usage

### Store Composition

You can combine multiple stores for complex operations:

```typescript
function useDocumentWorkflow() {
  const { currentDocument } = useCurrentDocument();
  const { startWorkflow, isActive } = useWorkflowActions();
  const { addToast } = useToasts();
  
  const startWritingWorkflow = async () => {
    if (!currentDocument) {
      addToast({
        type: 'error',
        title: 'No Document Selected',
        description: 'Please select a document first'
      });
      return;
    }
    
    try {
      await startWorkflow(currentDocument.id);
      addToast({
        type: 'success',
        title: 'Workflow Started',
        description: 'AI writing workflow has begun'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Start Workflow',
        description: 'Please try again'
      });
    }
  };
  
  return {
    startWritingWorkflow,
    canStartWorkflow: !!currentDocument && !isActive
  };
}
```

### Custom Hooks

Create custom hooks for specific use cases:

```typescript
function useAutoSave() {
  const { currentDocument, saveCurrentDocument } = useCurrentDocument();
  const { preferences } = useUIPreferences();
  const { addToast } = useToasts();
  
  useEffect(() => {
    if (!preferences.autoSave || !currentDocument) return;
    
    const timer = setTimeout(async () => {
      try {
        await saveCurrentDocument();
        addToast({
          type: 'info',
          title: 'Auto-saved',
          duration: 2000
        });
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Auto-save failed',
          description: 'Please save manually'
        });
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(timer);
  }, [currentDocument, preferences.autoSave]);
}
```

## Development Tools

### Debugging

```typescript
import { devUtils } from '@/stores';

// Log all store states
devUtils.logAllStates();

// Reset all stores (development only)
devUtils.resetAllStores();

// Export current state
devUtils.exportState();
```

### Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/stores';

test('should login user', async () => {
  const { result } = renderHook(() => useAuth());
  
  await act(async () => {
    await result.current.login({
      email: 'test@example.com',
      password: 'password'
    });
  });
  
  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user?.email).toBe('test@example.com');
});
```

## Performance Optimization

### Selective Subscriptions

Use specific selectors to avoid unnecessary re-renders:

```typescript
// ✅ Good - Only re-renders when user changes
const user = useAuthStore(state => state.user);

// ❌ Bad - Re-renders on any auth state change
const { user } = useAuthStore();
```

### Memoized Selectors

```typescript
import { useMemo } from 'react';

function DocumentStats() {
  const documents = useDocumentStore(state => state.documents);
  
  const stats = useMemo(() => ({
    total: documents.length,
    drafts: documents.filter(d => d.status === 'draft').length,
    published: documents.filter(d => d.status === 'published').length,
  }), [documents]);
  
  return <div>{/* render stats */}</div>;
}
```

## Migration Guide

If migrating from an older state management solution:

1. **From Redux**: Zustand provides similar patterns but with less boilerplate
2. **From Context API**: Much better performance and simpler syntax
3. **From older Zustand**: Update to v5 syntax and add TypeScript types

## Best Practices

1. **Use typed selectors** for better TypeScript support
2. **Keep stores focused** on their specific domain
3. **Use persistence wisely** - not all state needs to be persisted
4. **Handle errors gracefully** with proper error boundaries
5. **Test store logic** separately from components
6. **Use devtools** for debugging in development

## API Reference

See individual store files for complete API documentation:
- [Auth Store API](./auth-store.ts)
- [Document Store API](./document-store.ts) 
- [Workflow Store API](./workflow-store.ts)
- [UI Store API](./ui-store.ts)