'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Document } from '@/types/document';

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');

  // 获取文档详情
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟文档数据
        const mockDocument: Document = {
          id: documentId,
          title: '示例文档',
          content: '这是文档的内容...',
          summary: '这是文档的摘要',
          slug: 'example-document',
          metadata: {
            wordCount: 100,
            characterCount: 500,
            paragraphCount: 3,
            sentenceCount: 10,
            readingTime: 1,
            readabilityScore: 85,
            language: 'zh-CN',
            seoKeywords: [],
            contentType: 'article' as const,
            targetAudience: '一般用户',
            difficultyLevel: 'beginner',
            purpose: 'inform',
            format: 'markdown',
            encoding: 'utf-8',
            checksum: 'abc123',
            customFields: {},
          },
          status: 'draft',
          visibility: 'private',
          tags: [],
          category: {
            id: 'c1',
            name: '默认分类',
            slug: 'default',
            description: '默认分类',
            color: '#6366F1',
            path: ['default'],
            isDefault: true,
            sortOrder: 0,
          },
          version: { current: 1, history: [], autoSave: true },
          collaboration: {
            enabled: false,
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
                overall: 'neutral',
                confidence: 0.8,
                scores: { neutral: 0.8, positive: 0.2 },
              },
              sentimentAnalysis: {
                polarity: 0.0,
                subjectivity: 0.5,
                emotions: { joy: 0.1, fear: 0.1, anger: 0.1, sadness: 0.1, trust: 0.6 },
              },
              keywordDensity: {},
              topics: [],
              lastAnalyzedAt: new Date().toISOString(),
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
              totalViews: 0,
              uniqueViews: 0,
              viewsToday: 0,
              viewsThisWeek: 0,
              viewsThisMonth: 0,
              viewHistory: [],
              referrers: {},
              devices: {},
              locations: {},
            },
            engagement: {
              averageTimeSpent: 0,
              bounceRate: 0,
              scrollDepth: 0,
              interactionRate: 0,
              socialShares: {},
              comments: 0,
              reactions: {},
            },
            performance: {
              loadTime: 0,
              searchRanking: {},
              conversionRate: 0,
              clickThroughRate: 0,
            },
            seo: {
              searchVisibility: 0,
              keywordRankings: {},
              backlinks: 0,
              organicTraffic: 0,
              searchImpressions: 0,
              averagePosition: 0,
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user1',
          organizationId: 'org1',
        };
        
        setDocument(mockDocument);
        setTitle(mockDocument.title);
        setContent(mockDocument.content);
        setSummary(mockDocument.summary);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('获取文档失败:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // 保存文档
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 真实API调用（取消注释以使用）
      // await apiClient.updateDocument(documentId, { title, content, summary });
      
      router.push('/documents');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('保存失败:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">文档未找到</h2>
          <Button onClick={() => router.push('/documents')}>
            返回文档列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">编辑文档</h1>
            <p className="mt-2 text-sm text-gray-600">
              编辑您的文档内容
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/documents')}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入文档标题"
                />
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  摘要
                </label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入文档摘要"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入文档内容"
                />
              </div>
            </div>
          </Card>

          {/* 文档统计信息 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">文档统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">字数:</span>
                <span className="ml-2 font-medium">{content.length}</span>
              </div>
              <div>
                <span className="text-gray-600">段落:</span>
                <span className="ml-2 font-medium">{content.split('\n\n').length}</span>
              </div>
              <div>
                <span className="text-gray-600">预计阅读时间:</span>
                <span className="ml-2 font-medium">{Math.ceil(content.length / 200)} 分钟</span>
              </div>
              <div>
                <span className="text-gray-600">状态:</span>
                <span className="ml-2 font-medium">{document.status}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}