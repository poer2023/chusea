/**
 * tRPC Provider组件
 * 
 * 提供tRPC和TanStack Query的React上下文
 * 必须包装在应用的根组件中
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { trpc, trpcClientConfig } from './client';

/**
 * Props类型定义
 */
interface TRPCProviderProps {
  children: ReactNode;
  cookies?: string;
}

/**
 * tRPC Provider组件
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  // 创建tRPC客户端
  const [trpcClient] = useState(() =>
    trpc.createClient(trpcClientConfig)
  );

  // 创建Query客户端
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
            
            // 网络模式
            networkMode: 'online',
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
            
            // 网络模式
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* 开发环境下显示ReactQuery开发者工具 */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom"
            buttonPosition="bottom-left"
          />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

/**
 * 简化版Provider（用于测试或简单场景）
 */
export function SimpleTRPCProvider({ children }: { children: ReactNode }) {
  const [trpcClient] = useState(() => trpc.createClient(trpcClientConfig));
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

/**
 * Hook: 获取tRPC客户端
 */
export const useTRPC = () => trpc;

/**
 * Hook: 获取Query客户端
 */
export { useQueryClient } from '@tanstack/react-query';

/**
 * 类型导出
 */
export type { TRPCProviderProps };