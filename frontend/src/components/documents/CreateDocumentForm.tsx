'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Document, DocumentStatus, ContentType, DocumentVisibility } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CreateDocumentFormProps {
  onSubmit: (data: CreateDocumentData) => Promise<Document>;
  onCancel?: () => void;
  initialData?: Partial<CreateDocumentData>;
  className?: string;
}

interface CreateDocumentData {
  title: string;
  content: string;
  summary?: string;
  contentType: ContentType;
  visibility: DocumentVisibility;
  tags: string[];
  status: DocumentStatus;
  templateId?: string;
  categoryId?: string;
}

const contentTypeOptions = [
  { value: 'article', label: '文章', icon: '📝', description: '一般性的文章内容' },
  { value: 'blog_post', label: '博客', icon: '📰', description: '个人博客文章' },
  { value: 'research_paper', label: '研究论文', icon: '🔬', description: '学术研究论文' },
  { value: 'report', label: '报告', icon: '📊', description: '工作报告或总结' },
  { value: 'proposal', label: '提案', icon: '📋', description: '项目提案或计划' },
  { value: 'academic', label: '学术', icon: '🎓', description: '学术相关内容' },
  { value: 'business', label: '商业', icon: '💼', description: '商业文档' },
  { value: 'marketing', label: '营销', icon: '📈', description: '营销相关内容' },
  { value: 'technical', label: '技术', icon: '⚙️', description: '技术文档' },
  { value: 'documentation', label: '文档', icon: '📚', description: '说明文档' },
  { value: 'other', label: '其他', icon: '📄', description: '其他类型' },
] as const;

const visibilityOptions = [
  { value: 'private', label: '私有', icon: '🔒', description: '只有您可以查看' },
  { value: 'shared', label: '共享', icon: '👥', description: '与指定用户共享' },
  { value: 'team', label: '团队', icon: '🏢', description: '团队成员可见' },
  { value: 'public', label: '公开', icon: '🌍', description: '所有人可见' },
  { value: 'unlisted', label: '未列出', icon: '🔗', description: '通过链接访问' },
] as const;

const statusOptions = [
  { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
  { value: 'writing', label: '写作中', color: 'bg-blue-100 text-blue-800' },
  { value: 'ready', label: '待发布', color: 'bg-green-100 text-green-800' },
] as const;

export function CreateDocumentForm({
  onSubmit,
  onCancel,
  initialData,
  className,
}: CreateDocumentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateDocumentData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    summary: initialData?.summary || '',
    contentType: initialData?.contentType || 'article',
    visibility: initialData?.visibility || 'private',
    tags: initialData?.tags || [],
    status: initialData?.status || 'draft',
    templateId: initialData?.templateId,
    categoryId: initialData?.categoryId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '文档标题不能为空';
    } else if (formData.title.length < 2) {
      newErrors.title = '文档标题至少需要2个字符';
    } else if (formData.title.length > 200) {
      newErrors.title = '文档标题不能超过200个字符';
    }

    if (!formData.content.trim()) {
      newErrors.content = '文档内容不能为空';
    } else if (formData.content.length < 10) {
      newErrors.content = '文档内容至少需要10个字符';
    }

    if (formData.summary && formData.summary.length > 500) {
      newErrors.summary = '文档摘要不能超过500个字符';
    }

    if (formData.tags.length > 10) {
      newErrors.tags = '标签数量不能超过10个';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const document = await onSubmit(formData);
      router.push(`/documents/${document.id}`);
    } catch (error) {
      console.error('创建文档失败:', error);
      setErrors({ submit: '创建文档失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理草稿保存
  const handleSaveDraft = async () => {
    const draftData = { ...formData, status: 'draft' as DocumentStatus };
    setFormData(draftData);
    
    setIsSubmitting(true);
    try {
      const document = await onSubmit(draftData);
      router.push(`/documents/${document.id}`);
    } catch (error) {
      console.error('保存草稿失败:', error);
      setErrors({ submit: '保存草稿失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理标签添加
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理标签输入键盘事件
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 自动调整文本域高度
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    setFormData(prev => ({ ...prev, content: textarea.value }));
  };

  // 字数统计
  const getWordCount = (text: string) => {
    return text.trim().length;
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <Card className="p-6">
        <div className="space-y-6">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              文档标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.title ? 'border-red-300' : 'border-gray-300'
              )}
              placeholder="输入文档标题..."
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/200 字符
            </p>
          </div>

          {/* 内容类型和可见性 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {contentTypeOptions.slice(0, 6).map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, contentType: option.value }))}
                    className={cn(
                      'p-3 border rounded-md text-left hover:bg-gray-50 transition-colors',
                      formData.contentType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {!showAdvanced && (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(true)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  查看更多类型
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                可见性
              </label>
              <div className="space-y-2">
                {visibilityOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, visibility: option.value }))}
                    className={cn(
                      'w-full p-3 border rounded-md text-left hover:bg-gray-50 transition-colors',
                      formData.visibility === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 更多内容类型 */}
          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                更多内容类型
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {contentTypeOptions.slice(6).map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, contentType: option.value }))}
                    className={cn(
                      'p-3 border rounded-md text-left hover:bg-gray-50 transition-colors',
                      formData.contentType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 摘要 */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              文档摘要
            </label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.summary ? 'border-red-300' : 'border-gray-300'
              )}
              placeholder="输入文档摘要..."
              rows={3}
              maxLength={500}
            />
            {errors.summary && (
              <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.summary?.length || 0}/500 字符
            </p>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-sm cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入标签，按回车添加..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim())}
              >
                添加
              </Button>
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.tags.length}/10 个标签
            </p>
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              文档内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="content"
              value={formData.content}
              onChange={handleContentChange}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
                errors.content ? 'border-red-300' : 'border-gray-300'
              )}
              placeholder="开始输入文档内容..."
              rows={12}
              style={{ minHeight: '300px' }}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {getWordCount(formData.content)} 字符
            </p>
          </div>

          {/* 状态选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文档状态
            </label>
            <div className="flex gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: option.value }))}
                  className={cn(
                    'px-4 py-2 border rounded-md text-sm font-medium transition-colors',
                    formData.status === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 错误信息 */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting || !formData.title.trim()}
          loading={isSubmitting}
        >
          保存草稿
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {formData.status === 'draft' ? '创建草稿' : '创建文档'}
        </Button>
      </div>
    </form>
  );
}