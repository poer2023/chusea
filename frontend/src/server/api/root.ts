/**
 * tRPC根路由器
 * 
 * 这个文件汇集了所有子路由器，构成完整的API结构：
 * - auth: 认证相关API
 * - documents: 文档管理API
 * - workflow: 工作流API
 * - user: 用户管理API
 */

import { createTRPCRouter } from '../trpc';
import { authRouter } from './routers/auth';
import { documentsRouter } from './routers/documents';
import { workflowRouter } from './routers/workflow';
import { userRouter } from './routers/user';

/**
 * 主要的tRPC API路由器
 * 
 * 所有API路由都在这里注册
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  documents: documentsRouter,
  workflow: workflowRouter,
  user: userRouter,
});

/**
 * 导出类型定义
 * 这个类型将被客户端使用以获得完整的类型安全
 */
export type AppRouter = typeof appRouter;