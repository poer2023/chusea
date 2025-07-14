/**
 * tRPC客户端配置
 * 
 * 配置tRPC客户端以便在React组件中使用
 * 集成TanStack Query v5进行数据获取和缓存
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import { type AppRouter } from '@/server/api/root';

/**
 * 创建tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * 获取基础URL
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // 浏览器端应该使用相对URL
    return '';
  }
  
  if (process.env.VERCEL_URL) {
    // 在Vercel上运行时的URL
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 在本地开发时假设在localhost:3000
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * 创建tRPC客户端配置
 */
export const trpcClientConfig = {
  /**
   * Transformer配置
   * 使用superjson处理复杂数据类型
   */
  transformer: superjson,
  
  /**
   * Links配置
   * 定义请求的处理链
   */
  links: [
    // 开发环境下启用日志
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    
    // HTTP批处理链接
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      
      /**
       * 请求头配置
       */
      headers() {
        const headers: Record<string, string> = {};
        
        // 从localStorage获取token（如果存在）
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth-token');
          if (token) {
            headers.authorization = `Bearer ${token}`;
          }
        }
        
        return headers;
      },
      
      /**
       * 批处理配置
       */
      maxURLLength: 2048,
    }),
  ],
  
  /**
   * 查询客户端默认选项
   */
  defaultOptions: {
    queries: {
      // 数据被认为新鲜的时间（毫秒）
      staleTime: 5 * 60 * 1000, // 5分钟
      
      // 缓存时间
      gcTime: 10 * 60 * 1000, // 10分钟
      
      // 重试配置
      retry: (failureCount, error: any) => {
        // 对于4xx错误不重试
        if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
          return false;
        }
        
        // 最多重试3次
        return failureCount < 3;
      },
      
      // 重新获取配置
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // 突变的重试配置
      retry: (failureCount, error: any) => {
        // 对于客户端错误不重试
        if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
          return false;
        }
        
        // 最多重试1次
        return failureCount < 1;
      },
    },
  },
};

/**
 * 类型导出
 * 用于在其他文件中获得类型支持
 */
export type TRPCClient = typeof trpc;