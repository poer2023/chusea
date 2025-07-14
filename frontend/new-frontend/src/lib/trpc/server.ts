/**
 * tRPC服务器端配置
 * 
 * 用于在服务器端组件中直接调用tRPC程序
 * 支持SSR和静态生成
 */

// 暂时注释掉有问题的导入，待修复
// import { createCallerFactory } from '@trpc/server';
// import { cache } from 'react';
// import { headers } from 'next/headers';
// import { appRouter } from '@/server/api/root';
// import { createTRPCContext } from '@/server/context';

// 暂时禁用服务器端功能，待修复
// TODO: 修复tRPC v11兼容性问题和next/headers导入问题

/**
 * 临时占位符 - 服务器端功能暂时禁用
 */
export const createServerClient = async () => {
  throw new Error('Server-side tRPC calls are temporarily disabled');
};

/**
 * 临时禁用的服务器端tRPC客户端
 */
export const serverClient = {
  async get() {
    throw new Error('Server-side tRPC calls are temporarily disabled');
  },
  auth: {
    async me() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
  },
  documents: {
    async list() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
    async get() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
    async stats() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
  },
  workflow: {
    async list() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
    async get() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
    async stats() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
  },
  user: {
    async profile() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
    async stats() {
      throw new Error('Server-side tRPC calls are temporarily disabled');
    },
  },
};

/**
 * 类型导出
 */
export type ServerClient = typeof serverClient;