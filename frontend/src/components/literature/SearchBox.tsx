'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  X, 
  Filter, 
  Calendar, 
  Users, 
  BookOpen,
  RefreshCw,
  History,
  Settings
} from 'lucide-react';

export interface SearchFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: string[];
  value?: any;
}

export interface SearchQuery {
  query: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchBoxProps {
  onSearch: (query: SearchQuery) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  filters?: SearchFilter[];
  searchHistory?: string[];
  isLoading?: boolean;
  showAdvanced?: boolean;
}

export default function SearchBox({
  onSearch,
  onClear,
  placeholder = '搜索文献...',
  className = '',
  filters = [],
  searchHistory = [],
  isLoading = false,
  showAdvanced = true,
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const defaultFilters: SearchFilter[] = [
    {
      id: 'year',
      label: '年份',
      type: 'date',
    },
    {
      id: 'author',
      label: '作者',
      type: 'text',
    },
    {
      id: 'journal',
      label: '期刊',
      type: 'text',
    },
    {
      id: 'type',
      label: '类型',
      type: 'select',
      options: ['期刊文章', '会议论文', '学位论文', '专利', '报告', '图书'],
    },
    {
      id: 'language',
      label: '语言',
      type: 'select',
      options: ['中文', '英文', '日文', '其他'],
    },
  ];

  const allFilters = [...defaultFilters, ...filters];

  const handleSearch = useCallback((searchQuery?: string) => {
    const currentQuery = searchQuery || query;
    if (!currentQuery.trim() && Object.keys(activeFilters).length === 0) return;

    const searchParams: SearchQuery = {
      query: currentQuery.trim(),
      filters: activeFilters,
      sortBy,
      sortOrder,
    };

    onSearch(searchParams);
  }, [query, activeFilters, sortBy, sortOrder, onSearch]);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    // 实时搜索 (延迟500ms)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        handleSearch(value);
      }
    }, 500);
  }, [handleSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setActiveFilters({});
    setShowFilters(false);
    inputRef.current?.focus();
    onClear?.();
  }, [onClear]);

  const handleFilterChange = useCallback((filterId: string, value: any) => {
    setActiveFilters(prev => {
      if (value === undefined || value === '') {
        const { [filterId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [filterId]: value };
    });
  }, []);

  const handleHistorySelect = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    handleSearch(historyQuery);
  }, [handleSearch]);

  const activeFilterCount = Object.keys(activeFilters).length;
  const hasContent = query.trim() || activeFilterCount > 0;

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* 主搜索框 */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              onClick={() => handleSearch()}
              disabled={isLoading || !hasContent}
              className="shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* 搜索历史下拉 */}
          {showHistory && searchHistory.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 p-2 z-10 max-h-48 overflow-y-auto">
              <div className="space-y-1">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistorySelect(historyItem)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
                  >
                    <History className="h-3 w-3 text-gray-400" />
                    {historyItem}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* 工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showAdvanced && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                筛选
                {activeFilterCount > 0 && (
                  <Badge className="ml-2" size="sm">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            )}

            {searchHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4 mr-1" />
                历史
              </Button>
            )}

            {hasContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-1" />
                清空
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="relevance">相关性</option>
              <option value="date">日期</option>
              <option value="citations">引用数</option>
              <option value="title">标题</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* 高级筛选 */}
        {showFilters && (
          <Card className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allFilters.map((filter) => (
                <div key={filter.id}>
                  <label className="block text-sm font-medium mb-1">
                    {filter.label}
                  </label>
                  
                  {filter.type === 'text' && (
                    <Input
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      placeholder={`输入${filter.label}...`}
                      size="sm"
                    />
                  )}
                  
                  {filter.type === 'select' && (
                    <select
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      className="w-full text-sm border rounded px-2 py-1"
                    >
                      <option value="">全部</option>
                      {filter.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {filter.type === 'date' && (
                    <Input
                      type="date"
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      size="sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 活动筛选器显示 */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">当前筛选:</span>
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = allFilters.find(f => f.id === key);
              if (!filter || !value) return null;
              
              return (
                <Badge key={key} variant="secondary" className="gap-1">
                  {filter.label}: {value}
                  <button
                    onClick={() => handleFilterChange(key, undefined)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}