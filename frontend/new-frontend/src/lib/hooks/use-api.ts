import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys, queryUtils } from '../api/query-client';
import { useSimpleToast } from '../stores/simple-stores';
import type { 
  User, 
  Document, 
  WritingWorkflow, 
  AIWritingRequest, 
  AIWritingResponse,
  DocumentStatus 
} from '../../types';

// User API hooks
export const useUser = (options?: Omit<UseQueryOptions<User>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      return apiClient.get<User>('/user/profile');
    },
    ...options,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      return apiClient.patch<User>('/user/profile', updates);
    },
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(queryKeys.user.profile(), data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile', error.message);
    },
  });
};

// Document API hooks
export const useDocuments = (
  filters: Record<string, any> = {},
  options?: Omit<UseQueryOptions<Document[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.documents.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      return apiClient.get<Document[]>(`/documents?${params}`);
    },
    ...options,
  });
};

export const useDocument = (
  id: string,
  options?: Omit<UseQueryOptions<Document>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: async () => {
      return apiClient.get<Document>(`/documents/${id}`);
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async (data: { title: string; content?: string }) => {
      return apiClient.post<Document>('/documents', data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch documents list
      queryUtils.invalidateDocuments(queryClient);
      // Add to cache
      queryClient.setQueryData(queryKeys.documents.detail(data.id), data);
      toast.success('Document created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create document', error.message);
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
      return apiClient.patch<Document>(`/documents/${id}`, updates);
    },
    onSuccess: (data) => {
      // Update specific document cache
      queryUtils.updateDocumentCache(queryClient, data.id, () => data);
      toast.success('Document updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update document', error.message);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete<void>(`/documents/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.documents.detail(id) });
      // Invalidate lists
      queryUtils.invalidateDocuments(queryClient);
      toast.success('Document deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete document', error.message);
    },
  });
};

export const useBulkUpdateDocuments = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: { status?: DocumentStatus } }) => {
      return apiClient.patch<Document[]>('/documents/bulk', { ids, updates });
    },
    onSuccess: (data) => {
      // Update all affected documents in cache
      data.forEach((doc) => {
        queryUtils.updateDocumentCache(queryClient, doc.id, () => doc);
      });
      toast.success(`Updated ${data.length} documents successfully`);
    },
    onError: (error: any) => {
      toast.error('Failed to update documents', error.message);
    },
  });
};

// Search API hooks
export const useSearchDocuments = (
  query: string,
  options?: Omit<UseQueryOptions<Document[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.documents.search(query),
    queryFn: async () => {
      return apiClient.get<Document[]>(`/documents/search?q=${encodeURIComponent(query)}`);
    },
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Workflow API hooks
export const useWorkflows = (
  documentId?: string,
  options?: Omit<UseQueryOptions<WritingWorkflow[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.workflows.list(documentId),
    queryFn: async () => {
      const params = documentId ? `?documentId=${documentId}` : '';
      return apiClient.get<WritingWorkflow[]>(`/workflows${params}`);
    },
    ...options,
  });
};

export const useWorkflow = (
  id: string,
  options?: Omit<UseQueryOptions<WritingWorkflow>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.workflows.detail(id),
    queryFn: async () => {
      return apiClient.get<WritingWorkflow>(`/workflows/${id}`);
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async (data: { documentId: string; steps?: string[] }) => {
      return apiClient.post<WritingWorkflow>('/workflows', data);
    },
    onSuccess: (data) => {
      queryUtils.invalidateWorkflows(queryClient);
      queryClient.setQueryData(queryKeys.workflows.detail(data.id), data);
      toast.success('Workflow started successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to start workflow', error.message);
    },
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WritingWorkflow> }) => {
      return apiClient.patch<WritingWorkflow>(`/workflows/${id}`, updates);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.workflows.detail(data.id), data);
      queryUtils.invalidateWorkflows(queryClient);
    },
  });
};

// AI API hooks
export const useGenerateContent = () => {
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async (request: AIWritingRequest) => {
      return apiClient.post<AIWritingResponse>('/ai/generate', request, {
        timeout: 60000, // 1 minute timeout for AI generation
      });
    },
    onError: (error: any) => {
      toast.error('Failed to generate content', error.message);
    },
  });
};

export const useAISuggestions = (
  documentId: string,
  options?: Omit<UseQueryOptions<string[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.ai.suggestions(documentId),
    queryFn: async () => {
      return apiClient.get<string[]>(`/ai/suggestions/${documentId}`);
    },
    enabled: !!documentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// File upload hook
export const useUploadFile = () => {
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async ({ 
      file, 
      onProgress 
    }: { 
      file: File; 
      onProgress?: (progress: number) => void 
    }) => {
      return apiClient.upload<{ url: string; id: string }>('/files/upload', file, 
        onProgress ? { onProgress } : undefined
      );
    },
    onSuccess: () => {
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to upload file', error.message);
    },
  });
};

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
    },
    onSuccess: (data) => {
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
      }
      
      // Cache user data
      queryClient.setQueryData(queryKeys.user.profile(), data.user);
      
      // Prefetch user data
      queryUtils.prefetchUserData(queryClient);
      
      toast.success('Login successful');
    },
    onError: (error: any) => {
      toast.error('Login failed', error.message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const toast = useSimpleToast();

  return useMutation({
    mutationFn: async () => {
      return apiClient.post<void>('/auth/logout');
    },
    onSuccess: () => {
      // Clear token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      
      // Clear all caches
      queryUtils.clearAllCaches(queryClient);
      
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      toast.error('Logout failed', error.message);
    },
  });
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();

  return {
    updateDocument: (id: string, updates: Partial<Document>) => {
      queryUtils.updateDocumentCache(queryClient, id, (oldData) => ({
        ...oldData,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    },
    
    revertDocument: (id: string, originalData: Document) => {
      queryUtils.updateDocumentCache(queryClient, id, () => originalData);
    },
  };
};