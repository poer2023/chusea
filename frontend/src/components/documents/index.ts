/**
 * 文档管理组件导出索引
 */

export { DocumentCard } from './DocumentCard';
export { DocumentList } from './DocumentList';
export { DocumentSearch } from './DocumentSearch';
export { DocumentFilters, type DocumentFilters as DocumentFiltersType } from './DocumentFilters';
export { CreateDocumentForm } from './CreateDocumentForm';

// 导出组件所需的类型
// export type { DocumentListProps } from './DocumentList';
// export type { CreateDocumentFormProps } from './CreateDocumentForm';

// 工具函数
export const getDocumentTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    article: '📝',
    blog_post: '📰',
    research_paper: '🔬',
    report: '📊',
    proposal: '📋',
    academic: '🎓',
    business: '💼',
    marketing: '📈',
    technical: '⚙️',
    documentation: '📚',
    other: '📄',
  };
  return iconMap[type] || '📄';
};

export const getDocumentStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    writing: 'bg-blue-100 text-blue-800 border-blue-200',
    reviewing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    editing: 'bg-orange-100 text-orange-800 border-orange-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    published: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    archived: 'bg-gray-100 text-gray-600 border-gray-200',
    deleted: 'bg-red-100 text-red-800 border-red-200',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getDocumentStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    reviewing: '审核中',
    editing: '编辑中',
    ready: '待发布',
    published: '已发布',
    archived: '已归档',
    deleted: '已删除',
  };
  return labelMap[status] || status;
};

export const formatReadingTime = (minutes: number) => {
  if (minutes < 1) return '< 1 分钟阅读';
  return `${Math.round(minutes)} 分钟阅读`;
};

export const formatWordCount = (count: number) => {
  if (count < 1000) return `${count} 字`;
  if (count < 10000) return `${(count / 1000).toFixed(1)}k 字`;
  return `${(count / 10000).toFixed(1)}万 字`;
};

export const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};