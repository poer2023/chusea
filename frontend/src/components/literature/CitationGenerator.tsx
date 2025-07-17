'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Copy, 
  Download, 
  Edit,
  Check,
  FileText,
  Link,
  RefreshCw
} from 'lucide-react';

export interface Literature {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  type: 'article' | 'book' | 'thesis' | 'conference' | 'patent' | 'report';
  publisher?: string;
  isbn?: string;
  conference?: string;
  abstract?: string;
}

export interface CitationStyle {
  id: string;
  name: string;
  description: string;
  example: string;
}

export interface CitationGeneratorProps {
  literature: Literature[];
  onCopy?: (citation: string) => void;
  onDownload?: (citations: string[], format: string) => void;
  onEdit?: (literature: Literature) => void;
  className?: string;
}

const CITATION_STYLES: CitationStyle[] = [
  {
    id: 'apa',
    name: 'APA',
    description: 'American Psychological Association',
    example: 'Smith, J. (2023). Title of article. Journal Name, 10(2), 123-145.',
  },
  {
    id: 'mla',
    name: 'MLA',
    description: 'Modern Language Association',
    example: 'Smith, John. "Title of Article." Journal Name, vol. 10, no. 2, 2023, pp. 123-145.',
  },
  {
    id: 'chicago',
    name: 'Chicago',
    description: 'Chicago Manual of Style',
    example: 'Smith, John. "Title of Article." Journal Name 10, no. 2 (2023): 123-145.',
  },
  {
    id: 'harvard',
    name: 'Harvard',
    description: 'Harvard Reference System',
    example: 'Smith, J. (2023) Title of article. Journal Name, 10(2), pp. 123-145.',
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    description: 'Vancouver Reference Style',
    example: 'Smith J. Title of article. Journal Name. 2023;10(2):123-145.',
  },
  {
    id: 'ieee',
    name: 'IEEE',
    description: 'Institute of Electrical and Electronics Engineers',
    example: 'J. Smith, "Title of article," Journal Name, vol. 10, no. 2, pp. 123-145, 2023.',
  },
];

export default function CitationGenerator({
  literature,
  onCopy,
  onDownload,
  onEdit,
  className = '',
}: CitationGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>(CITATION_STYLES[0]);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const formatAuthor = useCallback((authors: string[], style: string) => {
    if (authors.length === 0) return '';
    
    switch (style) {
      case 'apa':
        if (authors.length === 1) return authors[0];
        if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
        return `${authors[0]} et al.`;
      
      case 'mla':
        if (authors.length === 1) return authors[0];
        return `${authors[0]} et al.`;
      
      case 'chicago':
        return authors.join(', ');
      
      case 'harvard':
        if (authors.length === 1) return authors[0];
        return `${authors[0]} et al.`;
      
      case 'vancouver':
        return authors.map(author => {
          const parts = author.split(' ');
          if (parts.length >= 2) {
            return `${parts[parts.length - 1]} ${parts.slice(0, -1).map(p => p.charAt(0)).join('')}`;
          }
          return author;
        }).join(', ');
      
      case 'ieee':
        return authors.map(author => {
          const parts = author.split(' ');
          if (parts.length >= 2) {
            return `${parts.slice(0, -1).map(p => p.charAt(0)).join('. ')}. ${parts[parts.length - 1]}`;
          }
          return author;
        }).join(', ');
      
      default:
        return authors.join(', ');
    }
  }, []);

  const generateCitation = useCallback((item: Literature, style: string) => {
    const authors = formatAuthor(item.authors, style);
    const year = item.year;
    const title = item.title;
    
    switch (style) {
      case 'apa':
        if (item.type === 'article') {
          return `${authors} (${year}). ${title}. ${item.journal}${item.volume ? `, ${item.volume}` : ''}${item.issue ? `(${item.issue})` : ''}${item.pages ? `, ${item.pages}` : ''}.${item.doi ? ` https://doi.org/${item.doi}` : ''}`;
        }
        if (item.type === 'book') {
          return `${authors} (${year}). ${title}. ${item.publisher}.`;
        }
        break;
      
      case 'mla':
        if (item.type === 'article') {
          return `${authors}. "${title}." ${item.journal}${item.volume ? `, vol. ${item.volume}` : ''}${item.issue ? `, no. ${item.issue}` : ''}, ${year}${item.pages ? `, pp. ${item.pages}` : ''}.`;
        }
        if (item.type === 'book') {
          return `${authors}. ${title}. ${item.publisher}, ${year}.`;
        }
        break;
      
      case 'chicago':
        if (item.type === 'article') {
          return `${authors}. "${title}." ${item.journal}${item.volume ? ` ${item.volume}` : ''}${item.issue ? `, no. ${item.issue}` : ''} (${year})${item.pages ? `: ${item.pages}` : ''}.`;
        }
        if (item.type === 'book') {
          return `${authors}. ${title}. ${item.publisher}, ${year}.`;
        }
        break;
      
      case 'harvard':
        if (item.type === 'article') {
          return `${authors} (${year}) ${title}. ${item.journal}${item.volume ? `, ${item.volume}` : ''}${item.issue ? `(${item.issue})` : ''}${item.pages ? `, pp. ${item.pages}` : ''}.`;
        }
        if (item.type === 'book') {
          return `${authors} (${year}) ${title}. ${item.publisher}.`;
        }
        break;
      
      case 'vancouver':
        if (item.type === 'article') {
          return `${authors}. ${title}. ${item.journal}. ${year}${item.volume ? `;${item.volume}` : ''}${item.issue ? `(${item.issue})` : ''}${item.pages ? `:${item.pages}` : ''}.`;
        }
        if (item.type === 'book') {
          return `${authors}. ${title}. ${item.publisher}; ${year}.`;
        }
        break;
      
      case 'ieee':
        if (item.type === 'article') {
          return `${authors}, "${title}," ${item.journal}${item.volume ? `, vol. ${item.volume}` : ''}${item.issue ? `, no. ${item.issue}` : ''}${item.pages ? `, pp. ${item.pages}` : ''}, ${year}.`;
        }
        if (item.type === 'book') {
          return `${authors}, ${title}. ${item.publisher}, ${year}.`;
        }
        break;
      
      default:
        return `${authors}. ${title}. ${year}.`;
    }
    
    return `${authors}. ${title}. ${year}.`;
  }, [formatAuthor]);

  const handleCopy = useCallback(async (citation: string, itemId: string) => {
    try {
      if (onCopy) {
        onCopy(citation);
      } else {
        await navigator.clipboard.writeText(citation);
      }
      
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy citation:', error);
    }
  }, [onCopy]);

  const handleDownloadAll = useCallback(() => {
    const citations = literature.map(item => 
      generateCitation(item, selectedStyle.id)
    );
    
    if (onDownload) {
      onDownload(citations, selectedStyle.id);
    } else {
      const content = citations.join('\n\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citations_${selectedStyle.id}_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [literature, selectedStyle, generateCitation, onDownload]);

  const handleGenerateAll = useCallback(async () => {
    setIsGenerating(true);
    // 模拟异步生成过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsGenerating(false);
  }, []);

  if (literature.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">暂无文献</p>
        <p className="text-sm text-gray-500 mt-1">添加文献后即可生成引用格式</p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">引用格式生成</h2>
            <Badge variant="outline">
              {literature.length} 篇文献
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateAll}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              重新生成
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDownloadAll}
            >
              <Download className="h-4 w-4 mr-1" />
              下载全部
            </Button>
          </div>
        </div>

        {/* 格式选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            引用格式
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CITATION_STYLES.map((style) => (
              <Button
                key={style.id}
                variant={selectedStyle.id === style.id ? "default" : "outline"}
                onClick={() => setSelectedStyle(style)}
                className="h-auto p-3 flex flex-col items-start gap-1"
              >
                <span className="font-medium">{style.name}</span>
                <span className="text-xs text-gray-500">{style.description}</span>
              </Button>
            ))}
          </div>
          
          {/* 格式示例 */}
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">示例格式:</p>
            <p className="text-sm font-mono mt-1">{selectedStyle.example}</p>
          </div>
        </div>

        {/* 引用列表 */}
        <div className="space-y-3">
          <h3 className="font-medium">生成的引用</h3>
          
          {literature.map((item) => {
            const citation = generateCitation(item, selectedStyle.id);
            const isCopied = copiedItems.has(item.id);
            
            return (
              <Card key={item.id} className="p-4 bg-gray-50">
                <div className="space-y-3">
                  {/* 文献信息 */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.authors.join(', ')} ({item.year})
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" size="sm">
                        {item.type}
                      </Badge>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 生成的引用 */}
                  <div className="bg-white rounded-md p-3 border">
                    <p className="text-sm font-mono">{citation}</p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(citation, item.id)}
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          复制
                        </>
                      )}
                    </Button>
                    
                    {item.doi && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://doi.org/${item.doi}`} target="_blank" rel="noopener noreferrer">
                          <Link className="h-3 w-3 mr-1" />
                          DOI
                        </a>
                      </Button>
                    )}
                    
                    {item.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          原文
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
}