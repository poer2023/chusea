/**
 * 文档管理API路由
 * 
 * 提供文档的CRUD操作、权限管理、版本控制等功能
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

/**
 * 文档相关的输入验证schemas
 */
const documentCreateInput = z.object({
  title: z.string().min(1, '文档标题不能为空').max(255, '标题长度不能超过255个字符'),
  content: z.string().optional().default(''),
  type: z.enum(['markdown', 'text', 'html']).default('markdown'),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(false),
  allowComments: z.boolean().optional().default(true),
});

const documentUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1, '文档标题不能为空').max(255, '标题长度不能超过255个字符').optional(),
  content: z.string().optional(),
  type: z.enum(['markdown', 'text', 'html']).optional(),
  folderId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  allowComments: z.boolean().optional(),
});

const documentQueryInput = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'views']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includePublic: z.boolean().optional().default(false),
});

const folderCreateInput = z.object({
  name: z.string().min(1, '文件夹名称不能为空').max(100, '名称长度不能超过100个字符'),
  parentId: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

const shareDocumentInput = z.object({
  documentId: z.string(),
  userEmail: z.string().email('请输入有效的邮箱地址'),
  permission: z.enum(['read', 'write', 'admin']).default('read'),
  expiresAt: z.date().optional(),
});

/**
 * 模拟数据
 */
const mockDocuments = [
  {
    id: 'doc-1',
    title: '项目需求文档',
    content: '# 项目需求文档\n\n这是一个示例文档...',
    type: 'markdown' as const,
    authorId: 'user-1',
    folderId: 'folder-1',
    tags: ['需求', '设计'],
    isPublic: false,
    allowComments: true,
    views: 42,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'doc-2',
    title: 'API接口文档',
    content: '# API接口文档\n\n## 认证接口\n\n...',
    type: 'markdown' as const,
    authorId: 'user-1',
    folderId: 'folder-2',
    tags: ['API', '技术'],
    isPublic: true,
    allowComments: true,
    views: 128,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
];

const mockFolders = [
  {
    id: 'folder-1',
    name: '需求文档',
    parentId: null,
    description: '项目需求相关文档',
    color: '#3B82F6',
    ownerId: 'user-1',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'folder-2',
    name: '技术文档',
    parentId: null,
    description: '技术相关文档',
    color: '#10B981',
    ownerId: 'user-1',
    createdAt: new Date('2024-01-01'),
  },
];

/**
 * 文档管理路由器
 */
export const documentsRouter = createTRPCRouter({
  /**
   * 获取文档列表
   */
  list: protectedProcedure
    .input(documentQueryInput)
    .query(async ({ input, ctx }) => {
      const { page, limit, search, folderId, tags, sortBy, sortOrder, includePublic } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库查询
        const filteredDocs = mockDocuments.filter(doc => {
          if (!includePublic && doc.authorId !== userId && !doc.isPublic) {
            return false;
          }
          
          if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) {
            return false;
          }
          
          if (folderId && doc.folderId !== folderId) {
            return false;
          }
          
          if (tags && tags.length > 0 && !tags.some(tag => doc.tags.includes(tag))) {
            return false;
          }
          
          return true;
        });
        
        // 排序
        filteredDocs.sort((a, b) => {
          const aValue = a[sortBy as keyof typeof a];
          const bValue = b[sortBy as keyof typeof b];
          
          if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDocs = filteredDocs.slice(startIndex, endIndex);
        
        return {
          documents: paginatedDocs,
          pagination: {
            page,
            limit,
            total: filteredDocs.length,
            pages: Math.ceil(filteredDocs.length / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取文档列表失败',
          cause: error,
        });
      }
    }),

  /**
   * 获取单个文档
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库查询
        const document = mockDocuments.find(doc => doc.id === id);
        
        if (!document) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文档不存在',
          });
        }
        
        // 检查权限
        if (document.authorId !== userId && !document.isPublic) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权访问此文档',
          });
        }
        
        // TODO: 增加浏览次数
        document.views++;
        
        return document;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取文档失败',
          cause: error,
        });
      }
    }),

  /**
   * 创建文档
   */
  create: protectedProcedure
    .input(documentCreateInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库插入
        const newDocument = {
          id: `doc-${Date.now()}`,
          ...input,
          authorId: userId,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        mockDocuments.push(newDocument);
        
        return {
          success: true,
          document: newDocument,
          message: '文档创建成功',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建文档失败',
          cause: error,
        });
      }
    }),

  /**
   * 更新文档
   */
  update: protectedProcedure
    .input(documentUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库更新
        const documentIndex = mockDocuments.findIndex(doc => doc.id === id);
        
        if (documentIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文档不存在',
          });
        }
        
        const document = mockDocuments[documentIndex];
        
        // 检查权限
        if (document.authorId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权编辑此文档',
          });
        }
        
        // 更新文档
        mockDocuments[documentIndex] = {
          ...document,
          ...updateData,
          updatedAt: new Date(),
        };
        
        return {
          success: true,
          document: mockDocuments[documentIndex],
          message: '文档更新成功',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新文档失败',
          cause: error,
        });
      }
    }),

  /**
   * 删除文档
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库删除
        const documentIndex = mockDocuments.findIndex(doc => doc.id === id);
        
        if (documentIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文档不存在',
          });
        }
        
        const document = mockDocuments[documentIndex];
        
        // 检查权限
        if (document.authorId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权删除此文档',
          });
        }
        
        mockDocuments.splice(documentIndex, 1);
        
        return {
          success: true,
          message: '文档删除成功',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '删除文档失败',
          cause: error,
        });
      }
    }),

  /**
   * 获取文件夹列表
   */
  folders: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库查询
        const userFolders = mockFolders.filter(folder => folder.ownerId === userId);
        
        return userFolders;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取文件夹列表失败',
          cause: error,
        });
      }
    }),

  /**
   * 创建文件夹
   */
  createFolder: protectedProcedure
    .input(folderCreateInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库插入
        const newFolder = {
          id: `folder-${Date.now()}`,
          ...input,
          ownerId: userId,
          createdAt: new Date(),
        };
        
        mockFolders.push(newFolder);
        
        return {
          success: true,
          folder: newFolder,
          message: '文件夹创建成功',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建文件夹失败',
          cause: error,
        });
      }
    }),

  /**
   * 分享文档给其他用户
   */
  share: protectedProcedure
    .input(shareDocumentInput)
    .mutation(async ({ input, ctx }) => {
      const { documentId, userEmail } = input;
      const currentUserId = ctx.session.user.id;
      
      try {
        // TODO: 实际的权限检查和分享逻辑
        // 1. 检查当前用户是否有权限分享
        // 2. 查找目标用户
        // 3. 创建分享记录
        
        return {
          success: true,
          message: `文档已成功分享给 ${userEmail}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '分享文档失败',
          cause: error,
        });
      }
    }),

  /**
   * 获取文档统计信息
   */
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的统计查询
        const userDocs = mockDocuments.filter(doc => doc.authorId === userId);
        
        return {
          totalDocuments: userDocs.length,
          totalViews: userDocs.reduce((sum, doc) => sum + doc.views, 0),
          publicDocuments: userDocs.filter(doc => doc.isPublic).length,
          recentDocuments: userDocs
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, 5),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取统计信息失败',
          cause: error,
        });
      }
    }),
});