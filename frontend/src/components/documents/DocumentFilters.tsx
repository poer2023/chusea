'use client';

import React, { useState, useCallback } from 'react';
import { DocumentStatus, ContentType } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentFiltersProps {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  onReset: () => void;
  className?: string;
}

export interface DocumentFilters {
  status?: DocumentStatus[];
  contentType?: ContentType[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'wordCount' | 'views';
  sortOrder?: 'asc' | 'desc';
  visibility?: ('private' | 'shared' | 'team' | 'public' | 'unlisted')[];
  author?: string;
  hasAttachments?: boolean;
  minWordCount?: number;
  maxWordCount?: number;
}

const statusOptions = [
  { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
  { value: 'writing', label: '写作中', color: 'bg-blue-100 text-blue-800' },
  { value: 'reviewing', label: '审核中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'editing', label: '编辑中', color: 'bg-orange-100 text-orange-800' },
  { value: 'ready', label: '待发布', color: 'bg-green-100 text-green-800' },
  { value: 'published', label: '已发布', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'archived', label: '已归档', color: 'bg-gray-100 text-gray-600' },
] as const;

const contentTypeOptions = [
  { value: 'article', label: '文章' },
  { value: 'blog_post', label: '博客' },
  { value: 'research_paper', label: '研究论文' },
  { value: 'report', label: '报告' },
  { value: 'proposal', label: '提案' },
  { value: 'academic', label: '学术' },
  { value: 'business', label: '商业' },
  { value: 'marketing', label: '营销' },
  { value: 'technical', label: '技术' },
  { value: 'documentation', label: '文档' },
  { value: 'other', label: '其他' },
] as const;

const sortOptions = [
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' },
  { value: 'title', label: '标题' },
  { value: 'wordCount', label: '字数' },
  { value: 'views', label: '浏览量' },
] as const;

const visibilityOptions = [
  { value: 'private', label: '私有', icon: '🔒' },
  { value: 'shared', label: '共享', icon: '👥' },
  { value: 'team', label: '团队', icon: '🏢' },
  { value: 'public', label: '公开', icon: '🌍' },
  { value: 'unlisted', label: '未列出', icon: '🔗' },
] as const;

export function DocumentFilters({
  filters,
  onFiltersChange,
  onReset,
  className,
}: DocumentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFilters, setTempFilters] = useState<DocumentFilters>(filters);

  const updateFilters = useCallback((updates: Partial<DocumentFilters>) => {
    const newFilters = { ...filters, ...updates };
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = <T extends string>(
    key: keyof DocumentFilters,
    value: T
  ) => {
    const currentArray = (filters[key] as T[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray.length > 0 ? newArray : undefined });
  };

  const removeFilter = (key: keyof DocumentFilters, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const newArray = (filters[key] as string[]).filter(item => item !== value);
      updateFilters({ [key]: newArray.length > 0 ? newArray : undefined });
    } else {
      updateFilters({ [key]: undefined });
    }
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof DocumentFilters];
    return value !== undefined && value !== null && 
           !(Array.isArray(value) && value.length === 0);
  });

  const getActiveFiltersCount = () => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (value === undefined || value === null) return count;
      if (Array.isArray(value)) return count + value.length;
      if (typeof value === 'object' && value !== null) {
        return count + Object.values(value).filter(v => v !== undefined && v !== null).length;
      }
      return count + 1;
    }, 0);
  };

  return (
    <div className={cn('bg-white border rounded-lg p-4 space-y-4', className)}>
      {/* 快速筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">状态:</span>
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => toggleArrayFilter('status', option.value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              'border border-gray-200 hover:border-gray-300',
              filters.status?.includes(option.value as DocumentStatus)
                ? option.color
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 内容类型筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">类型:</span>
        {contentTypeOptions.slice(0, 6).map(option => (
          <button
            key={option.value}
            onClick={() => toggleArrayFilter('contentType', option.value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              'border border-gray-200 hover:border-gray-300',
              filters.contentType?.includes(option.value as ContentType)
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {option.label}
          </button>
        ))}
        {contentTypeOptions.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            {showAdvanced ? '收起' : '更多'}
          </Button>
        )}
      </div>

      {/* 高级筛选 */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t">
          {/* 更多内容类型 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">更多类型:</span>
            {contentTypeOptions.slice(6).map(option => (
              <button
                key={option.value}
                onClick={() => toggleArrayFilter('contentType', option.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  'border border-gray-200 hover:border-gray-300',
                  filters.contentType?.includes(option.value as ContentType)
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* 可见性筛选 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">可见性:</span>
            {visibilityOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toggleArrayFilter('visibility', option.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  'border border-gray-200 hover:border-gray-300 flex items-center gap-1',
                  filters.visibility?.includes(option.value as any)
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>

          {/* 日期范围 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, start: e.target.value || undefined }
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, end: e.target.value || undefined }
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                作者
              </label>
              <input
                type="text"
                value={filters.author || ''}
                onChange={(e) => updateFilters({ author: e.target.value || undefined })}
                placeholder="输入作者名称..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 字数范围 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最少字数
              </label>
              <input
                type="number"
                value={filters.minWordCount || ''}
                onChange={(e) => updateFilters({ 
                  minWordCount: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最多字数
              </label>
              <input
                type="number"
                value={filters.maxWordCount || ''}
                onChange={(e) => updateFilters({ 
                  maxWordCount: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="无限制"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 其他选项 */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasAttachments || false}
                onChange={(e) => updateFilters({ hasAttachments: e.target.checked || undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">包含附件</span>
            </label>
          </div>
        </div>
      )}

      {/* 排序选项 */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
        <span className="text-sm font-medium text-gray-700">排序:</span>
        <select
          value={filters.sortBy || 'updatedAt'}
          onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => updateFilters({ 
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          {filters.sortOrder === 'asc' ? '升序' : '降序'}
          <svg 
            className={cn('w-4 h-4 ml-1 inline-block transition-transform', 
              filters.sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 已选择的筛选条件 */}
      {hasActiveFilters && (
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              已选择的筛选条件 ({getActiveFiltersCount()})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-red-600 hover:text-red-700"
            >
              清除全部
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* 状态标签 */}
            {filters.status?.map(status => (
              <Badge
                key={status}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={() => removeFilter('status', status)}
              >
                {statusOptions.find(opt => opt.value === status)?.label}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            ))}

            {/* 内容类型标签 */}
            {filters.contentType?.map(type => (
              <Badge
                key={type}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={() => removeFilter('contentType', type)}
              >
                {contentTypeOptions.find(opt => opt.value === type)?.label}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            ))}

            {/* 可见性标签 */}
            {filters.visibility?.map(visibility => (
              <Badge
                key={visibility}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={() => removeFilter('visibility', visibility)}
              >
                {visibilityOptions.find(opt => opt.value === visibility)?.label}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            ))}

            {/* 其他筛选条件 */}
            {filters.author && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={() => removeFilter('author')}
              >
                作者: {filters.author}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            )}

            {filters.hasAttachments && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={() => removeFilter('hasAttachments')}
              >
                包含附件
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}