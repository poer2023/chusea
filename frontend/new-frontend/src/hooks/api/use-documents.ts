// Document management hooks using TanStack Query

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { QUERY_KEYS, API_ENDPOINTS, API_CONFIG } from '../../lib/constants';
import type {
  Document,
  CreateDocumentData,
  UpdateDocumentData,
  ShareDocumentData,
  ExportOptions,
  ImportOptions,
  GetDocumentsRequest,
  GetDocumentsResponse,
  CreateDocumentResponse,
  UpdateDocumentResponse,
  DeleteDocumentResponse,
  UploadFileResponse,
  DocumentComment,
  DocumentSuggestion,
  DocumentAnalytics,
  VersionHistory,
  Collaborator,
  CollaborationInvitation
} from '../../types';

// ============================================================================
// DOCUMENT QUERIES
// ============================================================================

/**
 * Hook to get paginated list of documents
 */
export function useDocuments(filters: GetDocumentsRequest = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS_LIST(filters),
    queryFn: async (): Promise<GetDocumentsResponse> => {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const endpoint = params.toString() 
        ? `${API_ENDPOINTS.DOCUMENTS.LIST}?${params.toString()}`
        : API_ENDPOINTS.DOCUMENTS.LIST;
      
      return apiClient.get<GetDocumentsResponse>(endpoint);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData
  });
}

/**
 * Hook for infinite scroll documents
 */
export function useInfiniteDocuments(filters: Omit<GetDocumentsRequest, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.DOCUMENTS_LIST(filters), 'infinite'],
    queryFn: async ({ pageParam = 1 }): Promise<GetDocumentsResponse> => {
      const params = new URLSearchParams();
      params.append('page', pageParam.toString());
      params.append('pageSize', (filters.pageSize || API_CONFIG.DEFAULT_PAGE_SIZE).toString());
      
      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'pageSize') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const endpoint = `${API_ENDPOINTS.DOCUMENTS.LIST}?${params.toString()}`;
      return apiClient.get<GetDocumentsResponse>(endpoint);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to get a single document by ID
 */
export function useDocument(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENT(id),
    queryFn: async (): Promise<Document> => {
      return apiClient.get<Document>(API_ENDPOINTS.DOCUMENTS.GET(id));
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error: any) => {
      // Don't retry if document not found
      if (error?.status === 404) return false;
      return failureCount < 2;
    }
  });
}

/**
 * Hook to get document versions
 */
export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENT_VERSIONS(documentId),
    queryFn: async (): Promise<VersionHistory[]> => {
      return apiClient.get<VersionHistory[]>(API_ENDPOINTS.DOCUMENTS.VERSIONS(documentId));
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to get document collaborators
 */
export function useDocumentCollaborators(documentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENT_COLLABORATORS(documentId),
    queryFn: async (): Promise<Collaborator[]> => {
      return apiClient.get<Collaborator[]>(API_ENDPOINTS.DOCUMENTS.COLLABORATORS(documentId));
    },
    enabled: !!documentId,
    staleTime: 3 * 60 * 1000 // 3 minutes
  });
}

/**
 * Hook to get document comments
 */
export function useDocumentComments(documentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENT_COMMENTS(documentId),
    queryFn: async (): Promise<DocumentComment[]> => {
      return apiClient.get<DocumentComment[]>(API_ENDPOINTS.DOCUMENTS.COMMENTS(documentId));
    },
    enabled: !!documentId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true // Comments should be fresh
  });
}

/**
 * Hook to get document suggestions
 */
export function useDocumentSuggestions(documentId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENT(documentId), 'suggestions'],
    queryFn: async (): Promise<DocumentSuggestion[]> => {
      return apiClient.get<DocumentSuggestion[]>(API_ENDPOINTS.DOCUMENTS.SUGGESTIONS(documentId));
    },
    enabled: !!documentId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

/**
 * Hook to get document analytics
 */
export function useDocumentAnalytics(documentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENT_ANALYTICS(documentId),
    queryFn: async (): Promise<DocumentAnalytics> => {
      return apiClient.get<DocumentAnalytics>(API_ENDPOINTS.DOCUMENTS.ANALYTICS(documentId));
    },
    enabled: !!documentId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

// ============================================================================
// DOCUMENT MUTATIONS
// ============================================================================

/**
 * Hook for creating a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateDocumentData): Promise<CreateDocumentResponse> => {
      return apiClient.post<CreateDocumentResponse>(API_ENDPOINTS.DOCUMENTS.CREATE, data);
    },
    onSuccess: (response) => {
      // Add new document to all relevant lists
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(response.document.id), response.document);
      
      // Invalidate document lists to include the new document
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
}

/**
 * Hook for updating a document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDocumentData }): Promise<UpdateDocumentResponse> => {
      return apiClient.put<UpdateDocumentResponse>(API_ENDPOINTS.DOCUMENTS.UPDATE(id), data);
    },
    onSuccess: (response, { id }) => {
      // Update document in cache
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(id), response.document);
      
      // Update document in all lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.DOCUMENTS, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Handle different list structures
          if (oldData.documents) {
            // Regular paginated list
            return {
              ...oldData,
              documents: oldData.documents.map((doc: Document) =>
                doc.id === id ? response.document : doc
              )
            };
          } else if (oldData.pages) {
            // Infinite query structure
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                documents: page.documents.map((doc: Document) =>
                  doc.id === id ? response.document : doc
                )
              }))
            };
          }
          
          return oldData;
        }
      );
    },
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.DOCUMENT(id) });
      
      const previousDocument = queryClient.getQueryData(QUERY_KEYS.DOCUMENT(id));
      
      if (previousDocument) {
        queryClient.setQueryData(QUERY_KEYS.DOCUMENT(id), {
          ...previousDocument,
          ...data,
          updatedAt: new Date().toISOString()
        });
      }
      
      return { previousDocument };
    },
    onError: (error, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousDocument) {
        queryClient.setQueryData(QUERY_KEYS.DOCUMENT(id), context.previousDocument);
      }
    }
  });
}

/**
 * Hook for deleting a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<DeleteDocumentResponse> => {
      return apiClient.delete<DeleteDocumentResponse>(API_ENDPOINTS.DOCUMENTS.DELETE(id));
    },
    onSuccess: (response, id) => {
      // Remove document from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.DOCUMENT(id) });
      
      // Remove document from all lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.DOCUMENTS, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (oldData.documents) {
            return {
              ...oldData,
              documents: oldData.documents.filter((doc: Document) => doc.id !== id),
              meta: {
                ...oldData.meta,
                total: oldData.meta.total - 1
              }
            };
          } else if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                documents: page.documents.filter((doc: Document) => doc.id !== id),
                meta: {
                  ...page.meta,
                  total: page.meta.total - 1
                }
              }))
            };
          }
          
          return oldData;
        }
      );
    }
  });
}

/**
 * Hook for duplicating a document
 */
export function useDuplicateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title?: string }): Promise<CreateDocumentResponse> => {
      return apiClient.post<CreateDocumentResponse>(
        API_ENDPOINTS.DOCUMENTS.DUPLICATE(id),
        title ? { title } : {}
      );
    },
    onSuccess: (response) => {
      // Add duplicated document to cache
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(response.document.id), response.document);
      
      // Invalidate document lists
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
}

/**
 * Hook for archiving a document
 */
export function useArchiveDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateDocumentResponse> => {
      return apiClient.post<UpdateDocumentResponse>(API_ENDPOINTS.DOCUMENTS.ARCHIVE(id));
    },
    onSuccess: (response, id) => {
      // Update document status in cache
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(id), response.document);
      
      // Update document in lists
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
}

/**
 * Hook for restoring an archived document
 */
export function useRestoreDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateDocumentResponse> => {
      return apiClient.post<UpdateDocumentResponse>(API_ENDPOINTS.DOCUMENTS.RESTORE(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(id), response.document);
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
}

/**
 * Hook for publishing a document
 */
export function usePublishDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateDocumentResponse> => {
      return apiClient.post<UpdateDocumentResponse>(API_ENDPOINTS.DOCUMENTS.PUBLISH(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(id), response.document);
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
}

/**
 * Hook for unpublishing a document
 */
export function useUnpublishDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateDocumentResponse> => {
      return apiClient.post<UpdateDocumentResponse>(API_ENDPOINTS.DOCUMENTS.UNPUBLISH(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(id), response.document);
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
}

// ============================================================================
// COLLABORATION MUTATIONS
// ============================================================================

/**
 * Hook for sharing a document
 */
export function useShareDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ShareDocumentData }): Promise<void> => {
      return apiClient.post<void>(API_ENDPOINTS.DOCUMENTS.SHARE(id), data);
    },
    onSuccess: (response, { id }) => {
      // Invalidate collaborators to reflect new shares
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_COLLABORATORS(id) });
    }
  });
}

/**
 * Hook for adding a comment to a document
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      comment 
    }: { 
      documentId: string; 
      comment: Omit<DocumentComment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> 
    }): Promise<DocumentComment> => {
      return apiClient.post<DocumentComment>(
        API_ENDPOINTS.DOCUMENTS.COMMENTS(documentId),
        comment
      );
    },
    onSuccess: (newComment, { documentId }) => {
      // Add comment to the list
      queryClient.setQueryData(
        QUERY_KEYS.DOCUMENT_COMMENTS(documentId),
        (oldComments: DocumentComment[] = []) => [...oldComments, newComment]
      );
    }
  });
}

/**
 * Hook for responding to a suggestion
 */
export function useRespondToSuggestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      suggestionId, 
      action 
    }: { 
      documentId: string; 
      suggestionId: string; 
      action: 'accept' | 'reject' 
    }): Promise<void> => {
      return apiClient.post<void>(
        `${API_ENDPOINTS.DOCUMENTS.SUGGESTIONS(documentId)}/${suggestionId}/${action}`
      );
    },
    onSuccess: (response, { documentId }) => {
      // Refresh suggestions and document content
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENT(documentId), 'suggestions'] 
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT(documentId) });
    }
  });
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Hook for uploading files to a document
 */
export function useUploadDocumentFiles() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      files,
      onProgress 
    }: { 
      documentId: string; 
      files: File | File[];
      onProgress?: (progress: any) => void;
    }): Promise<UploadFileResponse[]> => {
      return apiClient.upload<UploadFileResponse[]>(
        API_ENDPOINTS.FILES.UPLOAD,
        files,
        {
          additionalData: { documentId, purpose: 'document' },
          onProgress
        }
      );
    },
    onSuccess: (response, { documentId }) => {
      // Invalidate document to include new files
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT(documentId) });
    }
  });
}

/**
 * Hook for exporting a document
 */
export function useExportDocument() {
  return useMutation({
    mutationFn: async ({ 
      id, 
      format, 
      options 
    }: { 
      id: string; 
      format: string; 
      options?: ExportOptions 
    }): Promise<Blob> => {
      const endpoint = options 
        ? `${API_ENDPOINTS.DOCUMENTS.EXPORT(id, format)}?${new URLSearchParams(options as any).toString()}`
        : API_ENDPOINTS.DOCUMENTS.EXPORT(id, format);
      
      return apiClient.download(endpoint);
    }
  });
}

/**
 * Hook for importing a document
 */
export function useImportDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      file, 
      options 
    }: { 
      file: File; 
      options?: ImportOptions 
    }): Promise<CreateDocumentResponse> => {
      return apiClient.upload<CreateDocumentResponse>(
        API_ENDPOINTS.DOCUMENTS.IMPORT,
        file,
        {
          additionalData: options
        }
      );
    },
    onSuccess: (response) => {
      // Add imported document to cache
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(response.document.id), response.document);
      
      // Invalidate document lists
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
}

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

/**
 * Hook for restoring a document version
 */
export function useRestoreDocumentVersion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      version 
    }: { 
      documentId: string; 
      version: number 
    }): Promise<UpdateDocumentResponse> => {
      return apiClient.post<UpdateDocumentResponse>(
        API_ENDPOINTS.DOCUMENTS.RESTORE_VERSION(documentId, version)
      );
    },
    onSuccess: (response, { documentId }) => {
      // Update document with restored content
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(documentId), response.document);
      
      // Refresh version history
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_VERSIONS(documentId) });
    }
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for auto-saving document changes
 */
export function useAutoSaveDocument(documentId: string, content: string, enabled = true) {
  const updateDocument = useUpdateDocument();
  const [lastSaved, setLastSaved] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState(false);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();
  
  React.useEffect(() => {
    if (!enabled || !documentId || content === lastSaved) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateDocument.mutateAsync({
          id: documentId,
          data: { content }
        });
        setLastSaved(content);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, API_CONFIG.AUTOSAVE_INTERVAL);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, documentId, enabled, lastSaved, updateDocument]);
  
  return {
    isSaving,
    lastSaved: lastSaved === content ? new Date() : null
  };
}

/**
 * Hook for searching documents
 */
export function useSearchDocuments(query: string, filters: any = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH_DOCUMENTS(query, filters),
    queryFn: async () => {
      return apiClient.get(API_ENDPOINTS.SEARCH.DOCUMENTS, {
        body: JSON.stringify({ query, filters })
      });
    },
    enabled: query.length > 2, // Only search with meaningful queries
    staleTime: 30 * 1000, // 30 seconds
    debounce: 300 // Debounce search requests
  });
}

// React import for hooks
import React from 'react';