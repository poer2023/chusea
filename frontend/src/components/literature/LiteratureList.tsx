'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Literature, 
  LiteratureSearchFilter, 
  LiteratureSortBy, 
  LiteratureSortOrder,
  LiteratureStatus,
  LiteratureType,
  LiteratureListProps
} from '@/types/literature';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { Modal } from '@/components/ui/modal';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { LiteratureCard } from './LiteratureCard';
import SearchBox from './SearchBox';

const sortOptions: Array<{ value: LiteratureSortBy; label: string }> = [
  { value: 'relevance', label: '相关性' },
  { value: 'title', label: '标题' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' },
  { value: 'publicationDate', label: '发布日期' },
  { value: 'publicationYear', label: '发布年份' },
  { value: 'authors', label: '作者' },
  { value: 'journal', label: '期刊' },
  { value: 'citations', label: '引用数' },
  { value: 'views', label: '浏览数' },
];

const statusOptions: Array<{ value: LiteratureStatus; label: string; color: string }> = [
  { value: 'unread', label: '未读', color: 'bg-gray-100 text-gray-800' },
  { value: 'reading', label: '阅读中', color: 'bg-blue-100 text-blue-800' },
  { value: 'read', label: '已读', color: 'bg-green-100 text-green-800' },
  { value: 'reviewed', label: '已评审', color: 'bg-purple-100 text-purple-800' },
  { value: 'cited', label: '已引用', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'archived', label: '已归档', color: 'bg-yellow-100 text-yellow-800' },
];

const typeOptions: Array<{ value: LiteratureType; label: string }> = [
  { value: 'article', label: '文章' },
  { value: 'book', label: '书籍' },
  { value: 'chapter', label: '章节' },
  { value: 'conference', label: '会议论文' },
  { value: 'thesis', label: '学位论文' },
  { value: 'dissertation', label: '博士论文' },
  { value: 'report', label: '报告' },
  { value: 'patent', label: '专利' },
  { value: 'webpage', label: '网页' },
  { value: 'dataset', label: '数据集' },
  { value: 'software', label: '软件' },
  { value: 'other', label: '其他' },
];

const viewModes = [
  { value: 'grid', label: '网格视图', icon: '⊞' },
  { value: 'list', label: '列表视图', icon: '☰' },
  { value: 'compact', label: '紧凑视图', icon: '≡' },
] as const;

type ViewMode = typeof viewModes[number]['value'];

export function LiteratureList({
  literature = [],
  loading = false,
  error,
  filters = {},
  onFiltersChange,
  onSort,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  pagination,
  onPageChange,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: LiteratureListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<LiteratureSortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<LiteratureSortOrder>('desc');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [localFilters, setLocalFilters] = useState<LiteratureSearchFilter>(filters);
  const [searchQuery, setSearchQuery] = useState(filters.query || '');
  const [selectedStatus, setSelectedStatus] = useState<LiteratureStatus[]>(filters.statuses || []);
  const [selectedTypes, setSelectedTypes] = useState<LiteratureType[]>(filters.types || []);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
    setSearchQuery(filters.query || '');
    setSelectedStatus(filters.statuses || []);
    setSelectedTypes(filters.types || []);
  }, [filters]);

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...localFilters, query };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle status filter change
  const handleStatusFilter = (status: LiteratureStatus) => {
    const newStatuses = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    
    setSelectedStatus(newStatuses);
    const newFilters = { ...localFilters, statuses: newStatuses.length > 0 ? newStatuses : undefined };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle type filter change
  const handleTypeFilter = (type: LiteratureType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newTypes);
    const newFilters = { ...localFilters, types: newTypes.length > 0 ? newTypes : undefined };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: LiteratureSortBy) => {
    const newSortOrder = newSortBy === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSort?.(newSortBy, newSortOrder);
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (status: LiteratureStatus) => {
    if (selectedIds.length === 0 || !onStatusChange) return;
    
    try {
      await Promise.all(selectedIds.map(id => onStatusChange(id, status)));
      onSelectionChange?.([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk status change failed:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || !onDelete) return;
    
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 个文献吗？此操作无法撤销。`)) {
      return;
    }
    
    try {
      await Promise.all(selectedIds.map(id => onDelete(id)));
      onSelectionChange?.([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: LiteratureSearchFilter = {};
    setLocalFilters(emptyFilters);
    setSearchQuery('');
    setSelectedStatus([]);
    setSelectedTypes([]);
    onFiltersChange?.(emptyFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      localFilters.query ||
      (localFilters.statuses && localFilters.statuses.length > 0) ||
      (localFilters.types && localFilters.types.length > 0) ||
      (localFilters.categories && localFilters.categories.length > 0) ||
      (localFilters.tags && localFilters.tags.length > 0) ||
      localFilters.yearRange ||
      localFilters.dateRange ||
      localFilters.hasFiles !== undefined ||
      localFilters.hasNotes !== undefined
    );
  }, [localFilters]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === literature.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(literature.map(item => item.id));
    }
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">加载失败</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="搜索文献标题、作者、关键词..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(true)}
            >
              高级搜索
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-1">
              {statusOptions.map(({ value, label, color }) => (
                <Badge
                  key={value}
                  variant={selectedStatus.includes(value) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer text-xs',
                    selectedStatus.includes(value) ? color : 'hover:bg-gray-100'
                  )}
                  onClick={() => handleStatusFilter(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-1">
              {typeOptions.slice(0, 6).map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={selectedTypes.includes(value) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs hover:bg-gray-100"
                  onClick={() => handleTypeFilter(value)}
                >
                  {label}
                </Badge>
              ))}
              {typeOptions.length > 6 && (
                <Dropdown
                  trigger={
                    <Badge variant="outline" className="cursor-pointer text-xs hover:bg-gray-100">
                      更多类型...
                    </Badge>
                  }
                  // items={typeOptions.slice(6).map(({ value, label }) => ({
                  //   label,
                  //   onClick: () => handleTypeFilter(value),
                  //   selected: selectedTypes.includes(value),
                  // }))}
                />
              )}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                清除筛选
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Results Count */}
          <span className="text-sm text-gray-600">
            {loading ? '加载中...' : `共 ${literature.length} 个文献`}
          </span>

          {/* Selection Info */}
          {selectable && selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600">
                已选择 {selectedIds.length} 个
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBulkActions(true)}
              >
                批量操作
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Select All */}
          {selectable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSelectAll}
              className="text-gray-600"
            >
              {selectedIds.length === literature.length ? '取消全选' : '全选'}
            </Button>
          )}

          {/* Sort Dropdown */}
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                排序: {sortOptions.find(opt => opt.value === sortBy)?.label}
                {sortOrder === 'desc' ? ' ↓' : ' ↑'}
              </Button>
            }
            // items={sortOptions.map(({ value, label }) => ({
            //   label,
            //   onClick: () => handleSortChange(value),
            //   selected: value === sortBy,
            // }))}
          />

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            {viewModes.map(({ value, label, icon }) => (
              <Button
                key={value}
                size="sm"
                variant={viewMode === value ? 'default' : 'ghost'}
                onClick={() => setViewMode(value)}
                className="px-3 py-1 text-xs border-0 rounded-none first:rounded-l-lg last:rounded-r-lg"
                title={label}
              >
                {icon}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Literature Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : literature.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {hasActiveFilters ? '没有找到匹配的文献' : '还没有文献'}
            </h3>
            <p className="text-sm text-gray-400">
              {hasActiveFilters ? '尝试调整搜索条件或筛选器' : '开始添加您的第一个文献吧'}
            </p>
          </div>
          {!hasActiveFilters && (
            <Button>添加文献</Button>
          )}
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
          viewMode === 'list' && 'space-y-4',
          viewMode === 'compact' && 'space-y-2'
        )}>
          {literature.map((item) => (
            <LiteratureCard
              key={item.id}
              literature={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onSelect={onSelect}
              selected={selectedIds.includes(item.id)}
              showActions={!selectable || selectedIds.length === 0}
              compact={viewMode === 'compact'}
              className={selectable ? 'cursor-pointer' : ''}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > pagination.pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            第 {pagination.page} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <Modal
          open={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          title="高级搜索"
          size="lg"
        >
          <SearchBox
            onSearch={(query) => {
              const newFilters = { ...localFilters, query: query.query, ...query.filters };
              setLocalFilters(newFilters);
              onFiltersChange?.(newFilters);
              setShowAdvancedSearch(false);
            }}
            onClear={() => {
              clearFilters();
              setShowAdvancedSearch(false);
            }}
            isLoading={loading}
            showAdvanced={true}
          />
        </Modal>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && selectedIds.length > 0 && (
        <Modal
          open={showBulkActions}
          onClose={() => setShowBulkActions(false)}
          title={`批量操作 (${selectedIds.length} 个文献)`}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">更改状态</h4>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(({ value, label, color }) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange(value)}
                    className={cn('justify-start', color)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                colorScheme="error"
                onClick={handleBulkDelete}
                className="w-full"
              >
                删除选中文献
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}