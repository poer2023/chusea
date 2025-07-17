/**
 * tRPC路由器核心配置
 * 
 * 这个文件配置了tRPC的核心功能：
 * - 创建tRPC实例
 * - 配置序列化器
 * - 定义过程类型
 * - 配置错误格式化
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { type Context } from './context';

/**
 * 初始化tRPC实例
 */
const t = initTRPC.context<Context>().create({
  /**
   * 序列化器配置
   * superjson 支持Date、Map、Set等原生JS类型的序列化
   */
  transformer: superjson,
  
  /**
   * 错误格式化器
   * 为开发环境提供详细的错误信息
   */
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // 在开发环境下包含Zod验证错误详情
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 导出tRPC工具函数
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * 受保护的过程（需要认证）
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // 检查用户是否已登录
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      // 确保用户会话存在
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * 管理员专用过程
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  // 检查用户是否为管理员
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  
  return next({
    ctx,
  });
});

/**
 * 类型导出
 */
export type TRPCRouter = typeof t._config;