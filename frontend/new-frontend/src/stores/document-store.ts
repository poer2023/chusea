/**
 * Document Store - Document management state
 * Handles document CRUD, search, filtering, version history, and batch operations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';
import { Document, DocumentStatus, DocumentMetadata } from '@/types';

// Document state interface
export interface DocumentState {
  // Document data
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  
  // Search and filtering
  searchQuery: string;
  filteredDocuments: Document[];
  filters: DocumentFilters;
  sortBy: DocumentSortKey;
  sortOrder: 'asc' | 'desc';
  
  // Selection and batch operations
  selectedDocuments: string[];
  isSelectMode: boolean;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalCount: number;
  
  // Actions
  loadDocuments: (params?: LoadDocumentsParams) => Promise<void>;
  createDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<Document>;
  
  // Current document management
  setCurrentDocument: (document: Document | null) => void;
  saveCurrentDocument: () => Promise<void>;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<DocumentFilters>) => void;
  setSorting: (sortBy: DocumentSortKey, sortOrder?: 'asc' | 'desc') => void;
  clearFilters: () => void;
  
  // Selection
  selectDocument: (id: string) => void;
  deselectDocument: (id: string) => void;
  selectAllDocuments: () => void;
  clearSelection: () => void;
  toggleSelectMode: () => void;
  
  // Batch operations
  batchDelete: (ids: string[]) => Promise<void>;
  batchUpdateStatus: (ids: string[], status: DocumentStatus) => Promise<void>;
  batchAddTags: (ids: string[], tags: string[]) => Promise<void>;
  
  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  
  // Utils
  getDocumentById: (id: string) => Document | undefined;
  applyFilters: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface DocumentFilters {
  status?: DocumentStatus[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  wordCountRange?: {
    min: number;
    max: number;
  };
  category?: string[];
}

export type DocumentSortKey = 
  | 'title' 
  | 'createdAt' 
  | 'updatedAt' 
  | 'wordCount' 
  | 'status';

export interface LoadDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: DocumentFilters;
  sortBy?: DocumentSortKey;
  sortOrder?: 'asc' | 'desc';
}

// Initial state
const initialState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filteredDocuments: [],
  filters: {},
  sortBy: 'updatedAt' as DocumentSortKey,
  sortOrder: 'desc' as const,
  selectedDocuments: [],
  isSelectMode: false,
  currentPage: 1,
  itemsPerPage: 20,
  totalCount: 0,
};

// Create the document store
export const useDocumentStore = create<DocumentState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        loadDocuments: async (params?: LoadDocumentsParams) => {
          set({ isLoading: true, error: null });
          
          try {
            const queryParams = new URLSearchParams();
            
            // Build query parameters
            if (params?.page) queryParams.set('page', params.page.toString());
            if (params?.limit) queryParams.set('limit', params.limit.toString());
            if (params?.search) queryParams.set('search', params.search);
            if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
            if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);
            if (params?.filters) {
              queryParams.set('filters', JSON.stringify(params.filters));
            }

            const response = await fetch(`/api/documents?${queryParams}`);
            
            if (!response.ok) {
              throw new Error('Failed to load documents');
            }

            const data = await response.json();
            
            set({
              documents: data.documents,
              totalCount: data.totalCount,
              currentPage: params?.page || 1,
              isLoading: false,
            });

            // Apply filters to update filtered documents
            get().applyFilters();
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load documents',
            });
          }
        },

        createDocument: async (documentData) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch('/api/documents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(documentData),
            });

            if (!response.ok) {
              throw new Error('Failed to create document');
            }

            const newDocument = await response.json();
            
            set((state) => ({
              documents: [newDocument, ...state.documents],
              isLoading: false,
            }));

            get().applyFilters();
            return newDocument;
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create document',
            });
            throw error;
          }
        },

        updateDocument: async (id: string, updates: Partial<Document>) => {
          try {
            const response = await fetch(`/api/documents/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update document');
            }

            const updatedDocument = await response.json();
            
            set((state) => ({
              documents: state.documents.map((doc) =>
                doc.id === id ? updatedDocument : doc
              ),
              currentDocument: state.currentDocument?.id === id ? updatedDocument : state.currentDocument,
            }));

            get().applyFilters();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update document',
            });
            throw error;
          }
        },

        deleteDocument: async (id: string) => {
          try {
            const response = await fetch(`/api/documents/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete document');
            }

            set((state) => ({
              documents: state.documents.filter((doc) => doc.id !== id),
              currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
              selectedDocuments: state.selectedDocuments.filter((docId) => docId !== id),
            }));

            get().applyFilters();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete document',
            });
            throw error;
          }
        },

        duplicateDocument: async (id: string) => {
          const document = get().getDocumentById(id);
          if (!document) {
            throw new Error('Document not found');
          }

          const duplicateData = {
            ...document,
            title: `${document.title} (Copy)`,
            status: 'draft' as DocumentStatus,
          };

          // Remove fields that should not be duplicated
          delete duplicateData.id;
          delete duplicateData.createdAt;
          delete duplicateData.updatedAt;

          return get().createDocument(duplicateData);
        },

        setCurrentDocument: (document: Document | null) => {
          set({ currentDocument: document });
        },

        saveCurrentDocument: async () => {
          const { currentDocument } = get();
          if (!currentDocument) {
            throw new Error('No current document to save');
          }

          await get().updateDocument(currentDocument.id, currentDocument);
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
          get().applyFilters();
        },

        setFilters: (newFilters: Partial<DocumentFilters>) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          }));
          get().applyFilters();
        },

        setSorting: (sortBy: DocumentSortKey, sortOrder?: 'asc' | 'desc') => {
          set({
            sortBy,
            sortOrder: sortOrder || (get().sortBy === sortBy && get().sortOrder === 'asc' ? 'desc' : 'asc'),
          });
          get().applyFilters();
        },

        clearFilters: () => {
          set({
            filters: {},
            searchQuery: '',
          });
          get().applyFilters();
        },

        selectDocument: (id: string) => {
          set((state) => ({
            selectedDocuments: [...state.selectedDocuments, id],
          }));
        },

        deselectDocument: (id: string) => {
          set((state) => ({
            selectedDocuments: state.selectedDocuments.filter((docId) => docId !== id),
          }));
        },

        selectAllDocuments: () => {
          const { filteredDocuments } = get();
          set({
            selectedDocuments: filteredDocuments.map((doc) => doc.id),
          });
        },

        clearSelection: () => {
          set({ selectedDocuments: [] });
        },

        toggleSelectMode: () => {
          set((state) => ({
            isSelectMode: !state.isSelectMode,
            selectedDocuments: !state.isSelectMode ? [] : state.selectedDocuments,
          }));
        },

        batchDelete: async (ids: string[]) => {
          try {
            const response = await fetch('/api/documents/batch/delete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
              throw new Error('Failed to delete documents');
            }

            set((state) => ({
              documents: state.documents.filter((doc) => !ids.includes(doc.id)),
              selectedDocuments: state.selectedDocuments.filter((id) => !ids.includes(id)),
            }));

            get().applyFilters();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete documents',
            });
            throw error;
          }
        },

        batchUpdateStatus: async (ids: string[], status: DocumentStatus) => {
          try {
            const response = await fetch('/api/documents/batch/status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids, status }),
            });

            if (!response.ok) {
              throw new Error('Failed to update document status');
            }

            set((state) => ({
              documents: state.documents.map((doc) =>
                ids.includes(doc.id) ? { ...doc, status } : doc
              ),
            }));

            get().applyFilters();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update document status',
            });
            throw error;
          }
        },

        batchAddTags: async (ids: string[], tags: string[]) => {
          try {
            const response = await fetch('/api/documents/batch/tags', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids, tags }),
            });

            if (!response.ok) {
              throw new Error('Failed to add tags');
            }

            set((state) => ({
              documents: state.documents.map((doc) =>
                ids.includes(doc.id) ? { 
                  ...doc, 
                  tags: [...new Set([...doc.tags, ...tags])] 
                } : doc
              ),
            }));

            get().applyFilters();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to add tags',
            });
            throw error;
          }
        },

        setPage: (page: number) => {
          set({ currentPage: page });
        },

        setItemsPerPage: (count: number) => {
          set({ itemsPerPage: count, currentPage: 1 });
        },

        getDocumentById: (id: string) => {
          return get().documents.find((doc) => doc.id === id);
        },

        applyFilters: () => {
          const { documents, searchQuery, filters, sortBy, sortOrder } = get();
          
          let filtered = [...documents];

          // Apply search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((doc) =>
              doc.title.toLowerCase().includes(query) ||
              doc.content.toLowerCase().includes(query) ||
              doc.tags.some((tag) => tag.toLowerCase().includes(query))
            );
          }

          // Apply filters
          if (filters.status?.length) {
            filtered = filtered.filter((doc) => filters.status!.includes(doc.status));
          }

          if (filters.tags?.length) {
            filtered = filtered.filter((doc) =>
              filters.tags!.some((tag) => doc.tags.includes(tag))
            );
          }

          if (filters.dateRange) {
            filtered = filtered.filter((doc) => {
              const docDate = new Date(doc.createdAt);
              const start = new Date(filters.dateRange!.start);
              const end = new Date(filters.dateRange!.end);
              return docDate >= start && docDate <= end;
            });
          }

          if (filters.wordCountRange) {
            filtered = filtered.filter((doc) => {
              const wordCount = doc.metadata.wordCount;
              return wordCount >= filters.wordCountRange!.min && 
                     wordCount <= filters.wordCountRange!.max;
            });
          }

          if (filters.category?.length) {
            filtered = filtered.filter((doc) =>
              filters.category!.includes(doc.metadata.category || '')
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortBy) {
              case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
              case 'createdAt':
                aValue = new Date(a.createdAt);
                bValue = new Date(b.createdAt);
                break;
              case 'updatedAt':
                aValue = new Date(a.updatedAt);
                bValue = new Date(b.updatedAt);
                break;
              case 'wordCount':
                aValue = a.metadata.wordCount;
                bValue = b.metadata.wordCount;
                break;
              case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
              default:
                return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });

          set({ filteredDocuments: filtered });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'document-store',
        partialize: (state) => ({
          searchQuery: state.searchQuery,
          filters: state.filters,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          itemsPerPage: state.itemsPerPage,
        }),
      }
    ),
    {
      name: 'document-store',
    }
  )
);

// Selectors for common use cases
export const useDocuments = () => useDocumentStore((state) => ({
  documents: state.filteredDocuments,
  isLoading: state.isLoading,
  error: state.error,
  totalCount: state.totalCount,
}));

export const useCurrentDocument = () => useDocumentStore((state) => ({
  currentDocument: state.currentDocument,
  setCurrentDocument: state.setCurrentDocument,
  saveCurrentDocument: state.saveCurrentDocument,
}));

export const useDocumentActions = () => useDocumentStore((state) => ({
  loadDocuments: state.loadDocuments,
  createDocument: state.createDocument,
  updateDocument: state.updateDocument,
  deleteDocument: state.deleteDocument,
  duplicateDocument: state.duplicateDocument,
}));

export const useDocumentFilters = () => useDocumentStore((state) => ({
  searchQuery: state.searchQuery,
  filters: state.filters,
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
  setSearchQuery: state.setSearchQuery,
  setFilters: state.setFilters,
  setSorting: state.setSorting,
  clearFilters: state.clearFilters,
}));

export const useDocumentSelection = () => useDocumentStore((state) => ({
  selectedDocuments: state.selectedDocuments,
  isSelectMode: state.isSelectMode,
  selectDocument: state.selectDocument,
  deselectDocument: state.deselectDocument,
  selectAllDocuments: state.selectAllDocuments,
  clearSelection: state.clearSelection,
  toggleSelectMode: state.toggleSelectMode,
}));