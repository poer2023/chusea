/**
 * tRPC Next.js App Router集成
 * 
 * 这个文件将tRPC路由器与Next.js 15 App Router集成
 * 处理所有的tRPC API请求
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/context';

/**
 * tRPC请求处理器
 * 统一处理GET和POST请求
 */
const handler = async (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  });
};

/**
 * 导出HTTP方法处理器
 * Next.js App Router要求明确导出每个HTTP方法
 */
export { handler as GET, handler as POST };