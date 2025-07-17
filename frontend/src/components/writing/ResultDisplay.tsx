'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Download, 
  Clock, 
  Zap,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
  Edit,
  RefreshCw
} from 'lucide-react';

export interface WritingResult {
  id: string;
  content: string;
  mode: WritingMode;
  timestamp: Date;
  tokens?: number;
  duration?: number;
}

export interface WritingMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  parameters?: Record<string, any>;
}

export interface ResultDisplayProps {
  results: WritingResult[];
  onCopy: (content: string) => void;
  onDownload: (content: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: (result: WritingResult) => void;
  className?: string;
  maxHeight?: string;
}

export default function ResultDisplay({
  results,
  onCopy,
  onDownload,
  onDelete,
  onRegenerate,
  className = '',
  maxHeight = '600px',
}: ResultDisplayProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleCopy = useCallback((content: string, id: string) => {
    onCopy(content);
    setCopiedItems(prev => new Set(prev).add(id));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 2000);
  }, [onCopy]);

  const formatDuration = useCallback((duration?: number) => {
    if (!duration) return '';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  }, []);

  const getPreview = useCallback((content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }, []);

  if (results.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无生成结果</p>
          <p className="text-sm mt-1">开始写作以查看AI生成的内容</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">生成结果</h3>
        <Badge variant="outline">
          {results.length} 个结果
        </Badge>
      </div>

      <div className="space-y-3" style={{ maxHeight, overflowY: 'auto' }}>
        {results.map((result) => {
          const isExpanded = expandedItems.has(result.id);
          const isCopied = copiedItems.has(result.id);

          return (
            <Card key={result.id} className="p-4 bg-gray-50">
              {/* 头部信息 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{result.mode.icon}</span>
                  <Badge variant="secondary" size="sm">
                    {result.mode.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {result.tokens && (
                    <Badge variant="outline" size="sm">
                      <Zap className="h-3 w-3 mr-1" />
                      {result.tokens}
                    </Badge>
                  )}
                  {result.duration && (
                    <Badge variant="outline" size="sm">
                      {formatDuration(result.duration)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* 内容预览/展开 */}
              <div className="mb-3">
                <div className="bg-white rounded-md p-3 border">
                  <div className="prose prose-sm max-w-none">
                    {isExpanded ? (
                      <div dangerouslySetInnerHTML={{ __html: result.content }} />
                    ) : (
                      <p className="text-gray-700">
                        {getPreview(result.content.replace(/<[^>]*>/g, ''))}
                      </p>
                    )}
                  </div>
                </div>

                {result.content.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(result.id)}
                    className="mt-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        收起
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        展开
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.content, result.id)}
                    disabled={isCopied}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {isCopied ? '已复制' : '复制'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(result.content)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {onRegenerate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRegenerate(result)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(result.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}