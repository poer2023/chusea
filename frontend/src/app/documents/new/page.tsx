'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Document, ContentType, DocumentStatus, DocumentVisibility, CreateDocumentData } from '@/types/document';
import { CreateDocumentForm } from '@/components/documents/CreateDocumentForm';

export default function NewDocumentPage() {
  const router = useRouter();

  // 处理文档创建
  const handleCreateDocument = async (data: CreateDocumentData & {
    summary?: string;
    status?: string;
    contentType?: string;
  }): Promise<Document> => {
    try {
      // 模拟API调用 - 在实际项目中替换为真实API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 真实API调用（取消注释以使用）
      // const document = await apiClient.createDocument(data);
      // return document;
      
      // 模拟创建的文档数据
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        title: data.title,
        content: data.content || '',
        summary: data.summary || '',
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        metadata: {
          wordCount: (data.content || '').length,
          characterCount: (data.content || '').length,
          paragraphCount: (data.content || '').split('\n\n').length,
          sentenceCount: (data.content || '').split(/[.!?]+/).length - 1,
          readingTime: Math.ceil((data.content || '').length / 200),
          readabilityScore: 75,
          language: 'zh-CN',
          seoKeywords: data.tags || [],
          contentType: (data.contentType || 'article') as ContentType,
          targetAudience: '通用',
          difficultyLevel: 'intermediate',
          purpose: 'inform',
          format: 'markdown',
          encoding: 'utf-8',
          checksum: Math.random().toString(36),
          customFields: {},
        },
        status: (data.status || 'draft') as DocumentStatus,
        visibility: (data.visibility || 'private') as DocumentVisibility,
        tags: (data.tags || []).map((tagName: string, index: number) => ({
          id: `tag_${index}`,
          name: tagName,
          slug: tagName.toLowerCase(),
          color: '#3B82F6',
          description: '',
          category: 'general',
          isSystem: false,
          usage: 1,
          createdAt: new Date().toISOString(),
          createdBy: 'user1',
        })),
        category: data.categoryId ? {
          id: data.categoryId,
          name: '默认分类',
          slug: 'default',
          description: '默认分类',
          color: '#6B7280',
          path: ['default'],
          isDefault: true,
          sortOrder: 0,
        } : undefined,
        version: {
          current: 1,
          history: [],
          autoSave: true,
        },
        collaboration: {
          enabled: false,
          mode: 'view',
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
            readabilityScore: 75,
            toneAnalysis: {
              overall: 'neutral',
              confidence: 0.7,
              scores: { neutral: 0.7, professional: 0.3 },
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
        publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
        userId: 'user1',
        organizationId: 'org1',
      };

      return newDocument;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('创建文档失败:', error);
      }
      throw new Error('创建文档失败，请重试');
    }
  };

  // 处理取消操作
  const handleCancel = () => {
    router.push('/documents');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          {/* 面包屑导航 */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <Link 
                    href="/documents" 
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg
                      className="flex-shrink-0 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="sr-only">文档</span>
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    新建文档
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          
          {/* 页面标题 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              创建新文档
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              填写文档信息并开始创作您的内容
            </p>
          </div>
        </div>

        {/* 创建文档表单 */}
        <CreateDocumentForm
          onSubmit={handleCreateDocument}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}