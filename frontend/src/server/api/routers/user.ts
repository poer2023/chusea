/**
 * 用户管理API路由
 * 
 * 提供用户信息管理、偏好设置、头像上传等功能
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../../trpc';

/**
 * 用户相关的输入验证schemas
 */
const updateProfileInput = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名长度不能超过50个字符').optional(),
  bio: z.string().max(500, '个人简介不能超过500个字符').optional(),
  avatar: z.string().url('请输入有效的头像URL').optional(),
  timezone: z.string().optional(),
  language: z.enum(['zh-CN', 'en-US']).optional(),
  dateFormat: z.enum(['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY']).optional(),
});

const updatePreferencesInput = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    browser: z.boolean().optional(),
    mobile: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
    showActivity: z.boolean().optional(),
    allowMessages: z.boolean().optional(),
  }).optional(),
  editor: z.object({
    fontSize: z.number().min(12).max(24).optional(),
    tabSize: z.number().min(2).max(8).optional(),
    wordWrap: z.boolean().optional(),
    autoSave: z.boolean().optional(),
  }).optional(),
});

const searchUsersInput = z.object({
  query: z.string().min(1, '搜索关键词不能为空'),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(10),
  role: z.enum(['user', 'admin']).optional(),
});

const updateUserRoleInput = z.object({
  userId: z.string(),
  role: z.enum(['user', 'admin']),
});

/**
 * 模拟数据
 */
const mockUsers = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    bio: '这是一个演示用户账号',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN' as const,
    dateFormat: 'YYYY-MM-DD' as const,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-20'),
    preferences: {
      theme: 'system' as const,
      notifications: {
        email: true,
        browser: true,
        mobile: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        showActivity: true,
        allowMessages: true,
      },
      editor: {
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        autoSave: true,
      },
    },
    stats: {
      documentsCreated: 15,
      workflowsCreated: 8,
      totalViews: 1250,
      lastActive: new Date('2024-01-20'),
    },
  },
  {
    id: 'user-2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    bio: '系统管理员',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN' as const,
    dateFormat: 'YYYY-MM-DD' as const,
    emailVerified: true,
    createdAt: new Date('2023-12-01'),
    lastLoginAt: new Date('2024-01-20'),
    preferences: {
      theme: 'dark' as const,
      notifications: {
        email: true,
        browser: true,
        mobile: true,
      },
      privacy: {
        profileVisibility: 'public' as const,
        showActivity: false,
        allowMessages: false,
      },
      editor: {
        fontSize: 16,
        tabSize: 4,
        wordWrap: false,
        autoSave: true,
      },
    },
    stats: {
      documentsCreated: 42,
      workflowsCreated: 25,
      totalViews: 5680,
      lastActive: new Date('2024-01-20'),
    },
  },
];

/**
 * 用户管理路由器
 */
export const userRouter = createTRPCRouter({
  /**
   * 获取当前用户完整信息
   */
  profile: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库查询
        const user = mockUsers.find(u => u.id === userId);
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }
        
        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取用户信息失败',
          cause: error,
        });
      }
    }),

  /**
   * 更新用户资料
   */
  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库更新
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }
        
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          ...input,
        };
        
        return {
          success: true,
          user: mockUsers[userIndex],
          message: '用户资料更新成功',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新用户资料失败',
          cause: error,
        });
      }
    }),

  /**
   * 更新用户偏好设置
   */
  updatePreferences: protectedProcedure
    .input(updatePreferencesInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库更新
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }
        
        // 深度合并偏好设置
        mockUsers[userIndex].preferences = {
          ...mockUsers[userIndex].preferences,
          ...input,
          notifications: {
            ...mockUsers[userIndex].preferences.notifications,
            ...input.notifications,
          },
          privacy: {
            ...mockUsers[userIndex].preferences.privacy,
            ...input.privacy,
          },
          editor: {
            ...mockUsers[userIndex].preferences.editor,
            ...input.editor,
          },
        };
        
        return {
          success: true,
          preferences: mockUsers[userIndex].preferences,
          message: '偏好设置更新成功',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新偏好设置失败',
          cause: error,
        });
      }
    }),

  /**
   * 上传头像
   */
  uploadAvatar: protectedProcedure
    .input(z.object({
      file: z.string(), // base64编码的文件
      filename: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的文件上传和处理逻辑
        // 1. 解码base64文件
        // 2. 上传到云存储（如S3）
        // 3. 更新用户头像URL
        
        // 模拟上传过程
        const avatarUrl = `https://example.com/avatars/${userId}/${Date.now()}.png`;
        
        // 更新用户数据
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          mockUsers[userIndex].avatar = avatarUrl;
        }
        
        return {
          success: true,
          avatarUrl,
          message: '头像上传成功',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '头像上传失败',
          cause: error,
        });
      }
    }),

  /**
   * 获取用户统计信息
   */
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的统计查询
        const user = mockUsers.find(u => u.id === userId);
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }
        
        return user.stats;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取统计信息失败',
          cause: error,
        });
      }
    }),

  /**
   * 搜索用户（管理员功能）
   */
  search: adminProcedure
    .input(searchUsersInput)
    .query(async ({ input }) => {
      const { query, page, limit, role } = input;
      
      try {
        // TODO: 实际的数据库搜索
        const filteredUsers = mockUsers.filter(user => {
          const matchesQuery = 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase());
          
          const matchesRole = !role || user.role === role;
          
          return matchesQuery && matchesRole;
        });
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        // 移除敏感信息
        const safeUsers = paginatedUsers.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          stats: user.stats,
        }));
        
        return {
          users: safeUsers,
          pagination: {
            page,
            limit,
            total: filteredUsers.length,
            pages: Math.ceil(filteredUsers.length / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '搜索用户失败',
          cause: error,
        });
      }
    }),

  /**
   * 更新用户角色（管理员功能）
   */
  updateRole: adminProcedure
    .input(updateUserRoleInput)
    .mutation(async ({ input }) => {
      const { userId, role } = input;
      
      try {
        // TODO: 实际的数据库更新
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }
        
        mockUsers[userIndex].role = role;
        
        return {
          success: true,
          message: `用户角色已更新为 ${role}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新用户角色失败',
          cause: error,
        });
      }
    }),

  /**
   * 禁用/启用用户（管理员功能）
   */
  toggleStatus: adminProcedure
    .input(z.object({
      userId: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { userId, enabled } = input;
      
      try {
        // TODO: 实际的用户状态更新
        const user = mockUsers.find(u => u.id === userId);
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }
        
        return {
          success: true,
          message: enabled ? '用户已启用' : '用户已禁用',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新用户状态失败',
          cause: error,
        });
      }
    }),

  /**
   * 删除用户账号
   */
  deleteAccount: protectedProcedure
    .input(z.object({
      password: z.string().min(1, '请输入密码确认'),
      confirmation: z.literal('DELETE', { message: '请输入 DELETE 确认删除' }),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { password } = input;
      
      try {
        // TODO: 实际的账号删除逻辑
        // 1. 验证密码
        // 2. 删除用户数据
        // 3. 删除相关文档和工作流
        // 4. 清理会话
        
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }
        
        // 验证密码（模拟）
        if (password !== 'demo123') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '密码错误',
          });
        }
        
        mockUsers.splice(userIndex, 1);
        
        return {
          success: true,
          message: '账号已删除',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '删除账号失败',
          cause: error,
        });
      }
    }),
});