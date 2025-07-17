'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DocumentSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showAdvanced?: boolean;
  onAdvancedSearch?: (filters: AdvancedSearchFilters) => void;
}

interface AdvancedSearchFilters {
  query: string;
  title?: string;
  content?: string;
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  author?: string;
  status?: string[];
  contentType?: string[];
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'tag' | 'title' | 'content';
  count?: number;
}

// 模拟搜索建议数据
const MOCK_SUGGESTIONS: SearchSuggestion[] = [
  { id: '1', text: 'AI写作', type: 'query', count: 15 },
  { id: '2', text: '产品设计', type: 'tag', count: 8 },
  { id: '3', text: '用户研究报告', type: 'title', count: 3 },
  { id: '4', text: '市场分析', type: 'query', count: 12 },
  { id: '5', text: '技术文档', type: 'tag', count: 20 },
  { id: '6', text: '项目总结', type: 'title', count: 5 },
];

export function DocumentSearch({
  value,
  onChange,
  onSearch,
  placeholder = '搜索文档...',
  disabled = false,
  className,
  showAdvanced = false,
  onAdvancedSearch,
}: DocumentSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({
    query: value,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 搜索建议的防抖处理
  const debouncedGetSuggestions = useCallback(
    debounce((query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // 模拟API调用获取搜索建议
      const filtered = MOCK_SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filtered);
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedGetSuggestions(value);
  }, [value, debouncedGetSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectSuggestion(suggestions[highlightedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    onSearch(suggestion.text);
  };

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
    }
  };

  const handleClearSearch = () => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleAdvancedSearch = () => {
    if (onAdvancedSearch) {
      onAdvancedSearch(advancedFilters);
      setShowAdvancedModal(false);
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'query':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'tag':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'title':
      case 'content':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'query': return '搜索';
      case 'tag': return '标签';
      case 'title': return '标题';
      case 'content': return '内容';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* 主搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // 延迟隐藏建议，允许点击建议项
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'transition-colors duration-200'
          )}
        />
        
        {/* 右侧操作按钮 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {value && (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={disabled}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {showAdvanced && (
            <button
              onClick={() => setShowAdvancedModal(true)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              disabled={disabled}
              title="高级搜索"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          )}
          
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={disabled || !value.trim()}
            className="px-3"
          >
            搜索
          </Button>
        </div>
      </div>

      {/* 搜索建议下拉框 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                'hover:bg-gray-50',
                highlightedIndex === index && 'bg-blue-50 text-blue-700'
              )}
            >
              <div className="flex-shrink-0 text-gray-400">
                {getSuggestionIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {suggestion.text}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {getSuggestionTypeLabel(suggestion.type)}
                  </span>
                </div>
                {suggestion.count && (
                  <div className="text-xs text-gray-500 mt-1">
                    {suggestion.count} 个结果
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 高级搜索模态框 */}
      {showAdvancedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">高级搜索</h3>
                <button
                  onClick={() => setShowAdvancedModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关键词搜索
                  </label>
                  <input
                    type="text"
                    value={advancedFilters.query}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入搜索关键词..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      标题包含
                    </label>
                    <input
                      type="text"
                      value={advancedFilters.title || ''}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="标题关键词..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      作者
                    </label>
                    <input
                      type="text"
                      value={advancedFilters.author || ''}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="作者姓名..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    创建时间范围
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={advancedFilters.dateRange?.start || ''}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={advancedFilters.dateRange?.end || ''}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedModal(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAdvancedSearch}
                    disabled={!advancedFilters.query.trim()}
                  >
                    搜索
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 防抖函数
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}