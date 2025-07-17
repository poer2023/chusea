// Literature management hooks for API integration
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Literature, 
  LiteratureCategory, 
  LiteratureTag,
  LiteratureSearchRequest,
  LiteratureSearchResponse,
  CreateLiteratureRequest,
  UpdateLiteratureRequest,
  ExtractReferencesRequest,
  ExtractReferencesResponse,
  GenerateCitationRequest,
  GenerateCitationResponse,
  ImportLiteratureRequest,
  ImportLiteratureResponse,
  ExportLiteratureRequest,
  ExportLiteratureResponse,
  LiteratureStatus
} from '@/types/literature';
import { APIResponse } from '@/types/api';

// Mock API client - replace with actual implementation
const apiClient = {
  get: async <T>(url: string): Promise<APIResponse<T>> => {
    // Mock implementation
    return {
      success: true,
      data: [] as T,
      timestamp: new Date().toISOString(),
    };
  },
  post: async <T>(url: string, data: any): Promise<APIResponse<T>> => {
    // Mock implementation
    return {
      success: true,
      data: data as T,
      timestamp: new Date().toISOString(),
    };
  },
  put: async <T>(url: string, data: any): Promise<APIResponse<T>> => {
    // Mock implementation
    return {
      success: true,
      data: data as T,
      timestamp: new Date().toISOString(),
    };
  },
  delete: async (url: string): Promise<APIResponse<void>> => {
    // Mock implementation
    return {
      success: true,
      data: undefined,
      timestamp: new Date().toISOString(),
    };
  },
};

// Main literature hook
export function useLiterature() {
  const [literature, setLiterature] = useState<Literature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiterature = useCallback(async (params?: LiteratureSearchRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<Literature[]>('/api/literature');
      setLiterature(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch literature');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLiterature = useCallback(async (data: CreateLiteratureRequest): Promise<Literature> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<Literature>('/api/literature', data);
      setLiterature(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create literature');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLiterature = useCallback(async (id: string, data: UpdateLiteratureRequest): Promise<Literature> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.put<Literature>(`/api/literature/${id}`, data);
      setLiterature(prev => prev.map(item => item.id === id ? response.data : item));
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update literature');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLiterature = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.delete(`/api/literature/${id}`);
      setLiterature(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete literature');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: LiteratureStatus): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.put<Literature>(`/api/literature/${id}`, { status });
      setLiterature(prev => prev.map(item => item.id === id ? response.data : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update literature status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    literature,
    loading,
    error,
    fetchLiterature,
    createLiterature,
    updateLiterature,
    deleteLiterature,
    updateStatus,
    refetch: fetchLiterature,
  };
}

// Literature search hook
export function useLiteratureSearch() {
  const [results, setResults] = useState<LiteratureSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLiterature = useCallback(async (request: LiteratureSearchRequest): Promise<LiteratureSearchResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<LiteratureSearchResponse>('/api/literature/search', request);
      setResults(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchLiterature,
    clearResults,
  };
}

// Literature categories hook
export function useLiteratureCategories() {
  const [categories, setCategories] = useState<LiteratureCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<LiteratureCategory[]>('/api/literature/categories');
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: Omit<LiteratureCategory, 'id'>): Promise<LiteratureCategory> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<LiteratureCategory>('/api/literature/categories', data);
      setCategories(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<LiteratureCategory>): Promise<LiteratureCategory> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.put<LiteratureCategory>(`/api/literature/categories/${id}`, data);
      setCategories(prev => prev.map(item => item.id === id ? response.data : item));
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.delete(`/api/literature/categories/${id}`);
      setCategories(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

// Literature tags hook
export function useLiteratureTags() {
  const [tags, setTags] = useState<LiteratureTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<LiteratureTag[]>('/api/literature/tags');
      setTags(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (data: Omit<LiteratureTag, 'id'>): Promise<LiteratureTag> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<LiteratureTag>('/api/literature/tags', data);
      setTags(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTag = useCallback(async (id: string, data: Partial<LiteratureTag>): Promise<LiteratureTag> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.put<LiteratureTag>(`/api/literature/tags/${id}`, data);
      setTags(prev => prev.map(item => item.id === id ? response.data : item));
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTag = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.delete(`/api/literature/tags/${id}`);
      setTags(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  };
}

// Reference extraction hook
export function useReferenceExtraction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractReferences = useCallback(async (request: ExtractReferencesRequest): Promise<ExtractReferencesResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<ExtractReferencesResponse>('/api/literature/extract', request);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract references');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    extractReferences,
  };
}

// Citation generation hook
export function useCitationGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCitation = useCallback(async (request: GenerateCitationRequest): Promise<GenerateCitationResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<GenerateCitationResponse>('/api/literature/citation', request);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate citation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateCitation,
  };
}

// Literature import/export hook
export function useLiteratureImportExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importLiterature = useCallback(async (request: ImportLiteratureRequest): Promise<ImportLiteratureResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<ImportLiteratureResponse>('/api/literature/import', request);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import literature');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportLiterature = useCallback(async (request: ExportLiteratureRequest): Promise<ExportLiteratureResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<ExportLiteratureResponse>('/api/literature/export', request);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export literature');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    importLiterature,
    exportLiterature,
  };
}

// Individual literature item hook
export function useLiteratureItem(id: string) {
  const [literature, setLiterature] = useState<Literature | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiterature = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<Literature>(`/api/literature/${id}`);
      setLiterature(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch literature');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLiterature();
  }, [fetchLiterature]);

  return {
    literature,
    loading,
    error,
    refetch: fetchLiterature,
  };
}