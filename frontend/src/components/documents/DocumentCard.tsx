'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Document, DocumentStatus } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  onDuplicate?: (document: Document) => void;
  onStatusChange?: (documentId: string, status: DocumentStatus) => void;
  className?: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  writing: 'bg-blue-100 text-blue-800 border-blue-200',
  reviewing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  editing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  published: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
  deleted: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  draft: '草稿',
  writing: '写作中',
  reviewing: '审核中',
  editing: '编辑中',
  ready: '待发布',
  published: '已发布',
  archived: '已归档',
  deleted: '已删除',
};

const contentTypeLabels = {
  article: '文章',
  blog_post: '博客',
  research_paper: '研究论文',
  report: '报告',
  proposal: '提案',
  email: '邮件',
  social_post: '社交媒体',
  press_release: '新闻稿',
  documentation: '文档',
  creative_writing: '创意写作',
  academic: '学术论文',
  business: '商业文档',
  marketing: '营销内容',
  technical: '技术文档',
  legal: '法律文档',
  other: '其他',
};

export function DocumentCard({
  document,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  className,
}: DocumentCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(document);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsLoading(true);
      try {
        await onDelete(document.id);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('删除文档失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(document);
    }
  };

  const handleStatusChange = (newStatus: DocumentStatus) => {
    if (onStatusChange) {
      onStatusChange(document.id, newStatus);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getReadingTime = () => {
    const readingTime = document.metadata.readingTime;
    if (readingTime < 1) return '< 1 分钟阅读';
    return `${Math.round(readingTime)} 分钟阅读`;
  };

  return (
    <>
      <Card className={cn('group hover:shadow-lg transition-all duration-200', className)}>
        <div className="p-6">
          {/* 文档头部信息 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <Link
                href={`/documents/${document.id}`}
                className="block group-hover:text-blue-600 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {document.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusColors[document.status])}
                >
                  {statusLabels[document.status]}
                </Badge>
                {document.metadata.contentType && (
                  <Badge variant="outline" className="text-xs">
                    {contentTypeLabels[document.metadata.contentType] || document.metadata.contentType}
                  </Badge>
                )}
                {document.category && (
                  <Badge variant="outline" className="text-xs">
                    {document.category.name}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* 操作菜单 */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDuplicate}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
                className="text-gray-500 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>

          {/* 文档描述 */}
          {document.summary && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {truncateText(document.summary)}
            </p>
          )}

          {/* 标签 */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {document.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs text-gray-500 bg-gray-50"
                >
                  {tag.name}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
                  +{document.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 统计信息 */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <span>{document.metadata.wordCount.toLocaleString()} 字</span>
              <span>{getReadingTime()}</span>
              {document.analytics.views.totalViews > 0 && (
                <span>{document.analytics.views.totalViews} 次浏览</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {document.collaboration.enabled && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              )}
              {document.files.length > 0 && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
            <span>创建于 {formatDate(document.createdAt)}</span>
            <span>更新于 {formatDate(document.updatedAt)}</span>
          </div>

          {/* 快速状态切换 */}
          {document.status === 'draft' && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('writing')}
                className="flex-1 text-xs"
              >
                开始写作
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('ready')}
                className="flex-1 text-xs"
              >
                标记完成
              </Button>
            </div>
          )}

          {document.status === 'ready' && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('published')}
                className="flex-1 text-xs"
              >
                发布
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 删除确认模态框 */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除文档"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            确定要删除文档 <strong>"{document.title}"</strong> 吗？此操作无法撤销。
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
    </>
  );
}