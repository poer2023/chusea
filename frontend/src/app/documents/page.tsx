'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Search, Plus, MoreHorizontal } from 'lucide-react';

// 模拟文档数据
const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'AI写作助手的设计与实现',
    content: '本文档介绍了AI写作助手的设计思路和实现方案...',
    summary: '详细介绍了AI写作助手的核心功能和技术架构，包括自然语言处理、用户界面设计等方面。',
    slug: 'ai-writing-assistant',
    metadata: {
      wordCount: 3500,
      characterCount: 8750,
      paragraphCount: 15,
      sentenceCount: 42,
      readingTime: 14,
      readabilityScore: 85,
      language: 'zh-CN',
      seoKeywords: ['AI', '写作', '助手', '设计'],
      contentType: 'technical',
      targetAudience: '技术人员',
      difficultyLevel: 'advanced',
      purpose: 'instruct',
      format: 'markdown',
      encoding: 'utf-8',
      checksum: 'abc123',
      customFields: {},
    },
    status: 'published',
    visibility: 'public',
    tags: [
      { id: 't1', name: 'AI', slug: 'ai', color: '#3B82F6', description: '', category: 'tech', isSystem: false, usage: 20, createdAt: '2024-01-01T00:00:00Z', createdBy: 'user1' },
      { id: 't2', name: '技术', slug: 'tech', color: '#10B981', description: '', category: 'general', isSystem: false, usage: 15, createdAt: '2024-01-01T00:00:00Z', createdBy: 'user1' },
    ],
    category: {
      id: 'c1',
      name: '技术文档',
      slug: 'technical',
      description: '技术相关文档',
      color: '#6366F1',
      path: ['technical'],
      isDefault: false,
      sortOrder: 1,
    },
    version: {
      current: 3,
      history: [],
      autoSave: true,
    },
    collaboration: {
      enabled: true,
      mode: 'edit',
      permissions: {
        canEdit: true,
        canComment: true,
        canSuggest: true,
        canShare: true,
        canDelete: true,
        canManageCollaborators: true,
      },
      collaborators: [],
      invitations: [],
      comments: [],
      suggestions: [],
      realtime: {
        active: false,
        participants: [],
        cursors: [],
        selections: [],
        awareness: { users: {} },
      },
    },
    ai: {
      suggestions: [],
      analysis: {
        readabilityScore: 85,
        toneAnalysis: {
          overall: 'professional',
          confidence: 0.9,
          scores: { professional: 0.9, friendly: 0.1 },
        },
        sentimentAnalysis: {
          polarity: 0.3,
          subjectivity: 0.2,
          emotions: { joy: 0.1, fear: 0.05, anger: 0.02, sadness: 0.03, trust: 0.8 },
        },
        keywordDensity: { AI: 0.05, 写作: 0.03, 技术: 0.02 },
        topics: [
          { topic: 'AI技术', relevance: 0.9 },
          { topic: '写作工具', relevance: 0.8 },
        ],
        lastAnalyzedAt: '2024-01-15T10:00:00Z',
      },
      generation: {
        requests: [],
        totalTokensUsed: 0,
        monthlyUsage: 0,
      },
      optimization: {
        history: [],
        settings: {
          autoOptimize: false,
          optimizationTypes: [],
        },
      },
    },
    files: [],
    analytics: {
      views: {
        totalViews: 245,
        uniqueViews: 189,
        viewsToday: 12,
        viewsThisWeek: 67,
        viewsThisMonth: 245,
        viewHistory: [],
        referrers: {},
        devices: {},
        locations: {},
      },
      engagement: {
        averageTimeSpent: 4.5,
        bounceRate: 0.3,
        scrollDepth: 0.8,
        interactionRate: 0.15,
        socialShares: {},
        comments: 3,
        reactions: {},
      },
      performance: {
        loadTime: 1.2,
        searchRanking: {},
        conversionRate: 0.05,
        clickThroughRate: 0.12,
      },
      seo: {
        searchVisibility: 75,
        keywordRankings: {},
        backlinks: 5,
        organicTraffic: 120,
        searchImpressions: 1500,
        averagePosition: 3.2,
      },
    },
    settings: {
      editor: {
        theme: 'light',
        fontSize: 14,
        fontFamily: 'Inter',
        lineHeight: 1.5,
        showWordCount: true,
        showReadingTime: true,
        spellCheck: true,
        grammarCheck: true,
        autoCorrect: false,
        distraction_free: false,
        typewriterMode: false,
        focusMode: false,
      },
      export: {
        format: 'pdf',
        includeMetadata: true,
        includeComments: false,
        includeImages: true,
        paperSize: 'a4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
      },
      sharing: {
        allowComments: true,
        allowSuggestions: true,
        requireAuth: false,
        passwordProtected: false,
        trackViews: true,
        allowDownload: true,
      },
      notifications: {
        onComment: true,
        onSuggestion: true,
        onShare: true,
        onEdit: false,
        onPublish: true,
        frequency: 'immediate',
      },
    },
    audit: {
      events: [],
      retention: 90,
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    publishedAt: '2024-01-15T14:30:00Z',
    userId: 'user1',
    organizationId: 'org1',
  },
  {
    id: '2',
    title: '产品需求文档模板',
    content: '这是一个标准的产品需求文档模板，可以用于各类产品项目...',
    summary: '提供了一个完整的产品需求文档模板，包含功能需求、非功能需求、用户故事等内容。',
    slug: 'prd-template',
    metadata: {
      wordCount: 2800,
      characterCount: 7000,
      paragraphCount: 12,
      sentenceCount: 35,
      readingTime: 11,
      readabilityScore: 78,
      language: 'zh-CN',
      seoKeywords: ['产品', '需求', '文档', '模板'],
      contentType: 'business',
      targetAudience: '产品经理',
      difficultyLevel: 'intermediate',
      purpose: 'instruct',
      format: 'markdown',
      encoding: 'utf-8',
      checksum: 'def456',
      customFields: {},
    },
    status: 'draft',
    visibility: 'team',
    tags: [
      { id: 't3', name: '产品', slug: 'product', color: '#8B5CF6', description: '', category: 'business', isSystem: false, usage: 25, createdAt: '2024-01-01T00:00:00Z', createdBy: 'user1' },
      { id: 't4', name: '模板', slug: 'template', color: '#F59E0B', description: '', category: 'general', isSystem: false, usage: 10, createdAt: '2024-01-01T00:00:00Z', createdBy: 'user1' },
    ],
    category: {
      id: 'c2',
      name: '商业文档',
      slug: 'business',
      description: '商业相关文档',
      color: '#EC4899',
      path: ['business'],
      isDefault: false,
      sortOrder: 2,
    },
    version: {
      current: 1,
      history: [],
      autoSave: true,
    },
    collaboration: {
      enabled: false,
      mode: 'view',
      permissions: {
        canEdit: false,
        canComment: true,
        canSuggest: false,
        canShare: false,
        canDelete: false,
        canManageCollaborators: false,
      },
      collaborators: [],
      invitations: [],
      comments: [],
      suggestions: [],
      realtime: {
        active: false,
        participants: [],
        cursors: [],
        selections: [],
        awareness: { users: {} },
      },
    },
    ai: {
      suggestions: [],
      analysis: {
        readabilityScore: 78,
        toneAnalysis: {
          overall: 'business',
          confidence: 0.8,
          scores: { business: 0.8, formal: 0.2 },
        },
        sentimentAnalysis: {
          polarity: 0.1,
          subjectivity: 0.3,
          emotions: { joy: 0.1, fear: 0.05, anger: 0.02, sadness: 0.03, trust: 0.8 },
        },
        keywordDensity: { 产品: 0.06, 需求: 0.04, 文档: 0.03 },
        topics: [
          { topic: '产品管理', relevance: 0.9 },
          { topic: '需求分析', relevance: 0.8 },
        ],
        lastAnalyzedAt: '2024-01-12T15:00:00Z',
      },
      generation: {
        requests: [],
        totalTokensUsed: 0,
        monthlyUsage: 0,
      },
      optimization: {
        history: [],
        settings: {
          autoOptimize: false,
          optimizationTypes: [],
        },
      },
    },
    files: [],
    analytics: {
      views: {
        totalViews: 56,
        uniqueViews: 34,
        viewsToday: 3,
        viewsThisWeek: 18,
        viewsThisMonth: 56,
        viewHistory: [],
        referrers: {},
        devices: {},
        locations: {},
      },
      engagement: {
        averageTimeSpent: 3.2,
        bounceRate: 0.4,
        scrollDepth: 0.6,
        interactionRate: 0.08,
        socialShares: {},
        comments: 1,
        reactions: {},
      },
      performance: {
        loadTime: 0.8,
        searchRanking: {},
        conversionRate: 0.03,
        clickThroughRate: 0.08,
      },
      seo: {
        searchVisibility: 45,
        keywordRankings: {},
        backlinks: 2,
        organicTraffic: 30,
        searchImpressions: 600,
        averagePosition: 5.1,
      },
    },
    settings: {
      editor: {
        theme: 'light',
        fontSize: 14,
        fontFamily: 'Inter',
        lineHeight: 1.5,
        showWordCount: true,
        showReadingTime: true,
        spellCheck: true,
        grammarCheck: true,
        autoCorrect: false,
        distraction_free: false,
        typewriterMode: false,
        focusMode: false,
      },
      export: {
        format: 'pdf',
        includeMetadata: true,
        includeComments: false,
        includeImages: true,
        paperSize: 'a4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
      },
      sharing: {
        allowComments: true,
        allowSuggestions: true,
        requireAuth: false,
        passwordProtected: false,
        trackViews: true,
        allowDownload: true,
      },
      notifications: {
        onComment: true,
        onSuggestion: true,
        onShare: true,
        onEdit: false,
        onPublish: true,
        frequency: 'immediate',
      },
    },
    audit: {
      events: [],
      retention: 90,
    },
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    userId: 'user1',
    organizationId: 'org1',
  },
  // 可以添加更多模拟数据...
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 获取文档列表
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用API客户端获取文档
      // const response = await apiClient.getDocuments({
      //   search: searchQuery,
      //   status: statusFilter !== 'all' ? statusFilter : undefined,
      // });
      // setDocuments(response.data);
      
      // 暂时使用模拟数据
      setTimeout(() => {
        let filteredDocs = MOCK_DOCUMENTS;
        if (searchQuery) {
          filteredDocs = filteredDocs.filter(doc => 
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.summary.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (statusFilter !== 'all') {
          filteredDocs = filteredDocs.filter(doc => doc.status === statusFilter);
        }
        setDocuments(filteredDocs);
        setLoading(false);
      }, 500);
      
    } catch {
      setError('获取文档列表失败');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  // 处理文档编辑
  const handleDocumentEdit = (document: Document) => {
    router.push(`/documents/${document.id}`);
  };

  // 处理文档删除
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDocumentDelete = async (_documentId: string) => {
    try {
      // await apiClient.deleteDocument(_documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== _documentId));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('删除文档失败:', err);
      }
    }
  };

  // 处理文档复制
  const handleDocumentDuplicate = async (document: Document) => {
    try {
      // const duplicated = await apiClient.duplicateDocument(document.id);
      const duplicated: Document = {
        ...document,
        id: `${document.id}_copy_${Date.now()}`,
        title: `${document.title} (副本)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: undefined,
      };
      
      setDocuments(prev => [duplicated, ...prev]);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('复制文档失败:', err);
      }
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={setSidebarCollapsed}
        className="hidden md:flex"
      />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 头部 */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">文档管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  管理和查看您的所有文档
                </p>
              </div>
              <Link href="/documents/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  新建文档
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* 搜索和过滤 */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>

        {/* 文档列表 */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchDocuments} className="mt-4">重试</Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">没有找到文档</p>
              <Link href="/documents/new" className="mt-4 inline-block">
                <Button>创建第一个文档</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map(document => (
                <Card key={document.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {document.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {document.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(document.status)}>
                      {getStatusText(document.status)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDocumentDuplicate(document)}
                      >
                        复制
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDocumentEdit(document)}
                      >
                        编辑
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    <p>更新时间: {new Date(document.updatedAt).toLocaleDateString()}</p>
                    {document.metadata && (
                      <p className="mt-1">
                        {document.metadata.wordCount} 字 · {document.metadata.readingTime} 分钟阅读
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}