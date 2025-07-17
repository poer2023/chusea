// Advanced document management hooks for ChUseA
import React from 'react';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { call } from '../../lib/api/router';
import { QUERY_KEYS, API_CONFIG } from '../../lib/constants';
import { useAdvancedPermissions } from './use-auth-advanced';
import type {
  Document,
  GetDocumentsRequest,
  GetDocumentsResponse,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentCollaboration,
  DocumentTemplate,
  DocumentAnalytics
} from '../../types';

// ============================================================================
// BULK OPERATIONS HOOKS
// ============================================================================

/**
 * Hook for bulk document operations
 */
export function useBulkDocumentOperations() {
  const queryClient = useQueryClient();
  const { checkPermission } = useAdvancedPermissions();
  
  const bulkCreate = useMutation({
    mutationFn: async (documents: CreateDocumentData[]) => {
      if (!checkPermission('documents:bulk_create')) {
        throw new Error('Insufficient permissions for bulk creation');
      }
      return call('documents.bulkCreate', { documents });
    },
    onSuccess: (response) => {
      // Invalidate all document lists
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
      
      // Add new documents to cache
      response.documents.forEach((doc: Document) => {
        queryClient.setQueryData(QUERY_KEYS.DOCUMENT(doc.id), doc);
      });
    }
  });
  
  const bulkUpdate = useMutation({
    mutationFn: async ({
      documentIds,
      updates
    }: {
      documentIds: string[];
      updates: Partial<UpdateDocumentData>;
    }) => {
      if (!checkPermission('documents:bulk_update')) {
        throw new Error('Insufficient permissions for bulk update');
      }
      return call('documents.bulkUpdate', { documentIds, updates });
    },
    onSuccess: (response, { documentIds }) => {
      // Update documents in cache
      response.documents.forEach((doc: Document) => {
        queryClient.setQueryData(QUERY_KEYS.DOCUMENT(doc.id), doc);
      });
      
      // Update documents in lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.DOCUMENTS, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (oldData.documents) {
            return {
              ...oldData,
              documents: oldData.documents.map((doc: Document) =>
                documentIds.includes(doc.id) 
                  ? response.documents.find((updated: Document) => updated.id === doc.id) || doc
                  : doc
              )
            };
          }
          
          return oldData;
        }
      );
    }
  });
  
  const bulkDelete = useMutation({
    mutationFn: async (documentIds: string[]) => {
      if (!checkPermission('documents:bulk_delete')) {
        throw new Error('Insufficient permissions for bulk deletion');
      }
      return call('documents.bulkDelete', { documentIds });
    },
    onSuccess: (response, documentIds) => {
      // Remove documents from cache
      documentIds.forEach(id => {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.DOCUMENT(id) });
      });
      
      // Remove documents from lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.DOCUMENTS, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (oldData.documents) {
            return {
              ...oldData,
              documents: oldData.documents.filter((doc: Document) => 
                !documentIds.includes(doc.id)
              ),
              meta: {
                ...oldData.meta,
                total: oldData.meta.total - documentIds.length
              }
            };
          }
          
          return oldData;
        }
      );
    }
  });
  
  const bulkArchive = useMutation({
    mutationFn: async (documentIds: string[]) => {
      if (!checkPermission('documents:bulk_archive')) {
        throw new Error('Insufficient permissions for bulk archiving');
      }
      return call('documents.bulkArchive', { documentIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
  
  const bulkMove = useMutation({
    mutationFn: async ({
      documentIds,
      folderId,
      categoryId
    }: {
      documentIds: string[];
      folderId?: string;
      categoryId?: string;
    }) => {
      if (!checkPermission('documents:bulk_move')) {
        throw new Error('Insufficient permissions for bulk move');
      }
      return call('documents.bulkMove', { documentIds, folderId, categoryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
  
  const bulkTag = useMutation({
    mutationFn: async ({
      documentIds,
      tags,
      action = 'add'
    }: {
      documentIds: string[];
      tags: string[];
      action?: 'add' | 'remove' | 'replace';
    }) => {
      return call('documents.bulkTag', { documentIds, tags, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
  
  return {
    bulkCreate,
    bulkUpdate,
    bulkDelete,
    bulkArchive,
    bulkMove,
    bulkTag,
    isLoading: bulkCreate.isPending || 
               bulkUpdate.isPending || 
               bulkDelete.isPending || 
               bulkArchive.isPending || 
               bulkMove.isPending || 
               bulkTag.isPending,
  };
}

// ============================================================================
// ADVANCED SEARCH HOOKS
// ============================================================================

/**
 * Hook for advanced document search with faceted filtering
 */
export function useAdvancedDocumentSearch() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<any>({});
  const [facets, setFacets] = React.useState<any>({});
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  
  // Debounced search
  const debouncedQuery = React.useMemo(() => {
    const timer = setTimeout(() => searchQuery, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const searchResults = useQuery({
    queryKey: ['documents', 'search', searchQuery, filters],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      
      return call('documents.search', {
        query: searchQuery,
        filters,
        facets: true,
        highlighting: true,
        suggestions: true,
      });
    },
    enabled: searchQuery.length > 2,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  const savedSearches = useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENTS, 'saved-searches'],
    queryFn: () => call('documents.getSavedSearches'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const saveSearch = useMutation({
    mutationFn: async ({
      name,
      query,
      filters,
      isPublic = false
    }: {
      name: string;
      query: string;
      filters: any;
      isPublic?: boolean;
    }) => {
      return call('documents.saveSearch', { name, query, filters, isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENTS, 'saved-searches'] 
      });
    }
  });
  
  const deleteSearch = useMutation({
    mutationFn: async (searchId: string) => {
      return call('documents.deleteSavedSearch', { searchId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENTS, 'saved-searches'] 
      });
    }
  });
  
  // Add to search history
  const addToHistory = React.useCallback((query: string) => {
    if (!query.trim() || searchHistory.includes(query)) return;
    
    const newHistory = [query, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(newHistory);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('document_search_history', JSON.stringify(newHistory));
    }
  }, [searchHistory]);
  
  // Load search history on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('document_search_history');
      if (stored) {
        try {
          setSearchHistory(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse search history:', error);
        }
      }
    }
  }, []);
  
  const updateFilter = React.useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);
  
  const removeFilter = React.useCallback((key: string) => {
    setFilters(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);
  
  const clearFilters = React.useCallback(() => {
    setFilters({});
  }, []);
  
  const getSuggestions = useQuery({
    queryKey: ['documents', 'search-suggestions', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      return call('documents.getSearchSuggestions', { query: searchQuery });
    },
    enabled: searchQuery.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
  
  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    searchResults: searchResults.data,
    isSearching: searchResults.isLoading,
    searchError: searchResults.error,
    facets: searchResults.data?.facets || {},
    suggestions: getSuggestions.data || [],
    searchHistory,
    addToHistory,
    savedSearches: savedSearches.data || [],
    saveSearch,
    deleteSearch,
  };
}

// ============================================================================
// REAL-TIME COLLABORATION HOOKS
// ============================================================================

/**
 * Hook for real-time document collaboration
 */
export function useDocumentCollaboration(documentId: string) {
  const [collaborators, setCollaborators] = React.useState<any[]>([]);
  const [currentUsers, setCurrentUsers] = React.useState<any[]>([]);
  const [comments, setComments] = React.useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const queryClient = useQueryClient();
  
  // Get collaboration data
  const collaboration = useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENT(documentId), 'collaboration'],
    queryFn: () => call('documents.getCollaboration', { documentId }),
    enabled: !!documentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  
  // Real-time updates would be handled via WebSocket
  // For now, we'll use polling
  React.useEffect(() => {
    if (!documentId) return;
    
    const interval = setInterval(async () => {
      try {
        const data = await call('documents.getCollaborationUpdates', { documentId });
        setCurrentUsers(data.currentUsers || []);
        setComments(data.comments || []);
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to fetch collaboration updates:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [documentId]);
  
  const addCollaborator = useMutation({
    mutationFn: async ({
      email,
      role = 'editor',
      message
    }: {
      email: string;
      role?: 'viewer' | 'editor' | 'admin';
      message?: string;
    }) => {
      return call('documents.addCollaborator', {
        documentId,
        email,
        role,
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENT(documentId), 'collaboration'] 
      });
    }
  });
  
  const removeCollaborator = useMutation({
    mutationFn: async (userId: string) => {
      return call('documents.removeCollaborator', { documentId, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENT(documentId), 'collaboration'] 
      });
    }
  });
  
  const updateCollaboratorRole = useMutation({
    mutationFn: async ({
      userId,
      role
    }: {
      userId: string;
      role: 'viewer' | 'editor' | 'admin';
    }) => {
      return call('documents.updateCollaboratorRole', { documentId, userId, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENT(documentId), 'collaboration'] 
      });
    }
  });
  
  const addComment = useMutation({
    mutationFn: async ({
      content,
      position,
      replyTo
    }: {
      content: string;
      position?: { start: number; end: number };
      replyTo?: string;
    }) => {
      return call('documents.addComment', {
        documentId,
        content,
        position,
        replyTo,
      });
    },
    onSuccess: (newComment) => {
      setComments(prev => [...prev, newComment]);
    }
  });
  
  const resolveComment = useMutation({
    mutationFn: async (commentId: string) => {
      return call('documents.resolveComment', { documentId, commentId });
    },
    onSuccess: (resolvedComment) => {
      setComments(prev => 
        prev.map(c => c.id === resolvedComment.id ? resolvedComment : c)
      );
    }
  });
  
  const addSuggestion = useMutation({
    mutationFn: async ({
      type,
      content,
      position,
      originalText
    }: {
      type: 'addition' | 'deletion' | 'modification';
      content: string;
      position: { start: number; end: number };
      originalText?: string;
    }) => {
      return call('documents.addSuggestion', {
        documentId,
        type,
        content,
        position,
        originalText,
      });
    },
    onSuccess: (newSuggestion) => {
      setSuggestions(prev => [...prev, newSuggestion]);
    }
  });
  
  const applySuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      return call('documents.applySuggestion', { documentId, suggestionId });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT(documentId) });
      setSuggestions(prev => prev.filter(s => s.id !== variables));
    }
  });
  
  const rejectSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      return call('documents.rejectSuggestion', { documentId, suggestionId });
    },
    onSuccess: (rejectedSuggestion) => {
      setSuggestions(prev => 
        prev.map(s => s.id === rejectedSuggestion.id ? rejectedSuggestion : s)
      );
    }
  });
  
  return {
    collaboration: collaboration.data,
    collaborators,
    currentUsers,
    comments,
    suggestions,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    addComment,
    resolveComment,
    addSuggestion,
    applySuggestion,
    rejectSuggestion,
    isLoading: collaboration.isLoading,
  };
}

// ============================================================================
// DOCUMENT TEMPLATES HOOKS
// ============================================================================

/**
 * Hook for document templates management
 */
export function useDocumentTemplates() {
  const queryClient = useQueryClient();
  
  const templates = useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENTS, 'templates'],
    queryFn: () => call('documents.getTemplates'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const categorizedTemplates = useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENTS, 'templates', 'categorized'],
    queryFn: () => call('documents.getCategorizedTemplates'),
    staleTime: 10 * 60 * 1000,
  });
  
  const createFromTemplate = useMutation({
    mutationFn: async ({
      templateId,
      variables,
      title
    }: {
      templateId: string;
      variables?: Record<string, any>;
      title?: string;
    }) => {
      return call('documents.createFromTemplate', {
        templateId,
        variables,
        title,
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(response.document.id), response.document);
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.DOCUMENTS,
        exact: false 
      });
    }
  });
  
  const saveAsTemplate = useMutation({
    mutationFn: async ({
      documentId,
      name,
      description,
      category,
      isPublic = false,
      variables
    }: {
      documentId: string;
      name: string;
      description?: string;
      category?: string;
      isPublic?: boolean;
      variables?: string[];
    }) => {
      return call('documents.saveAsTemplate', {
        documentId,
        name,
        description,
        category,
        isPublic,
        variables,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENTS, 'templates'] 
      });
    }
  });
  
  const updateTemplate = useMutation({
    mutationFn: async ({
      templateId,
      name,
      description,
      category,
      content,
      variables
    }: {
      templateId: string;
      name?: string;
      description?: string;
      category?: string;
      content?: string;
      variables?: string[];
    }) => {
      return call('documents.updateTemplate', {
        templateId,
        name,
        description,
        category,
        content,
        variables,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENTS, 'templates'] 
      });
    }
  });
  
  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      return call('documents.deleteTemplate', { templateId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENTS, 'templates'] 
      });
    }
  });
  
  const duplicateTemplate = useMutation({
    mutationFn: async ({
      templateId,
      name
    }: {
      templateId: string;
      name: string;
    }) => {
      return call('documents.duplicateTemplate', { templateId, name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.DOCUMENTS, 'templates'] 
      });
    }
  });
  
  return {
    templates: templates.data || [],
    categorizedTemplates: categorizedTemplates.data || {},
    createFromTemplate,
    saveAsTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    isLoading: templates.isLoading || categorizedTemplates.isLoading,
  };
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

/**
 * Hook for document analytics and insights
 */
export function useDocumentAnalytics(documentId?: string) {
  const documentAnalytics = useQuery({
    queryKey: documentId 
      ? [...QUERY_KEYS.DOCUMENT(documentId), 'analytics']
      : [...QUERY_KEYS.DOCUMENTS, 'analytics'],
    queryFn: () => {
      if (documentId) {
        return call('documents.getAnalytics', { documentId });
      } else {
        return call('documents.getOverallAnalytics');
      }
    },
    enabled: !!documentId || documentId === undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const readingStats = useQuery({
    queryKey: documentId 
      ? [...QUERY_KEYS.DOCUMENT(documentId), 'reading-stats']
      : [...QUERY_KEYS.DOCUMENTS, 'reading-stats'],
    queryFn: () => {
      if (documentId) {
        return call('documents.getReadingStats', { documentId });
      } else {
        return call('documents.getOverallReadingStats');
      }
    },
    enabled: !!documentId || documentId === undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const performanceMetrics = useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENTS, 'performance'],
    queryFn: () => call('documents.getPerformanceMetrics'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
  
  const trackEngagement = useMutation({
    mutationFn: async ({
      documentId,
      event,
      metadata
    }: {
      documentId: string;
      event: string;
      metadata?: Record<string, any>;
    }) => {
      return call('documents.trackEngagement', {
        documentId,
        event,
        metadata,
      });
    }
  });
  
  return {
    analytics: documentAnalytics.data,
    readingStats: readingStats.data,
    performanceMetrics: performanceMetrics.data,
    trackEngagement,
    isLoading: documentAnalytics.isLoading || 
               readingStats.isLoading || 
               performanceMetrics.isLoading,
  };
}

// ============================================================================
// EXPORT UTILITY HOOK
// ============================================================================

/**
 * Hook for advanced document export functionality
 */
export function useDocumentExport() {
  const exportDocument = useMutation({
    mutationFn: async ({
      documentId,
      format,
      options
    }: {
      documentId: string;
      format: 'pdf' | 'docx' | 'html' | 'markdown' | 'epub';
      options?: {
        includeComments?: boolean;
        includeRevisions?: boolean;
        theme?: string;
        fontSize?: number;
        margins?: { top: number; right: number; bottom: number; left: number };
        watermark?: string;
      };
    }) => {
      return call('documents.export', { documentId, format, options });
    }
  });
  
  const bulkExport = useMutation({
    mutationFn: async ({
      documentIds,
      format,
      options
    }: {
      documentIds: string[];
      format: 'pdf' | 'docx' | 'html' | 'markdown' | 'zip';
      options?: any;
    }) => {
      return call('documents.bulkExport', { documentIds, format, options });
    }
  });
  
  return {
    exportDocument,
    bulkExport,
    isExporting: exportDocument.isPending || bulkExport.isPending,
  };
}

const queryClient = useQueryClient();