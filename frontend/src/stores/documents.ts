/**
 * 文档状态管理 - Documents Store
 * 管理文档列表、当前编辑文档、文档操作状态等
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';

// 文档类型定义
export interface Document {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: 'academic' | 'article' | 'report' | 'thesis' | 'note' | 'draft';
  status: 'draft' | 'writing' | 'reviewing' | 'published' | 'archived';
  visibility: 'private' | 'shared' | 'public';
  
  // 元数据
  metadata: {
    wordCount: number;
    characterCount: number;
    readingTime: number; // 分钟
    language: string;
    keywords: string[];
    references: string[];
    citations: number;
  };
  
  // 协作信息
  collaboration: {
    isCollaborative: boolean;
    collaborators: string[]; // 用户ID数组
    permissions: Record<string, 'read' | 'write' | 'admin'>;
    comments: Comment[];
    changes: Change[];
  };
  
  // 版本控制
  version: {
    current: number;
    history: DocumentVersion[];
    lastSaved: string;
    autoSave: boolean;
  };
  
  // 文档设置
  settings: {
    template: string;
    theme: string;
    fontSize: number;
    fontFamily: string;
    lineSpacing: number;
    pageSize: 'A4' | 'letter' | 'custom';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // 文件夹和标签
  folderId?: string;
  tags: string[];
  
  // 用户信息
  authorId: string;
  lastEditedBy: string;
}

// 文档版本
export interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  summary: string;
  createdAt: string;
  authorId: string;
  isBackup: boolean;
}

// 评论
export interface Comment {
  id: string;
  documentId: string;
  authorId: string;
  content: string;
  position: {
    start: number;
    end: number;
  };
  thread: CommentReply[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// 评论回复
export interface CommentReply {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

// 更改记录
export interface Change {
  id: string;
  documentId: string;
  authorId: string;
  type: 'insert' | 'delete' | 'format' | 'move';
  position: {
    start: number;
    end: number;
  };
  content: string;
  timestamp: string;
}

// 文档文件夹
export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

// 文档过滤器
export interface DocumentFilters {
  search?: string;
  type?: Document['type'][];
  status?: Document['status'][];
  visibility?: Document['visibility'][];
  author?: string[];
  tags?: string[];
  folderId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'title' | 'updatedAt' | 'createdAt' | 'wordCount';
  sortOrder?: 'asc' | 'desc';
}

// 文档操作参数
export interface LoadDocumentsParams {
  page?: number;
  pageSize?: number;
  filters?: DocumentFilters;
}

// 文档状态接口
export interface DocumentState {
  // 文档列表
  documents: Document[];
  folders: DocumentFolder[];
  currentDocument: Document | null;
  
  // 编辑状态
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime: string | null;
  
  // 加载状态
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // 搜索和过滤
  searchQuery: string;
  filters: DocumentFilters;
  
  // 分页
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  
  // 选择和批量操作
  selectedDocuments: string[];
  isSelectMode: boolean;
  bulkOperation: {
    type: 'delete' | 'move' | 'archive' | 'publish' | null;
    isProcessing: boolean;
    progress: number;
  };
  
  // 协作
  collaborators: Record<string, any>; // 在线协作者
  isCollaborating: boolean;
  
  // 操作方法
  loadDocuments: (params?: LoadDocumentsParams) => Promise<void>;
  loadDocument: (id: string) => Promise<void>;
  createDocument: (data: Partial<Document>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<Document>;
  archiveDocument: (id: string) => Promise<void>;
  publishDocument: (id: string) => Promise<void>;
  
  // 文件夹操作
  createFolder: (data: Partial<DocumentFolder>) => Promise<DocumentFolder>;
  updateFolder: (id: string, updates: Partial<DocumentFolder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveDocument: (documentId: string, folderId: string) => Promise<void>;
  
  // 内容操作
  saveDocument: (id: string, content: string) => Promise<void>;
  autoSave: (id: string, content: string) => Promise<void>;
  exportDocument: (id: string, format: 'pdf' | 'docx' | 'html' | 'markdown') => Promise<void>;
  
  // 版本控制
  saveVersion: (id: string, summary: string) => Promise<void>;
  restoreVersion: (documentId: string, versionId: string) => Promise<void>;
  getVersionHistory: (id: string) => Promise<DocumentVersion[]>;
  
  // 协作功能
  addCollaborator: (documentId: string, userId: string, permission: 'read' | 'write' | 'admin') => Promise<void>;
  removeCollaborator: (documentId: string, userId: string) => Promise<void>;
  updatePermission: (documentId: string, userId: string, permission: 'read' | 'write' | 'admin') => Promise<void>;
  
  // 评论功能
  addComment: (documentId: string, content: string, position: { start: number; end: number }) => Promise<void>;
  replyToComment: (commentId: string, content: string) => Promise<void>;
  resolveComment: (commentId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  // 搜索和过滤
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<DocumentFilters>) => void;
  clearFilters: () => void;
  
  // 选择和批量操作
  selectDocument: (id: string) => void;
  deselectDocument: (id: string) => void;
  selectAllDocuments: () => void;
  clearSelection: () => void;
  toggleSelectMode: () => void;
  bulkDeleteDocuments: (ids: string[]) => Promise<void>;
  bulkMoveDocuments: (ids: string[], folderId: string) => Promise<void>;
  bulkArchiveDocuments: (ids: string[]) => Promise<void>;
  
  // 状态管理
  setCurrentDocument: (document: Document | null) => void;
  setEditingMode: (isEditing: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 设置
  updateDocumentSettings: (id: string, settings: Partial<Document['settings']>) => Promise<void>;
  toggleAutoSave: () => void;
  
  // 统计
  getDocumentStats: () => {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalWords: number;
    recentActivity: number;
  };
}

// 初始状态
const initialState = {
  documents: [],
  folders: [],
  currentDocument: null,
  isEditing: false,
  hasUnsavedChanges: false,
  autoSaveEnabled: true,
  lastSaveTime: null,
  isLoading: false,
  isSaving: false,
  error: null,
  searchQuery: '',
  filters: {},
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,
  hasMore: true,
  selectedDocuments: [],
  isSelectMode: false,
  bulkOperation: {
    type: null,
    isProcessing: false,
    progress: 0,
  },
  collaborators: {},
  isCollaborating: false,
};

// 创建文档store
export const useDocumentsStore = create<DocumentState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 加载文档列表
        loadDocuments: async (params: LoadDocumentsParams = {}) => {
          set({ isLoading: true, error: null });
          
          try {
            const { page = 1, pageSize = 20, filters = {} } = params;
            
            const queryParams = new URLSearchParams({
              page: page.toString(),
              pageSize: pageSize.toString(),
              ...Object.entries(filters).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                  acc[key] = Array.isArray(value) ? value.join(',') : value.toString();
                }
                return acc;
              }, {} as Record<string, string>),
            });

            const response = await fetch(`/api/documents?${queryParams}`);
            
            if (!response.ok) {
              throw new Error('Failed to load documents');
            }

            const data = await response.json();
            
            set({
              documents: page === 1 ? data.documents : [...get().documents, ...data.documents],
              currentPage: page,
              totalCount: data.totalCount,
              hasMore: data.hasMore,
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load documents',
            });
          }
        },

        // 加载单个文档
        loadDocument: async (id: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${id}`);
            
            if (!response.ok) {
              throw new Error('Failed to load document');
            }

            const document = await response.json();
            
            set({
              currentDocument: document,
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load document',
            });
          }
        },

        // 创建文档
        createDocument: async (data: Partial<Document>) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch('/api/documents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              throw new Error('Failed to create document');
            }

            const document = await response.json();
            
            set({
              documents: [document, ...get().documents],
              currentDocument: document,
              isSaving: false,
            });
            
            return document;
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to create document',
            });
            throw error;
          }
        },

        // 更新文档
        updateDocument: async (id: string, updates: Partial<Document>) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update document');
            }

            const updatedDocument = await response.json();
            
            set({
              documents: get().documents.map(doc => 
                doc.id === id ? updatedDocument : doc
              ),
              currentDocument: get().currentDocument?.id === id ? updatedDocument : get().currentDocument,
              isSaving: false,
              hasUnsavedChanges: false,
              lastSaveTime: new Date().toISOString(),
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to update document',
            });
            throw error;
          }
        },

        // 删除文档
        deleteDocument: async (id: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete document');
            }

            set({
              documents: get().documents.filter(doc => doc.id !== id),
              currentDocument: get().currentDocument?.id === id ? null : get().currentDocument,
              selectedDocuments: get().selectedDocuments.filter(docId => docId !== id),
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete document',
            });
            throw error;
          }
        },

        // 复制文档
        duplicateDocument: async (id: string) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${id}/duplicate`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to duplicate document');
            }

            const duplicatedDocument = await response.json();
            
            set({
              documents: [duplicatedDocument, ...get().documents],
              isSaving: false,
            });
            
            return duplicatedDocument;
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to duplicate document',
            });
            throw error;
          }
        },

        // 归档文档
        archiveDocument: async (id: string) => {
          await get().updateDocument(id, { status: 'archived' });
        },

        // 发布文档
        publishDocument: async (id: string) => {
          await get().updateDocument(id, { status: 'published', publishedAt: new Date().toISOString() });
        },

        // 创建文件夹
        createFolder: async (data: Partial<DocumentFolder>) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch('/api/folders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              throw new Error('Failed to create folder');
            }

            const folder = await response.json();
            
            set({
              folders: [...get().folders, folder],
              isSaving: false,
            });
            
            return folder;
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to create folder',
            });
            throw error;
          }
        },

        // 更新文件夹
        updateFolder: async (id: string, updates: Partial<DocumentFolder>) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/folders/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update folder');
            }

            const updatedFolder = await response.json();
            
            set({
              folders: get().folders.map(folder => 
                folder.id === id ? updatedFolder : folder
              ),
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to update folder',
            });
            throw error;
          }
        },

        // 删除文件夹
        deleteFolder: async (id: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/folders/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete folder');
            }

            set({
              folders: get().folders.filter(folder => folder.id !== id),
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete folder',
            });
            throw error;
          }
        },

        // 移动文档到文件夹
        moveDocument: async (documentId: string, folderId: string) => {
          await get().updateDocument(documentId, { folderId });
        },

        // 保存文档
        saveDocument: async (id: string, content: string) => {
          await get().updateDocument(id, { content });
        },

        // 自动保存
        autoSave: async (id: string, content: string) => {
          if (!get().autoSaveEnabled) return;
          
          try {
            await get().updateDocument(id, { content });
          } catch (error) {
            // 自动保存失败时不显示错误，只记录日志
            console.warn('Auto save failed:', error);
          }
        },

        // 导出文档
        exportDocument: async (id: string, format: 'pdf' | 'docx' | 'html' | 'markdown') => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${id}/export/${format}`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to export document');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `document.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);
            
            set({ isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to export document',
            });
            throw error;
          }
        },

        // 保存版本
        saveVersion: async (id: string, summary: string) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${id}/versions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ summary }),
            });

            if (!response.ok) {
              throw new Error('Failed to save version');
            }

            set({ isSaving: false });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to save version',
            });
            throw error;
          }
        },

        // 恢复版本
        restoreVersion: async (documentId: string, versionId: string) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${documentId}/versions/${versionId}/restore`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to restore version');
            }

            const restoredDocument = await response.json();
            
            set({
              currentDocument: restoredDocument,
              documents: get().documents.map(doc => 
                doc.id === documentId ? restoredDocument : doc
              ),
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to restore version',
            });
            throw error;
          }
        },

        // 获取版本历史
        getVersionHistory: async (id: string) => {
          try {
            const response = await fetch(`/api/documents/${id}/versions`);
            
            if (!response.ok) {
              throw new Error('Failed to get version history');
            }

            return await response.json();
          } catch (error) {
            throw error;
          }
        },

        // 添加协作者
        addCollaborator: async (documentId: string, userId: string, permission: 'read' | 'write' | 'admin') => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${documentId}/collaborators`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId, permission }),
            });

            if (!response.ok) {
              throw new Error('Failed to add collaborator');
            }

            const updatedDocument = await response.json();
            
            set({
              currentDocument: updatedDocument,
              documents: get().documents.map(doc => 
                doc.id === documentId ? updatedDocument : doc
              ),
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to add collaborator',
            });
            throw error;
          }
        },

        // 移除协作者
        removeCollaborator: async (documentId: string, userId: string) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${documentId}/collaborators/${userId}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to remove collaborator');
            }

            const updatedDocument = await response.json();
            
            set({
              currentDocument: updatedDocument,
              documents: get().documents.map(doc => 
                doc.id === documentId ? updatedDocument : doc
              ),
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to remove collaborator',
            });
            throw error;
          }
        },

        // 更新权限
        updatePermission: async (documentId: string, userId: string, permission: 'read' | 'write' | 'admin') => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${documentId}/collaborators/${userId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ permission }),
            });

            if (!response.ok) {
              throw new Error('Failed to update permission');
            }

            const updatedDocument = await response.json();
            
            set({
              currentDocument: updatedDocument,
              documents: get().documents.map(doc => 
                doc.id === documentId ? updatedDocument : doc
              ),
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to update permission',
            });
            throw error;
          }
        },

        // 添加评论
        addComment: async (documentId: string, content: string, position: { start: number; end: number }) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/documents/${documentId}/comments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content, position }),
            });

            if (!response.ok) {
              throw new Error('Failed to add comment');
            }

            const updatedDocument = await response.json();
            
            set({
              currentDocument: updatedDocument,
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to add comment',
            });
            throw error;
          }
        },

        // 回复评论
        replyToComment: async (commentId: string, content: string) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/comments/${commentId}/replies`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content }),
            });

            if (!response.ok) {
              throw new Error('Failed to reply to comment');
            }

            const updatedDocument = await response.json();
            
            set({
              currentDocument: updatedDocument,
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to reply to comment',
            });
            throw error;
          }
        },

        // 解决评论
        resolveComment: async (commentId: string) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/comments/${commentId}/resolve`, {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Failed to resolve comment');
            }

            const updatedDocument = await response.json();
            
            set({
              currentDocument: updatedDocument,
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to resolve comment',
            });
            throw error;
          }
        },

        // 删除评论
        deleteComment: async (commentId: string) => {
          set({ isSaving: true, error: null });
          
          try {
            const response = await fetch(`/api/comments/${commentId}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete comment');
            }

            const updatedDocument = await response.json();
            
            set({
              currentDocument: updatedDocument,
              isSaving: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Failed to delete comment',
            });
            throw error;
          }
        },

        // 设置搜索查询
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        // 设置过滤器
        setFilters: (filters: Partial<DocumentFilters>) => {
          set({ filters: { ...get().filters, ...filters } });
        },

        // 清除过滤器
        clearFilters: () => {
          set({ filters: {}, searchQuery: '' });
        },

        // 选择文档
        selectDocument: (id: string) => {
          const { selectedDocuments } = get();
          if (!selectedDocuments.includes(id)) {
            set({ selectedDocuments: [...selectedDocuments, id] });
          }
        },

        // 取消选择文档
        deselectDocument: (id: string) => {
          set({ selectedDocuments: get().selectedDocuments.filter(docId => docId !== id) });
        },

        // 选择所有文档
        selectAllDocuments: () => {
          set({ selectedDocuments: get().documents.map(doc => doc.id) });
        },

        // 清除选择
        clearSelection: () => {
          set({ selectedDocuments: [] });
        },

        // 切换选择模式
        toggleSelectMode: () => {
          const { isSelectMode } = get();
          set({ 
            isSelectMode: !isSelectMode,
            selectedDocuments: isSelectMode ? [] : get().selectedDocuments,
          });
        },

        // 批量删除文档
        bulkDeleteDocuments: async (ids: string[]) => {
          set({ 
            bulkOperation: { type: 'delete', isProcessing: true, progress: 0 }
          });
          
          try {
            const response = await fetch('/api/documents/bulk-delete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
              throw new Error('Failed to delete documents');
            }

            set({
              documents: get().documents.filter(doc => !ids.includes(doc.id)),
              selectedDocuments: [],
              bulkOperation: { type: null, isProcessing: false, progress: 0 },
            });
          } catch (error) {
            set({
              bulkOperation: { type: null, isProcessing: false, progress: 0 },
              error: error instanceof Error ? error.message : 'Failed to delete documents',
            });
            throw error;
          }
        },

        // 批量移动文档
        bulkMoveDocuments: async (ids: string[], folderId: string) => {
          set({ 
            bulkOperation: { type: 'move', isProcessing: true, progress: 0 }
          });
          
          try {
            const response = await fetch('/api/documents/bulk-move', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids, folderId }),
            });

            if (!response.ok) {
              throw new Error('Failed to move documents');
            }

            set({
              documents: get().documents.map(doc => 
                ids.includes(doc.id) ? { ...doc, folderId } : doc
              ),
              selectedDocuments: [],
              bulkOperation: { type: null, isProcessing: false, progress: 0 },
            });
          } catch (error) {
            set({
              bulkOperation: { type: null, isProcessing: false, progress: 0 },
              error: error instanceof Error ? error.message : 'Failed to move documents',
            });
            throw error;
          }
        },

        // 批量归档文档
        bulkArchiveDocuments: async (ids: string[]) => {
          set({ 
            bulkOperation: { type: 'archive', isProcessing: true, progress: 0 }
          });
          
          try {
            const response = await fetch('/api/documents/bulk-archive', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
              throw new Error('Failed to archive documents');
            }

            set({
              documents: get().documents.map(doc => 
                ids.includes(doc.id) ? { ...doc, status: 'archived' } : doc
              ),
              selectedDocuments: [],
              bulkOperation: { type: null, isProcessing: false, progress: 0 },
            });
          } catch (error) {
            set({
              bulkOperation: { type: null, isProcessing: false, progress: 0 },
              error: error instanceof Error ? error.message : 'Failed to archive documents',
            });
            throw error;
          }
        },

        // 设置当前文档
        setCurrentDocument: (document: Document | null) => {
          set({ currentDocument: document });
        },

        // 设置编辑模式
        setEditingMode: (isEditing: boolean) => {
          set({ isEditing });
        },

        // 设置未保存更改
        setUnsavedChanges: (hasChanges: boolean) => {
          set({ hasUnsavedChanges: hasChanges });
        },

        // 设置错误
        setError: (error: string | null) => {
          set({ error });
        },

        // 清除错误
        clearError: () => {
          set({ error: null });
        },

        // 更新文档设置
        updateDocumentSettings: async (id: string, settings: Partial<Document['settings']>) => {
          const { currentDocument } = get();
          if (currentDocument && currentDocument.id === id) {
            const updatedSettings = { ...currentDocument.settings, ...settings };
            await get().updateDocument(id, { settings: updatedSettings });
          }
        },

        // 切换自动保存
        toggleAutoSave: () => {
          set({ autoSaveEnabled: !get().autoSaveEnabled });
        },

        // 获取文档统计
        getDocumentStats: () => {
          const { documents } = get();
          
          const stats = {
            total: documents.length,
            byType: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
            totalWords: 0,
            recentActivity: 0,
          };

          documents.forEach(doc => {
            // 按类型统计
            stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
            
            // 按状态统计
            stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
            
            // 统计总字数
            stats.totalWords += doc.metadata.wordCount;
            
            // 统计最近活动（24小时内）
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (new Date(doc.updatedAt) > oneDayAgo) {
              stats.recentActivity++;
            }
          });

          return stats;
        },
      }),
      {
        name: 'documents-store',
        partialize: (state) => ({
          searchQuery: state.searchQuery,
          filters: state.filters,
          autoSaveEnabled: state.autoSaveEnabled,
          selectedDocuments: state.selectedDocuments,
          isSelectMode: state.isSelectMode,
        }),
      }
    ),
    {
      name: 'documents-store',
    }
  )
);

// 选择器钩子
export const useDocuments = () => useDocumentsStore((state) => ({
  documents: state.documents,
  folders: state.folders,
  currentDocument: state.currentDocument,
  isLoading: state.isLoading,
  error: state.error,
  hasUnsavedChanges: state.hasUnsavedChanges,
  isEditing: state.isEditing,
}));

export const useDocumentActions = () => useDocumentsStore((state) => ({
  loadDocuments: state.loadDocuments,
  loadDocument: state.loadDocument,
  createDocument: state.createDocument,
  updateDocument: state.updateDocument,
  deleteDocument: state.deleteDocument,
  duplicateDocument: state.duplicateDocument,
  archiveDocument: state.archiveDocument,
  publishDocument: state.publishDocument,
  saveDocument: state.saveDocument,
  exportDocument: state.exportDocument,
}));

export const useDocumentFilters = () => useDocumentsStore((state) => ({
  searchQuery: state.searchQuery,
  filters: state.filters,
  setSearchQuery: state.setSearchQuery,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
}));

export const useDocumentSelection = () => useDocumentsStore((state) => ({
  selectedDocuments: state.selectedDocuments,
  isSelectMode: state.isSelectMode,
  bulkOperation: state.bulkOperation,
  selectDocument: state.selectDocument,
  deselectDocument: state.deselectDocument,
  selectAllDocuments: state.selectAllDocuments,
  clearSelection: state.clearSelection,
  toggleSelectMode: state.toggleSelectMode,
  bulkDeleteDocuments: state.bulkDeleteDocuments,
  bulkMoveDocuments: state.bulkMoveDocuments,
  bulkArchiveDocuments: state.bulkArchiveDocuments,
}));

export const useDocumentCollaboration = () => useDocumentsStore((state) => ({
  collaborators: state.collaborators,
  isCollaborating: state.isCollaborating,
  addCollaborator: state.addCollaborator,
  removeCollaborator: state.removeCollaborator,
  updatePermission: state.updatePermission,
  addComment: state.addComment,
  replyToComment: state.replyToComment,
  resolveComment: state.resolveComment,
  deleteComment: state.deleteComment,
}));

export const useDocumentFolders = () => useDocumentsStore((state) => ({
  folders: state.folders,
  createFolder: state.createFolder,
  updateFolder: state.updateFolder,
  deleteFolder: state.deleteFolder,
  moveDocument: state.moveDocument,
}));