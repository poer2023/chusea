'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Document } from '@/types/document';
import { DocumentCard } from './DocumentCard';
import { DocumentSearch } from './DocumentSearch';
import { DocumentFilters, DocumentFilters as FilterType } from './DocumentFilters';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/animations/loading-spinner';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDocumentEdit?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  onDocumentDuplicate?: (document: Document) => void;
  onDocumentStatusChange?: (documentId: string, status: any) => void;
  className?: string;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const DEFAULT_PAGE_SIZE = 12;

export function DocumentList({
  documents,
  loading = false,
  error = null,
  onRefresh,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentDuplicate,
  onDocumentStatusChange,
  className,
  enableSearch = true,
  enableFilters = true,
  enablePagination = true,
  pageSize = DEFAULT_PAGE_SIZE,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterType>({
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 过滤和搜索逻辑
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.summary?.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    // 状态过滤
    if (filters.status?.length) {
      result = result.filter(doc => filters.status!.includes(doc.status));
    }

    // 内容类型过滤
    if (filters.contentType?.length) {
      result = result.filter(doc => 
        doc.metadata.contentType && filters.contentType!.includes(doc.metadata.contentType)
      );
    }

    // 可见性过滤
    if (filters.visibility?.length) {
      result = result.filter(doc => filters.visibility!.includes(doc.visibility));
    }

    // 作者过滤
    if (filters.author?.trim()) {
      const authorQuery = filters.author.toLowerCase();
      result = result.filter(doc => 
        doc.userId.toLowerCase().includes(authorQuery)
      );
    }

    // 字数过滤
    if (filters.minWordCount !== undefined) {
      result = result.filter(doc => doc.metadata.wordCount >= filters.minWordCount!);
    }
    if (filters.maxWordCount !== undefined) {
      result = result.filter(doc => doc.metadata.wordCount <= filters.maxWordCount!);
    }

    // 附件过滤
    if (filters.hasAttachments) {
      result = result.filter(doc => doc.files.length > 0);
    }

    // 日期范围过滤
    if (filters.dateRange?.start) {
      const startDate = new Date(filters.dateRange.start);
      result = result.filter(doc => new Date(doc.createdAt) >= startDate);
    }
    if (filters.dateRange?.end) {
      const endDate = new Date(filters.dateRange.end);
      result = result.filter(doc => new Date(doc.createdAt) <= endDate);
    }

    // 排序
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'wordCount':
            aValue = a.metadata.wordCount;
            bValue = b.metadata.wordCount;
            break;
          case 'views':
            aValue = a.analytics.views.totalViews;
            bValue = b.analytics.views.totalViews;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
          default:
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return result;
  }, [documents, searchQuery, filters]);

  // 分页逻辑
  const paginationInfo = useMemo((): PaginationInfo => {
    const totalCount = filteredDocuments.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [filteredDocuments.length, currentPage, pageSize]);

  const paginatedDocuments = useMemo(() => {
    if (!enablePagination) return filteredDocuments;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDocuments.slice(startIndex, endIndex);
  }, [filteredDocuments, currentPage, pageSize, enablePagination]);

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationInfo.totalPages)));
  };

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理高级搜索
  const handleAdvancedSearch = (advancedFilters: any) => {
    setSearchQuery(advancedFilters.query);
    setFilters(prev => ({
      ...prev,
      ...advancedFilters,
    }));
    setCurrentPage(1);
  };

  // 处理筛选变化
  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setCurrentPage(1); // 重置到第一页
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // 错误重试
  const handleRetry = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">加载失败</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Button onClick={handleRetry} variant="outline">
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 搜索栏 */}
      {enableSearch && (
        <DocumentSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onAdvancedSearch={handleAdvancedSearch}
          showAdvanced={true}
          placeholder="搜索文档标题、内容或标签..."
        />
      )}

      {/* 筛选器 */}
      {enableFilters && (
        <DocumentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      )}

      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {loading ? '加载中...' : (
              <>
                共 {paginationInfo.totalCount} 个文档
                {enablePagination && paginationInfo.totalPages > 1 && (
                  <span className="ml-1">
                    (第 {paginationInfo.currentPage} / {paginationInfo.totalPages} 页)
                  </span>
                )}
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="flex rounded-md overflow-hidden border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-1 text-sm transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1 text-sm transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* 刷新按钮 */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="px-3"
            >
              <svg
                className={cn('w-4 h-4', loading && 'animate-spin')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* 文档列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : paginatedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {documents.length === 0 ? '暂无文档' : '没有找到匹配的文档'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {documents.length === 0 
              ? '开始创建您的第一个文档' 
              : '尝试调整搜索条件或筛选器'
            }
          </p>
          {filteredDocuments.length !== documents.length && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleResetFilters}
              >
                清除筛选条件
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}
        >
          {paginatedDocuments.map(document => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={onDocumentEdit}
              onDelete={onDocumentDelete}
              onDuplicate={onDocumentDuplicate}
              onStatusChange={onDocumentStatusChange}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}

      {/* 分页控件 */}
      {enablePagination && paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-between py-6 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              显示 {Math.min((currentPage - 1) * pageSize + 1, paginationInfo.totalCount)} - {Math.min(currentPage * pageSize, paginationInfo.totalCount)} 项，
              共 {paginationInfo.totalCount} 项
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!paginationInfo.hasPrev}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              上一页
            </Button>
            
            {/* 页码 */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(
                  paginationInfo.totalPages - 4,
                  Math.max(1, currentPage - 2)
                )) + i;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!paginationInfo.hasNext}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}