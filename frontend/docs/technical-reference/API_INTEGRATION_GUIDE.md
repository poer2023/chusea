# ChUseA API Integration Guide

## Overview

The ChUseA frontend implements a comprehensive API integration layer built on top of TanStack Query for efficient data fetching, caching, and state management. This guide covers the complete API architecture, usage patterns, and best practices.

## Architecture Overview

```
src/
├── types/                  # Type definitions
│   ├── api.ts             # API request/response types
│   ├── auth.ts            # Authentication types
│   ├── document.ts        # Document management types
│   ├── workflow.ts        # Workflow types
│   ├── ui.ts              # UI state types
│   └── index.ts           # Unified exports
├── lib/
│   ├── api/
│   │   ├── client.ts      # HTTP client with retry/upload/download
│   │   └── query-client.ts # TanStack Query configuration
│   └── constants.ts       # API endpoints and configuration
└── hooks/
    └── api/
        ├── use-auth.ts    # Authentication hooks
        ├── use-documents.ts # Document management hooks
        ├── use-workflow.ts  # Workflow hooks
        └── index.ts       # Unified exports
```

## Core Components

### 1. Enhanced API Client (`src/lib/api/client.ts`)

The API client provides a robust foundation for all HTTP communications:

**Features:**
- ✅ Automatic retry with exponential backoff
- ✅ Request deduplication and rate limiting
- ✅ File upload with progress tracking
- ✅ File download with progress tracking
- ✅ Streaming upload for large files
- ✅ Request/response interceptors
- ✅ Comprehensive error handling
- ✅ TypeScript type safety

**Basic Usage:**
```typescript
import { apiClient } from '@/lib/api/client';

// Simple GET request
const user = await apiClient.get<User>('/user/profile');

// POST with data
const document = await apiClient.post<Document>('/documents', {
  title: 'My Document',
  content: 'Hello World'
});

// File upload with progress
const result = await apiClient.upload('/files/upload', file, {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
});

// File download
const blob = await apiClient.download('/documents/123/export/pdf');
```

### 2. TanStack Query Configuration (`src/lib/api/query-client.ts`)

Pre-configured query client with intelligent caching and error handling:

**Features:**
- ✅ Smart retry logic based on error types
- ✅ Optimistic updates with rollback
- ✅ Global error handling
- ✅ Cache invalidation strategies
- ✅ Performance monitoring
- ✅ Development debugging tools

**Configuration:**
```typescript
import { createQueryClient, queryUtils } from '@/lib/api/query-client';

const queryClient = createQueryClient();

// Cache management utilities
queryUtils.invalidateDocuments(queryClient);
queryUtils.updateDocumentCache(queryClient, documentId, updater);
queryUtils.prefetchUserData(queryClient);
```

### 3. Type-Safe API Hooks

#### Authentication Hooks (`src/hooks/api/use-auth.ts`)

```typescript
import {
  useLogin,
  useLogout,
  useUserProfile,
  useUpdateProfile,
  useIsAuthenticated,
  usePermissions
} from '@/hooks/api/use-auth';

// Login/logout
const login = useLogin();
const logout = useLogout();

await login.mutateAsync({ email, password });
await logout.mutateAsync();

// User data
const { data: user, isLoading } = useUserProfile();
const { isAuthenticated } = useIsAuthenticated();

// Permissions
const { hasPermission, hasRole, hasFeature } = usePermissions();
if (hasPermission('documents:write')) {
  // User can edit documents
}

// Profile updates with optimistic UI
const updateProfile = useUpdateProfile();
await updateProfile.mutateAsync({ name: 'New Name' });
```

#### Document Management Hooks (`src/hooks/api/use-documents.ts`)

```typescript
import {
  useDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useAutoSaveDocument
} from '@/hooks/api/use-documents';

// List documents with filters
const { data: documents, isLoading } = useDocuments({
  status: 'published',
  tags: ['important'],
  search: 'react'
});

// Single document
const { data: document } = useDocument(documentId);

// CRUD operations
const createDocument = useCreateDocument();
const updateDocument = useUpdateDocument();
const deleteDocument = useDeleteDocument();

// Create new document
const newDoc = await createDocument.mutateAsync({
  title: 'My Document',
  content: 'Initial content'
});

// Auto-save functionality
const { isSaving } = useAutoSaveDocument(
  documentId, 
  content, 
  true // enabled
);

// File operations
const uploadFiles = useUploadDocumentFiles();
const exportDoc = useExportDocument();

await uploadFiles.mutateAsync({ 
  documentId, 
  files: selectedFiles,
  onProgress: (progress) => setUploadProgress(progress)
});

const blob = await exportDoc.mutateAsync({ 
  id: documentId, 
  format: 'pdf' 
});
```

#### Workflow Management Hooks (`src/hooks/api/use-workflow.ts`)

```typescript
import {
  useWorkflows,
  useWorkflow,
  useCreateWorkflow,
  useStartWorkflow,
  useCompleteWorkflowStep,
  useWorkflowProgress
} from '@/hooks/api/use-workflow';

// List workflows
const { data: workflows } = useWorkflows({ documentId });

// Single workflow with real-time updates
const { data: workflow } = useWorkflow(workflowId);

// Workflow control
const startWorkflow = useStartWorkflow();
const completeStep = useCompleteWorkflowStep();

await startWorkflow.mutateAsync(workflowId);
await completeStep.mutateAsync({
  workflowId,
  stepId: 'writing',
  stepData: { wordCount: 1500 }
});

// Progress tracking
const progress = useWorkflowProgress(workflowId);
console.log(`Progress: ${progress?.percentage}%`);
```

## Type System

### API Types (`src/types/api.ts`)

All API interactions are fully typed:

```typescript
// Request/Response types
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Generic API response wrapper
interface APIResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  meta?: PaginationMeta;
}

// Error handling
interface APIError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

### Entity Types

#### Authentication (`src/types/auth.ts`)
- `AuthUser` - Complete user profile with permissions
- `AuthSession` - Session management
- `AuthUserPreferences` - User settings and preferences
- `Permission` - Granular permission system
- `SubscriptionFeatures` - Feature flags per plan

#### Documents (`src/types/document.ts`)
- `Document` - Core document entity with metadata
- `DocumentCollaboration` - Real-time collaboration features
- `DocumentVersion` - Version control and history
- `DocumentAnalytics` - Usage and performance metrics
- `DocumentWorkflow` - Integration with workflow system

#### Workflows (`src/types/workflow.ts`)
- `WritingWorkflow` - Complete workflow definition
- `WorkflowStep` - Individual step configuration
- `WorkflowTemplate` - Reusable workflow patterns
- `WorkflowAutomation` - Automated triggers and actions

## Advanced Usage Patterns

### 1. Optimistic Updates

```typescript
const updateDocument = useUpdateDocument();

// Automatic optimistic update with rollback on error
await updateDocument.mutateAsync({
  id: documentId,
  data: { title: 'New Title' }
});
// UI updates immediately, rolls back if server request fails
```

### 2. Real-time Collaboration

```typescript
// Document updates are automatically synchronized
const { data: document } = useDocument(documentId);
const { data: collaborators } = useDocumentCollaborators(documentId);
const { data: comments } = useDocumentComments(documentId);

// Comments refresh automatically for real-time updates
```

### 3. Infinite Scrolling

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteDocuments({ status: 'published' });

// Load more documents
if (hasNextPage) {
  await fetchNextPage();
}
```

### 4. Search with Debouncing

```typescript
const [query, setQuery] = useState('');
const { data: results } = useSearchDocuments(query);

// Automatic debouncing prevents excessive API calls
```

### 5. File Upload with Progress

```typescript
const uploadFiles = useUploadDocumentFiles();
const [uploadProgress, setUploadProgress] = useState(0);

await uploadFiles.mutateAsync({
  documentId,
  files: selectedFiles,
  onProgress: (progress) => {
    setUploadProgress(progress.percentage);
    // Update UI with progress bar
  }
});
```

### 6. Batch Operations

```typescript
const { batchUpdate } = queryUtils;

// Perform multiple cache operations atomically
batchUpdate(queryClient, [
  { type: 'set', queryKey: ['document', id], data: newDocument },
  { type: 'invalidate', queryKey: ['documents'] },
  { type: 'remove', queryKey: ['document', oldId] }
]);
```

## Error Handling

### Global Error Handling

The system provides comprehensive error handling:

```typescript
// Errors are automatically categorized and handled
try {
  await createDocument.mutateAsync(data);
} catch (error) {
  // Errors are pre-processed and user-friendly
  const apiError = error as APIError;
  
  switch (apiError.code) {
    case 'VALIDATION_ERROR':
      // Show field-specific errors
      break;
    case 'UNAUTHORIZED':
      // Automatic redirect to login
      break;
    case 'RATE_LIMITED':
      // Show retry timer
      break;
  }
}
```

### Retry Logic

```typescript
// Automatic retries with exponential backoff
const queryClient = createQueryClient();

// Configurable retry behavior
defaultOptions: {
  queries: {
    retry: (failureCount, error) => {
      // Smart retry logic based on error type
      if (error?.code === 'UNAUTHORIZED') return false;
      return failureCount < 3;
    }
  }
}
```

## Performance Optimization

### 1. Intelligent Caching

```typescript
// Different cache durations for different data types
const cacheConfig = {
  USER_PROFILE: 15 * 60 * 1000,    // 15 minutes
  DOCUMENTS: 5 * 60 * 1000,        // 5 minutes
  SEARCH_RESULTS: 2 * 60 * 1000    // 2 minutes
};
```

### 2. Prefetching

```typescript
// Smart prefetching of related data
await queryUtils.prefetchDocumentData(queryClient, documentId);
// Preloads versions, collaborators, comments
```

### 3. Request Deduplication

```typescript
// Multiple identical requests are automatically deduplicated
const doc1 = useDocument(id); // Makes API call
const doc2 = useDocument(id); // Uses existing request
const doc3 = useDocument(id); // Uses existing request
```

## Development Tools

### 1. Cache Debugging

```typescript
// Log cache contents for debugging
queryUtils.logCacheContents(queryClient, 'documents');

// Get cache statistics
const stats = queryUtils.getCacheStats(queryClient);
console.log(`Total queries: ${stats.totalQueries}`);
```

### 2. DevTools Integration

```typescript
// React Query DevTools (development only)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
}
```

## Best Practices

### 1. Hook Usage

```typescript
// ✅ Good: Use hooks at component level
function DocumentEditor({ documentId }) {
  const { data: document } = useDocument(documentId);
  const updateDocument = useUpdateDocument();
  
  const handleSave = async (content) => {
    await updateDocument.mutateAsync({ id: documentId, data: { content } });
  };
  
  return <Editor document={document} onSave={handleSave} />;
}

// ❌ Bad: Don't use hooks conditionally
function BadComponent({ documentId }) {
  if (documentId) {
    const { data } = useDocument(documentId); // Conditional hook usage
  }
}
```

### 2. Error Boundaries

```typescript
// Wrap components with error boundaries for graceful error handling
<ErrorBoundary fallback={<ErrorFallback />}>
  <DocumentEditor documentId={id} />
</ErrorBoundary>
```

### 3. Loading States

```typescript
// Handle loading states appropriately
function DocumentList() {
  const { data: documents, isLoading, error } = useDocuments();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {documents?.documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
```

### 4. Form Integration

```typescript
// Integrate with form libraries
function EditDocumentForm({ document }) {
  const updateDocument = useUpdateDocument();
  
  const onSubmit = async (formData) => {
    try {
      await updateDocument.mutateAsync({
        id: document.id,
        data: formData
      });
      // Success handled automatically
    } catch (error) {
      // Error handled by global error handler
      setFormErrors(error.details?.fieldErrors || {});
    }
  };
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

## Testing

### 1. Mock API Client

```typescript
// Create mock client for testing
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  upload: jest.fn(),
  download: jest.fn()
};
```

### 2. Test Utilities

```typescript
// Test wrapper with QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

## Migration Guide

### From v1 to v2

```typescript
// Old API (v1)
import { useAPI } from '@/hooks/use-api';
const { data, loading } = useAPI('/documents');

// New API (v2)
import { useDocuments } from '@/hooks/api/use-documents';
const { data, isLoading } = useDocuments();
```

## Troubleshooting

### Common Issues

1. **Stale Data**: Use `queryClient.invalidateQueries()` to refresh
2. **Memory Leaks**: Ensure proper cleanup in `useEffect`
3. **Race Conditions**: Use query cancellation with `signal`
4. **Cache Synchronization**: Use optimistic updates carefully

### Debug Commands

```typescript
// Clear all caches
queryUtils.clearAllCaches(queryClient);

// Inspect specific query
const queryState = queryClient.getQueryState(['documents', filters]);

// Monitor performance
const stats = queryUtils.getCacheStats(queryClient);
```

## Conclusion

The ChUseA API integration layer provides a robust, type-safe, and performant foundation for all data operations. By following this guide and the established patterns, developers can efficiently build features while maintaining code quality and user experience.

For additional support or questions, refer to the TanStack Query documentation or reach out to the development team.