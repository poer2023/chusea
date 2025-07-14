import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { API_CONFIG, ERROR_CODES, HTTP_STATUS, APP_CONFIG } from '../constants';
import type { APIError } from '../../types';

// Enhanced default query options
const defaultQueryOptions = {
  staleTime: API_CONFIG.CACHE_DURATION.MEDIUM, // 15 minutes
  gcTime: API_CONFIG.CACHE_DURATION.LONG, // 1 hour
  retry: (failureCount: number, error: any) => {
    // Don't retry on authentication errors
    if (error?.code === ERROR_CODES.UNAUTHORIZED || error?.code === ERROR_CODES.FORBIDDEN) {
      return false;
    }
    
    // Don't retry on client errors (4xx)
    if (error?.status >= HTTP_STATUS.BAD_REQUEST && error?.status < HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      return false;
    }
    
    // Don't retry on specific error codes
    const nonRetryableErrors = [
      ERROR_CODES.NOT_FOUND,
      ERROR_CODES.VALIDATION_ERROR,
      ERROR_CODES.INVALID_CREDENTIALS,
      ERROR_CODES.RATE_LIMITED
    ];
    
    if (nonRetryableErrors.includes(error?.code)) {
      return false;
    }
    
    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => {
    // Exponential backoff with jitter
    const baseDelay = 1000;
    const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, 30000);
  },
};

// Enhanced error handling for queries
const handleQueryError = (error: unknown, query: any) => {
  const apiError = error as APIError;
  
  if (API_CONFIG.enableLogging) {
    console.error('Query error:', {
      queryKey: query.queryKey,
      error: apiError,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle specific error types
  if (apiError?.code) {
    switch (apiError.code) {
      case ERROR_CODES.UNAUTHORIZED:
        handleAuthenticationError(apiError);
        break;
        
      case ERROR_CODES.FORBIDDEN:
        handleAuthorizationError(apiError);
        break;
        
      case ERROR_CODES.NETWORK_ERROR:
        handleNetworkError(apiError);
        break;
        
      case ERROR_CODES.RATE_LIMITED:
        handleRateLimitError(apiError);
        break;
        
      case ERROR_CODES.SERVICE_UNAVAILABLE:
        handleServiceUnavailableError(apiError);
        break;
        
      default:
        handleGenericError(apiError);
    }
  }
  
  // Global error reporting (if enabled)
  if (shouldReportError(apiError)) {
    reportError(apiError, { queryKey: query.queryKey, type: 'query' });
  }
};

// Enhanced error handling for mutations
const handleMutationError = (error: unknown, variables: any, context: any, mutation: any) => {
  const apiError = error as APIError;
  
  if (API_CONFIG.enableLogging) {
    console.error('Mutation error:', {
      mutationKey: mutation.options.mutationKey,
      variables,
      error: apiError,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle specific error types with different UX for mutations
  if (apiError?.code) {
    switch (apiError.code) {
      case ERROR_CODES.VALIDATION_ERROR:
        handleValidationError(apiError, variables);
        break;
        
      case ERROR_CODES.CONFLICT:
        handleConflictError(apiError, variables);
        break;
        
      case ERROR_CODES.UNAUTHORIZED:
        handleAuthenticationError(apiError);
        break;
        
      case ERROR_CODES.FORBIDDEN:
        handleAuthorizationError(apiError);
        break;
        
      default:
        handleMutationGenericError(apiError, variables);
    }
  }
  
  // Global error reporting for mutations
  if (shouldReportError(apiError)) {
    reportError(apiError, { 
      mutationKey: mutation.options.mutationKey, 
      variables, 
      type: 'mutation' 
    });
  }
};

// Specific error handlers
function handleAuthenticationError(error: APIError) {
  // Clear auth tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }
  
  // Show notification
  showErrorNotification('Session expired', 'Please log in again to continue.');
}

function handleAuthorizationError(error: APIError) {
  showErrorNotification('Access denied', 'You do not have permission to perform this action.');
}

function handleNetworkError(error: APIError) {
  showErrorNotification(
    'Connection problem', 
    'Please check your internet connection and try again.'
  );
}

function handleRateLimitError(error: APIError) {
  const retryAfter = error.details?.retryAfter || 60;
  showErrorNotification(
    'Too many requests', 
    `Please wait ${retryAfter} seconds before trying again.`
  );
}

function handleServiceUnavailableError(error: APIError) {
  showErrorNotification(
    'Service temporarily unavailable', 
    'Our servers are experiencing high load. Please try again in a few minutes.'
  );
}

function handleValidationError(error: APIError, variables: any) {
  // For validation errors, we might want to highlight specific fields
  const details = error.details || {};
  const fieldErrors = details.fieldErrors || {};
  
  showErrorNotification(
    'Validation failed', 
    error.message || 'Please check your input and try again.'
  );
  
  // If there's a form context, highlight specific fields
  if (Object.keys(fieldErrors).length > 0) {
    console.warn('Field validation errors:', fieldErrors);
  }
}

function handleConflictError(error: APIError, variables: any) {
  showErrorNotification(
    'Conflict detected', 
    error.message || 'The item you are trying to modify has been changed by someone else.'
  );
}

function handleGenericError(error: APIError) {
  showErrorNotification(
    'Something went wrong', 
    error.message || 'An unexpected error occurred. Please try again.'
  );
}

function handleMutationGenericError(error: APIError, variables: any) {
  const action = getActionFromVariables(variables);
  showErrorNotification(
    `Failed to ${action}`, 
    error.message || 'Please try again or contact support if the problem persists.'
  );
}

// Utility functions
function showErrorNotification(title: string, message: string) {
  // This would integrate with your notification system
  // For now, we'll use console.error in development
  if (API_CONFIG.enableLogging) {
    console.error(`[Notification] ${title}: ${message}`);
  }
  
  // In a real app, you'd dispatch to a notification store or show a toast
  // Example: notificationStore.addNotification({ type: 'error', title, message });
}

function shouldReportError(error: APIError): boolean {
  // Don't report validation errors or user errors
  const nonReportableErrors = [
    ERROR_CODES.VALIDATION_ERROR,
    ERROR_CODES.UNAUTHORIZED,
    ERROR_CODES.FORBIDDEN,
    ERROR_CODES.NOT_FOUND,
    ERROR_CODES.RATE_LIMITED
  ];
  
  return !nonReportableErrors.includes(error.code as any);
}

function reportError(error: APIError, context: any) {
  // This would integrate with error reporting service (Sentry, LogRocket, etc.)
  if (API_CONFIG.enableLogging) {
    console.warn('[Error Report]', { error, context, timestamp: new Date().toISOString() });
  }
  
  // Example: Sentry.captureException(error, { extra: context });
}

function getActionFromVariables(variables: any): string {
  // Try to infer the action from mutation variables
  if (variables?.id && variables?.data) return 'update';
  if (variables?.id && !variables?.data) return 'delete';
  if (!variables?.id && variables?.data) return 'create';
  return 'save';
}

// Create query client with enhanced configuration
export const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
      onSuccess: (data, query) => {
        if (API_CONFIG.enableLogging && query.queryKey[0] === 'debug') {
          console.log('Query success:', { queryKey: query.queryKey, data });
        }
      }
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
      onSuccess: (data, variables, context, mutation) => {
        if (API_CONFIG.enableLogging && mutation.options.mutationKey?.[0] === 'debug') {
          console.log('Mutation success:', { 
            mutationKey: mutation.options.mutationKey, 
            variables, 
            data 
          });
        }
      }
    }),
    defaultOptions: {
      queries: {
        ...defaultQueryOptions,
        // Network mode determines when queries should run
        networkMode: 'online',
        // Refetch behavior
        refetchOnWindowFocus: false, // Disabled for better UX
        refetchOnReconnect: 'always',
        refetchOnMount: true,
        // Placeholder data configuration
        placeholderData: (previousData, previousQuery) => {
          // Keep previous data while refetching for better UX
          return previousData;
        },
        // Error handling
        throwOnError: false, // Handle errors gracefully through error boundaries
        // Background refetch behavior
        refetchInterval: false, // Disable polling by default
        refetchIntervalInBackground: false,
      },
      mutations: {
        // Network mode for mutations
        networkMode: 'online',
        // Enhanced retry logic for mutations
        retry: (failureCount: number, error: any) => {
          const apiError = error as APIError;
          
          // Don't retry on client errors
          if (apiError?.status >= HTTP_STATUS.BAD_REQUEST && apiError?.status < HTTP_STATUS.INTERNAL_SERVER_ERROR) {
            return false;
          }
          
          // Don't retry on specific error codes
          const nonRetryableErrors = [
            ERROR_CODES.UNAUTHORIZED,
            ERROR_CODES.FORBIDDEN,
            ERROR_CODES.VALIDATION_ERROR,
            ERROR_CODES.CONFLICT,
            ERROR_CODES.RATE_LIMITED
          ];
          
          if (nonRetryableErrors.includes(apiError?.code as any)) {
            return false;
          }
          
          // Fewer retries for mutations (they can have side effects)
          return failureCount < 2;
        },
        retryDelay: (attemptIndex: number) => {
          // Shorter delays for mutations
          return Math.min(500 * Math.pow(2, attemptIndex), 5000);
        },
        // Error handling
        throwOnError: false,
        // Success behavior
        onSuccess: (data, variables, context) => {
          // Global success handling for mutations
          if (API_CONFIG.enableLogging) {
            console.log('Mutation completed successfully');
          }
        }
      },
    },
  });
};

// Singleton query client instance
let queryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

// Query key factories for consistent key management
export const queryKeys = {
  // User-related queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    subscription: () => [...queryKeys.user.all, 'subscription'] as const,
  },
  
  // Document-related queries
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.documents.lists(), filters] as const,
    details: () => [...queryKeys.documents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    search: (query: string) => 
      [...queryKeys.documents.all, 'search', query] as const,
  },
  
  // Workflow-related queries
  workflows: {
    all: ['workflows'] as const,
    lists: () => [...queryKeys.workflows.all, 'list'] as const,
    list: (documentId?: string) => 
      [...queryKeys.workflows.lists(), { documentId }] as const,
    details: () => [...queryKeys.workflows.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workflows.details(), id] as const,
    templates: () => [...queryKeys.workflows.all, 'templates'] as const,
  },
  
  // AI-related queries
  ai: {
    all: ['ai'] as const,
    generate: (request: any) => 
      [...queryKeys.ai.all, 'generate', request] as const,
    suggestions: (documentId: string) => 
      [...queryKeys.ai.all, 'suggestions', documentId] as const,
    models: () => [...queryKeys.ai.all, 'models'] as const,
  },
} as const;

// Enhanced utility functions for cache management
export const queryUtils = {
  // Entity-specific invalidation
  invalidateUser: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
  },
  
  invalidateDocuments: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
  },
  
  invalidateWorkflows: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOWS });
  },
  
  invalidateSearch: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: QUERY_KEYS.SEARCH });
  },
  
  // Smart prefetching based on user behavior
  prefetchUserData: async (client: QueryClient) => {
    const { apiClient } = await import('./client');
    
    await Promise.all([
      client.prefetchQuery({
        queryKey: QUERY_KEYS.USER_PROFILE(),
        queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE),
        staleTime: API_CONFIG.CACHE_DURATION.MEDIUM
      }),
      client.prefetchQuery({
        queryKey: QUERY_KEYS.DOCUMENTS_LIST({}),
        queryFn: () => apiClient.get(API_ENDPOINTS.DOCUMENTS.LIST),
        staleTime: API_CONFIG.CACHE_DURATION.SHORT
      }),
    ]);
  },
  
  // Prefetch related data
  prefetchDocumentData: async (client: QueryClient, documentId: string) => {
    const { apiClient } = await import('./client');
    
    await Promise.allSettled([
      client.prefetchQuery({
        queryKey: QUERY_KEYS.DOCUMENT_VERSIONS(documentId),
        queryFn: () => apiClient.get(API_ENDPOINTS.DOCUMENTS.VERSIONS(documentId)),
        staleTime: API_CONFIG.CACHE_DURATION.MEDIUM
      }),
      client.prefetchQuery({
        queryKey: QUERY_KEYS.DOCUMENT_COLLABORATORS(documentId),
        queryFn: () => apiClient.get(API_ENDPOINTS.DOCUMENTS.COLLABORATORS(documentId)),
        staleTime: API_CONFIG.CACHE_DURATION.SHORT
      }),
    ]);
  },
  
  // Optimistic updates with rollback capability
  updateDocumentCache: (
    client: QueryClient,
    documentId: string,
    updater: (oldData: any) => any
  ) => {
    // Update individual document
    client.setQueryData(QUERY_KEYS.DOCUMENT(documentId), updater);
    
    // Update in all document lists
    client.setQueriesData(
      { queryKey: QUERY_KEYS.DOCUMENTS, exact: false },
      (oldData: any) => {
        if (!oldData) return oldData;
        
        if (oldData.documents) {
          // Regular paginated list
          return {
            ...oldData,
            documents: oldData.documents.map((doc: any) =>
              doc.id === documentId ? updater(doc) : doc
            )
          };
        } else if (oldData.pages) {
          // Infinite query structure
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              documents: page.documents.map((doc: any) =>
                doc.id === documentId ? updater(doc) : doc
              )
            }))
          };
        }
        
        return oldData;
      }
    );
  },
  
  // Update workflow cache
  updateWorkflowCache: (
    client: QueryClient,
    workflowId: string,
    updater: (oldData: any) => any
  ) => {
    client.setQueryData(QUERY_KEYS.WORKFLOW(workflowId), updater);
    
    client.setQueriesData(
      { queryKey: QUERY_KEYS.WORKFLOWS, exact: false },
      (oldData: any) => {
        if (!oldData) return oldData;
        
        if (oldData.workflows) {
          return {
            ...oldData,
            workflows: oldData.workflows.map((workflow: any) =>
              workflow.id === workflowId ? updater(workflow) : workflow
            )
          };
        } else if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              workflows: page.workflows.map((workflow: any) =>
                workflow.id === workflowId ? updater(workflow) : workflow
              )
            }))
          };
        }
        
        return oldData;
      }
    );
  },
  
  // Remove item from cache
  removeFromCache: (client: QueryClient, entityType: 'document' | 'workflow', id: string) => {
    if (entityType === 'document') {
      client.removeQueries({ queryKey: QUERY_KEYS.DOCUMENT(id) });
      // Remove from lists
      client.setQueriesData(
        { queryKey: QUERY_KEYS.DOCUMENTS, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (oldData.documents) {
            return {
              ...oldData,
              documents: oldData.documents.filter((item: any) => item.id !== id),
              meta: { ...oldData.meta, total: oldData.meta.total - 1 }
            };
          } else if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                documents: page.documents.filter((item: any) => item.id !== id),
                meta: { ...page.meta, total: page.meta.total - 1 }
              }))
            };
          }
          
          return oldData;
        }
      );
    } else if (entityType === 'workflow') {
      client.removeQueries({ queryKey: QUERY_KEYS.WORKFLOW(id) });
      // Similar logic for workflows...
    }
  },
  
  // Batch cache operations
  batchUpdate: (client: QueryClient, operations: Array<{
    type: 'set' | 'invalidate' | 'remove';
    queryKey: any[];
    data?: any;
    updater?: (oldData: any) => any;
  }>) => {
    operations.forEach(({ type, queryKey, data, updater }) => {
      switch (type) {
        case 'set':
          if (updater) {
            client.setQueryData(queryKey, updater);
          } else {
            client.setQueryData(queryKey, data);
          }
          break;
        case 'invalidate':
          client.invalidateQueries({ queryKey });
          break;
        case 'remove':
          client.removeQueries({ queryKey });
          break;
      }
    });
  },
  
  // Clear all caches (useful for logout)
  clearAllCaches: (client: QueryClient) => {
    client.clear();
  },
  
  // Selective cache clearing
  clearUserData: (client: QueryClient) => {
    client.removeQueries({ queryKey: QUERY_KEYS.AUTH });
    client.removeQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
    client.removeQueries({ queryKey: QUERY_KEYS.WORKFLOWS });
  },
  
  // Cache persistence utilities
  dehydrateQueries: (client: QueryClient, queryKeys: string[][]) => {
    return queryKeys.map(queryKey => ({
      queryKey,
      data: client.getQueryData(queryKey),
      state: client.getQueryState(queryKey)
    }));
  },
  
  hydrateQueries: (client: QueryClient, queries: any[]) => {
    queries.forEach(({ queryKey, data }) => {
      if (data) {
        client.setQueryData(queryKey, data);
      }
    });
  },
  
  // Performance monitoring
  getCacheStats: (client: QueryClient) => {
    const cache = client.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.isActive()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.error).length,
      cacheSize: JSON.stringify(queries.map(q => q.state.data)).length,
      oldestQuery: Math.min(...queries.map(q => q.state.dataUpdatedAt)),
      newestQuery: Math.max(...queries.map(q => q.state.dataUpdatedAt))
    };
  },
  
  // Debug utilities
  logCacheContents: (client: QueryClient, filter?: string) => {
    const cache = client.getQueryCache();
    const queries = cache.getAll();
    
    const filteredQueries = filter 
      ? queries.filter(q => JSON.stringify(q.queryKey).includes(filter))
      : queries;
    
    console.group('Query Cache Contents');
    filteredQueries.forEach(query => {
      console.log({
        queryKey: query.queryKey,
        data: query.state.data,
        error: query.state.error,
        status: query.state.status,
        stale: query.isStale(),
        active: query.isActive(),
        lastUpdated: new Date(query.state.dataUpdatedAt)
      });
    });
    console.groupEnd();
  }
};