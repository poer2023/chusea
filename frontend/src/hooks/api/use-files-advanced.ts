// Advanced file operations hooks for ChUseA
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { call } from '../../lib/api/router';
import { apiClient } from '../../lib/api/client';
import { QUERY_KEYS, API_CONFIG } from '../../lib/constants';
import { useAdvancedPermissions } from './use-auth-advanced';
import type { UploadProgress } from '../../types';

// File upload status
export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Upload item interface
export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  result?: any;
  chunks?: number;
  uploadedChunks?: number;
  resumeToken?: string;
}

// ============================================================================
// CHUNKED UPLOAD HOOKS
// ============================================================================

/**
 * Hook for chunked file uploads with resume capability
 */
export function useChunkedUpload() {
  const [uploads, setUploads] = React.useState<UploadItem[]>([]);
  const queryClient = useQueryClient();
  const { checkPermission } = useAdvancedPermissions();
  
  // Initialize chunked upload
  const initializeUpload = useMutation({
    mutationFn: async ({
      file,
      documentId,
      purpose = 'document',
      chunkSize = 1024 * 1024 // 1MB default
    }: {
      file: File;
      documentId?: string;
      purpose?: 'document' | 'avatar' | 'attachment';
      chunkSize?: number;
    }) => {
      if (!checkPermission('files:upload')) {
        throw new Error('Insufficient permissions to upload files');
      }
      
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      return call('files.initializeChunkedUpload', {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        totalChunks,
        chunkSize,
        documentId,
        purpose,
      });
    }
  });
  
  // Upload chunk
  const uploadChunk = async (
    uploadId: string,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number
  ) => {
    // Create a File object from the chunk
    const chunkFile = new File([chunk], `chunk_${chunkIndex}`, { type: 'application/octet-stream' });
    
    return apiClient.upload('/files/upload-chunk', chunkFile, {
      additionalData: {
        uploadId,
        chunkIndex: chunkIndex.toString(),
        totalChunks: totalChunks.toString(),
      },
      validate: false,
    });
  };
  
  // Complete chunked upload
  const completeUpload = useMutation({
    mutationFn: async ({
      uploadId,
      filename
    }: {
      uploadId: string;
      filename?: string;
    }) => {
      return call('files.completeChunkedUpload', { uploadId, filename });
    }
  });
  
  // Start chunked upload process
  const startChunkedUpload = React.useCallback(async (
    file: File,
    options: {
      documentId?: string;
      purpose?: 'document' | 'avatar' | 'attachment';
      chunkSize?: number;
      onProgress?: (progress: UploadProgress) => void;
      onError?: (error: Error) => void;
    } = {}
  ) => {
    const {
      chunkSize = 1024 * 1024, // 1MB
      onProgress,
      onError,
    } = options;
    
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // Add to uploads list
    const uploadItem: UploadItem = {
      id: uploadId,
      file,
      status: 'pending',
      progress: 0,
      chunks: totalChunks,
      uploadedChunks: 0,
    };
    
    setUploads(prev => [...prev, uploadItem]);
    
    try {
      // Initialize upload
      const initResult = await initializeUpload.mutateAsync({
        file,
        ...options,
        chunkSize,
      });
      
      const serverUploadId = initResult.uploadId;
      
      // Update status
      setUploads(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'uploading' as UploadStatus, resumeToken: serverUploadId }
            : item
        )
      );
      
      // Upload chunks
      let uploadedBytes = 0;
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        try {
          await uploadChunk(serverUploadId, chunk, chunkIndex, totalChunks);
          
          uploadedBytes += chunk.size;
          const progress = Math.round((uploadedBytes / file.size) * 100);
          
          // Update progress
          setUploads(prev => 
            prev.map(item => 
              item.id === uploadId 
                ? { 
                    ...item, 
                    progress, 
                    uploadedChunks: chunkIndex + 1,
                    status: progress === 100 ? 'processing' : 'uploading'
                  }
                : item
            )
          );
          
          onProgress?.({
            loaded: uploadedBytes,
            total: file.size,
            percentage: progress,
          });
          
        } catch (error) {
          console.error(`Failed to upload chunk ${chunkIndex}:`, error);
          throw error;
        }
      }
      
      // Complete upload
      const result = await completeUpload.mutateAsync({
        uploadId: serverUploadId,
        filename: file.name,
      });
      
      // Update status to completed
      setUploads(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'completed', result }
            : item
        )
      );
      
      return result;
      
    } catch (error) {
      // Update status to failed
      setUploads(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'failed', error: error.message }
            : item
        )
      );
      
      onError?.(error);
      throw error;
    }
  }, [initializeUpload, completeUpload]);
  
  // Resume upload
  const resumeUpload = React.useCallback(async (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload || !upload.resumeToken) {
      throw new Error('Upload not found or cannot be resumed');
    }
    
    // Get upload status from server
    const status = await call('files.getUploadStatus', { 
      uploadId: upload.resumeToken 
    });
    
    // Continue from where we left off
    const { uploadedChunks = 0 } = status;
    const remainingChunks = upload.chunks! - uploadedChunks;
    
    if (remainingChunks === 0) {
      // Already completed, just finalize
      const result = await completeUpload.mutateAsync({
        uploadId: upload.resumeToken,
        filename: upload.file.name,
      });
      
      setUploads(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'completed', result }
            : item
        )
      );
      
      return result;
    }
    
    // Continue upload from uploadedChunks
    const chunkSize = Math.ceil(upload.file.size / upload.chunks!);
    let uploadedBytes = uploadedChunks * chunkSize;
    
    setUploads(prev => 
      prev.map(item => 
        item.id === uploadId 
          ? { ...item, status: 'uploading', uploadedChunks }
          : item
      )
    );
    
    for (let chunkIndex = uploadedChunks; chunkIndex < upload.chunks!; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, upload.file.size);
      const chunk = upload.file.slice(start, end);
      
      try {
        await uploadChunk(upload.resumeToken, chunk, chunkIndex, upload.chunks!);
        
        uploadedBytes += chunk.size;
        const progress = Math.round((uploadedBytes / upload.file.size) * 100);
        
        setUploads(prev => 
          prev.map(item => 
            item.id === uploadId 
              ? { 
                  ...item, 
                  progress, 
                  uploadedChunks: chunkIndex + 1,
                  status: progress === 100 ? 'processing' : 'uploading'
                }
              : item
          )
        );
        
      } catch (error) {
        setUploads(prev => 
          prev.map(item => 
            item.id === uploadId 
              ? { ...item, status: 'failed', error: error.message }
              : item
          )
        );
        throw error;
      }
    }
    
    // Complete upload
    const result = await completeUpload.mutateAsync({
      uploadId: upload.resumeToken,
      filename: upload.file.name,
    });
    
    setUploads(prev => 
      prev.map(item => 
        item.id === uploadId 
          ? { ...item, status: 'completed', result }
          : item
      )
    );
    
    return result;
  }, [uploads, completeUpload]);
  
  // Cancel upload
  const cancelUpload = useMutation({
    mutationFn: async (uploadId: string) => {
      const upload = uploads.find(u => u.id === uploadId);
      if (upload?.resumeToken) {
        await call('files.cancelUpload', { uploadId: upload.resumeToken });
      }
      
      setUploads(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'cancelled' }
            : item
        )
      );
    }
  });
  
  // Remove upload from list
  const removeUpload = React.useCallback((uploadId: string) => {
    setUploads(prev => prev.filter(item => item.id !== uploadId));
  }, []);
  
  // Clear completed uploads
  const clearCompleted = React.useCallback(() => {
    setUploads(prev => prev.filter(item => 
      !['completed', 'failed', 'cancelled'].includes(item.status)
    ));
  }, []);
  
  return {
    uploads,
    startChunkedUpload,
    resumeUpload,
    cancelUpload: cancelUpload.mutateAsync,
    removeUpload,
    clearCompleted,
    isUploading: uploads.some(u => u.status === 'uploading'),
  };
}

// ============================================================================
// BATCH FILE OPERATIONS HOOKS
// ============================================================================

/**
 * Hook for batch file operations
 */
export function useBatchFileOperations() {
  const queryClient = useQueryClient();
  const { checkPermission } = useAdvancedPermissions();
  
  const batchUpload = useMutation({
    mutationFn: async ({
      files,
      documentId,
      purpose = 'document',
      onProgress
    }: {
      files: File[];
      documentId?: string;
      purpose?: 'document' | 'avatar' | 'attachment';
      onProgress?: (fileIndex: number, progress: UploadProgress) => void;
    }) => {
      if (!checkPermission('files:batch_upload')) {
        throw new Error('Insufficient permissions for batch upload');
      }
      
      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const result = await apiClient.upload('/files/upload', file, {
            additionalData: { documentId, purpose },
            onProgress: (progress) => onProgress?.(i, progress),
          });
          
          results.push({ file: file.name, result, status: 'success' });
        } catch (error) {
          results.push({ 
            file: file.name, 
            error: error.message, 
            status: 'error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
    }
  });
  
  const batchDelete = useMutation({
    mutationFn: async (fileIds: string[]) => {
      if (!checkPermission('files:batch_delete')) {
        throw new Error('Insufficient permissions for batch deletion');
      }
      
      return call('files.batchDelete', { fileIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
    }
  });
  
  const batchMove = useMutation({
    mutationFn: async ({
      fileIds,
      targetDocumentId,
      targetFolderId
    }: {
      fileIds: string[];
      targetDocumentId?: string;
      targetFolderId?: string;
    }) => {
      return call('files.batchMove', {
        fileIds,
        targetDocumentId,
        targetFolderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
    }
  });
  
  const batchCompress = useMutation({
    mutationFn: async ({
      fileIds,
      compressionLevel = 'medium',
      format = 'zip'
    }: {
      fileIds: string[];
      compressionLevel?: 'low' | 'medium' | 'high';
      format?: 'zip' | 'tar' | '7z';
    }) => {
      return call('files.batchCompress', {
        fileIds,
        compressionLevel,
        format,
      });
    }
  });
  
  const batchDownload = useMutation({
    mutationFn: async ({
      fileIds,
      format = 'zip'
    }: {
      fileIds: string[];
      format?: 'zip' | 'tar';
    }) => {
      const result = await call('files.prepareBatchDownload', {
        fileIds,
        format,
      });
      
      // Download the prepared archive
      const blob = await apiClient.download(
        `/files/download-batch/${result.downloadId}`
      );
      
      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return result;
    }
  });
  
  return {
    batchUpload,
    batchDelete,
    batchMove,
    batchCompress,
    batchDownload,
    isLoading: batchUpload.isPending || 
               batchDelete.isPending || 
               batchMove.isPending || 
               batchCompress.isPending || 
               batchDownload.isPending,
  };
}

// ============================================================================
// FILE PROCESSING HOOKS
// ============================================================================

/**
 * Hook for file processing and conversion
 */
export function useFileProcessing() {
  const processFile = useMutation({
    mutationFn: async ({
      fileId,
      operation,
      parameters
    }: {
      fileId: string;
      operation: 'convert' | 'compress' | 'extract' | 'merge' | 'split';
      parameters?: Record<string, any>;
    }) => {
      return call('files.processFile', {
        fileId,
        operation,
        parameters,
      });
    }
  });
  
  const convertFile = useMutation({
    mutationFn: async ({
      fileId,
      targetFormat,
      quality,
      options
    }: {
      fileId: string;
      targetFormat: string;
      quality?: 'low' | 'medium' | 'high';
      options?: Record<string, any>;
    }) => {
      return call('files.convertFile', {
        fileId,
        targetFormat,
        quality,
        options,
      });
    }
  });
  
  const extractText = useMutation({
    mutationFn: async ({
      fileId,
      includeMetadata = false
    }: {
      fileId: string;
      includeMetadata?: boolean;
    }) => {
      return call('files.extractText', {
        fileId,
        includeMetadata,
      });
    }
  });
  
  const generateThumbnail = useMutation({
    mutationFn: async ({
      fileId,
      size = 'medium',
      format = 'jpeg'
    }: {
      fileId: string;
      size?: 'small' | 'medium' | 'large';
      format?: 'jpeg' | 'png' | 'webp';
    }) => {
      return call('files.generateThumbnail', {
        fileId,
        size,
        format,
      });
    }
  });
  
  const analyzeFile = useMutation({
    mutationFn: async ({
      fileId,
      analysisType
    }: {
      fileId: string;
      analysisType: 'metadata' | 'content' | 'security' | 'quality';
    }) => {
      return call('files.analyzeFile', {
        fileId,
        analysisType,
      });
    }
  });
  
  return {
    processFile,
    convertFile,
    extractText,
    generateThumbnail,
    analyzeFile,
    isProcessing: processFile.isPending || 
                  convertFile.isPending || 
                  extractText.isPending || 
                  generateThumbnail.isPending || 
                  analyzeFile.isPending,
  };
}

// ============================================================================
// FILE SHARING HOOKS
// ============================================================================

/**
 * Hook for file sharing and permissions
 */
export function useFileSharing() {
  const queryClient = useQueryClient();
  
  const shareFile = useMutation({
    mutationFn: async ({
      fileId,
      shareWith,
      permissions = ['view'],
      expiresAt,
      message
    }: {
      fileId: string;
      shareWith: string[]; // User IDs or email addresses
      permissions?: ('view' | 'download' | 'edit')[];
      expiresAt?: string;
      message?: string;
    }) => {
      return call('files.shareFile', {
        fileId,
        shareWith,
        permissions,
        expiresAt,
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
    }
  });
  
  const createPublicLink = useMutation({
    mutationFn: async ({
      fileId,
      permissions = ['view'],
      expiresAt,
      password,
      downloadLimit
    }: {
      fileId: string;
      permissions?: ('view' | 'download')[];
      expiresAt?: string;
      password?: string;
      downloadLimit?: number;
    }) => {
      return call('files.createPublicLink', {
        fileId,
        permissions,
        expiresAt,
        password,
        downloadLimit,
      });
    }
  });
  
  const revokeShare = useMutation({
    mutationFn: async ({
      fileId,
      shareId
    }: {
      fileId: string;
      shareId: string;
    }) => {
      return call('files.revokeShare', { fileId, shareId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
    }
  });
  
  const getFileShares = useQuery({
    queryKey: [...QUERY_KEYS.FILES, 'shares'],
    queryFn: () => call('files.getFileShares'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const updateSharePermissions = useMutation({
    mutationFn: async ({
      shareId,
      permissions,
      expiresAt
    }: {
      shareId: string;
      permissions?: ('view' | 'download' | 'edit')[];
      expiresAt?: string;
    }) => {
      return call('files.updateSharePermissions', {
        shareId,
        permissions,
        expiresAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.FILES, 'shares'] });
    }
  });
  
  return {
    shareFile,
    createPublicLink,
    revokeShare,
    updateSharePermissions,
    fileShares: getFileShares.data || [],
    isLoading: shareFile.isPending || 
               createPublicLink.isPending || 
               revokeShare.isPending,
  };
}

// ============================================================================
// FILE STORAGE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for file storage and quota management
 */
export function useFileStorage() {
  const storageUsage = useQuery({
    queryKey: [...QUERY_KEYS.FILES, 'storage-usage'],
    queryFn: () => call('files.getStorageUsage'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const cleanupFiles = useMutation({
    mutationFn: async ({
      older_than_days,
      file_types,
      min_size_mb,
      dry_run = true
    }: {
      older_than_days?: number;
      file_types?: string[];
      min_size_mb?: number;
      dry_run?: boolean;
    }) => {
      return call('files.cleanupFiles', {
        older_than_days,
        file_types,
        min_size_mb,
        dry_run,
      });
    }
  });
  
  const optimizeStorage = useMutation({
    mutationFn: async ({
      compress_images = true,
      remove_duplicates = true,
      archive_old_files = false
    }: {
      compress_images?: boolean;
      remove_duplicates?: boolean;
      archive_old_files?: boolean;
    } = {}) => {
      return call('files.optimizeStorage', {
        compress_images,
        remove_duplicates,
        archive_old_files,
      });
    }
  });
  
  const getDuplicateFiles = useQuery({
    queryKey: [...QUERY_KEYS.FILES, 'duplicates'],
    queryFn: () => call('files.findDuplicates'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const removeDuplicates = useMutation({
    mutationFn: async ({
      duplicate_groups,
      keep_policy = 'newest'
    }: {
      duplicate_groups: string[][];
      keep_policy?: 'newest' | 'oldest' | 'largest' | 'smallest';
    }) => {
      return call('files.removeDuplicates', {
        duplicate_groups,
        keep_policy,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.FILES, 'storage-usage'] 
      });
    }
  });
  
  return {
    storageUsage: storageUsage.data,
    duplicateFiles: getDuplicateFiles.data || [],
    cleanupFiles,
    optimizeStorage,
    removeDuplicates,
    isLoading: storageUsage.isLoading || 
               getDuplicateFiles.isLoading,
  };
}

const queryClient = useQueryClient();