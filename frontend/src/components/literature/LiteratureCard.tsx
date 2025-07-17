'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Literature, LiteratureStatus, LiteratureCardProps } from '@/types/literature';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const statusColors = {
  unread: 'bg-gray-100 text-gray-800 border-gray-200',
  reading: 'bg-blue-100 text-blue-800 border-blue-200',
  read: 'bg-green-100 text-green-800 border-green-200',
  reviewed: 'bg-purple-100 text-purple-800 border-purple-200',
  cited: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  archived: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deleted: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  unread: '未读',
  reading: '阅读中',
  read: '已读',
  reviewed: '已评审',
  cited: '已引用',
  archived: '已归档',
  deleted: '已删除',
};

const typeLabels = {
  article: '文章',
  book: '书籍',
  chapter: '章节',
  conference: '会议论文',
  thesis: '学位论文',
  dissertation: '博士论文',
  report: '报告',
  patent: '专利',
  webpage: '网页',
  dataset: '数据集',
  software: '软件',
  other: '其他',
};

const typeIcons = {
  article: '📄',
  book: '📚',
  chapter: '📖',
  conference: '🎓',
  thesis: '🎯',
  dissertation: '🏆',
  report: '📊',
  patent: '⚖️',
  webpage: '🌐',
  dataset: '📊',
  software: '💻',
  other: '📋',
};

export function LiteratureCard({
  literature,
  onEdit,
  onDelete,
  onStatusChange,
  onSelect,
  onCite,
  selected = false,
  showActions = true,
  compact = false,
  className,
}: LiteratureCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    onEdit?.(literature);
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsLoading(true);
      try {
        await onDelete(literature.id);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('删除文献失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStatusChange = (newStatus: LiteratureStatus) => {
    onStatusChange?.(literature.id, newStatus);
    setShowStatusMenu(false);
  };

  const handleCite = () => {
    onCite?.(literature);
  };

  const handleCardClick = () => {
    if (selected !== undefined) {
      onSelect?.(literature);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAuthors = (authors: typeof literature.authors) => {
    if (authors.length === 0) return '未知作者';
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name}, ${authors[1].name}`;
    return `${authors[0].name} 等 ${authors.length} 人`;
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('text')) return '📄';
    if (mimeType.includes('html')) return '🌐';
    return '📎';
  };

  const getReadingTime = () => {
    const readingTime = literature.metadata.readingTime;
    if (readingTime < 1) return '< 1 分钟';
    return `${Math.round(readingTime)} 分钟`;
  };

  if (compact) {
    return (
      <Card 
        className={cn(
          'group p-4 hover:shadow-md transition-all duration-200 cursor-pointer',
          selected && 'ring-2 ring-blue-500',
          className
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{typeIcons[literature.type]}</span>
              <h3 className="font-medium text-sm line-clamp-1">{literature.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatAuthors(literature.authors)}</span>
              {literature.publicationYear && (
                <>
                  <span>•</span>
                  <span>{literature.publicationYear}</span>
                </>
              )}
              {literature.journal && (
                <>
                  <span>•</span>
                  <span className="line-clamp-1">{literature.journal}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs', statusColors[literature.status])}
            >
              {statusLabels[literature.status]}
            </Badge>
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className={cn(
          'group hover:shadow-lg transition-all duration-200',
          selected && 'ring-2 ring-blue-500',
          selected !== undefined && 'cursor-pointer',
          className
        )}
        onClick={handleCardClick}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{typeIcons[literature.type]}</span>
                <Badge variant="outline" className="text-xs">
                  {typeLabels[literature.type]}
                </Badge>
                {literature.category && (
                  <Badge variant="outline" className="text-xs">
                    {literature.category.name}
                  </Badge>
                )}
              </div>
              
              <Link
                href={`/literature/${literature.id}`}
                className="block group-hover:text-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {literature.title}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusColors[literature.status])}
                >
                  {statusLabels[literature.status]}
                </Badge>
                {literature.doi && (
                  <a
                    href={`https://doi.org/${literature.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    DOI: {literature.doi}
                  </a>
                )}
                {literature.url && !literature.doi && (
                  <a
                    href={literature.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    查看原文
                  </a>
                )}
              </div>
            </div>
            
            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="编辑">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </Tooltip>
                
                <Tooltip content="引用">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCite();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </Button>
                </Tooltip>
                
                <Tooltip content="更改状态">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusMenu(true);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </Tooltip>
                
                <Tooltip content="删除">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Authors & Publication Info */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">作者:</span> {formatAuthors(literature.authors)}
            </div>
            {literature.journal && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">期刊:</span> {literature.journal}
                {literature.volume && ` ${literature.volume}`}
                {literature.issue && `(${literature.issue})`}
                {literature.pages && `, ${literature.pages}`}
              </div>
            )}
            {literature.publicationYear && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">发表年份:</span> {literature.publicationYear}
              </div>
            )}
          </div>

          {/* Abstract */}
          {literature.abstract && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {truncateText(literature.abstract)}
              </p>
            </div>
          )}

          {/* Keywords */}
          {literature.keywords && literature.keywords.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {literature.keywords.slice(0, 5).map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs text-gray-500 bg-gray-50"
                  >
                    {keyword}
                  </Badge>
                ))}
                {literature.keywords.length > 5 && (
                  <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
                    +{literature.keywords.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {literature.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {literature.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs"
                    style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {literature.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{literature.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Files */}
          {literature.files.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {literature.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{getFileIcon(file.mimeType)}</span>
                    <span>{file.filename}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <span>{literature.metadata.wordCount.toLocaleString()} 字</span>
              <span>{getReadingTime()} 阅读</span>
              {literature.analytics.views.totalViews > 0 && (
                <span>{literature.analytics.views.totalViews} 次浏览</span>
              )}
              {literature.analytics.citations.totalCitations > 0 && (
                <span>{literature.analytics.citations.totalCitations} 次引用</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {literature.isPublic && (
                <Tooltip content="公开">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              )}
              {literature.files.length > 0 && (
                <Tooltip content="包含文件">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              )}
              {literature.notes && (
                <Tooltip content="包含笔记">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-3a1.5 1.5 0 00-1.5-1.5H4V5z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
            <span>创建于 {formatDate(literature.createdAt)}</span>
            <span>更新于 {formatDate(literature.updatedAt)}</span>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除文献"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            确定要删除文献 <strong>"{literature.title}"</strong> 吗？此操作无法撤销。
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              colorScheme="error"
              onClick={handleDelete}
              loading={isLoading}
            >
              删除
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Menu Modal */}
      <Modal
        open={showStatusMenu}
        onClose={() => setShowStatusMenu(false)}
        title="更改状态"
      >
        <div className="space-y-2">
          {Object.entries(statusLabels).map(([status, label]) => (
            <Button
              key={status}
              variant={literature.status === status ? "default" : "outline"}
              onClick={() => handleStatusChange(status as LiteratureStatus)}
              className={cn(
                'w-full justify-start',
                literature.status === status && statusColors[status as LiteratureStatus]
              )}
            >
              {label}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
}