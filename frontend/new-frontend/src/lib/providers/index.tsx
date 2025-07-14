'use client';

import { QueryProvider } from './query-provider';
import { StoreProvider } from './store-provider';
import { ThemeProvider } from './theme-provider';
import { ErrorBoundary } from './error-boundary';
import { InitializationProvider } from './hydration-provider';
import { ToastContainer } from '../components/toast';
import { TRPCProvider } from '../trpc/provider';
// import { cookies } from 'next/headers'; // 仅在服务器组件中可用

interface AppProvidersProps {
  children: React.ReactNode;
  enableDevtools?: boolean;
  cookies?: string;
}

export function AppProviders({ children, enableDevtools, cookies }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <InitializationProvider>
        <TRPCProvider cookies={cookies}>
          <ThemeProvider>
            <StoreProvider>
              {children}
              <ToastContainer />
            </StoreProvider>
          </ThemeProvider>
        </TRPCProvider>
      </InitializationProvider>
    </ErrorBoundary>
  );
}

/**
 * 服务器端App Providers
 * 用于服务器组件，自动获取cookies
 */
export async function ServerAppProviders({ 
  children, 
  enableDevtools 
}: Omit<AppProvidersProps, 'cookies'>) {
  // 动态导入cookies以避免在客户端组件中使用
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  const cookieString = cookieStore.toString();
  
  return (
    <AppProviders enableDevtools={enableDevtools} cookies={cookieString}>
      {children}
    </AppProviders>
  );
}

// Export individual providers for custom usage
export { QueryProvider } from './query-provider';
export { StoreProvider } from './store-provider';
export { ThemeProvider, useTheme, ThemeToggle } from './theme-provider';
export { ErrorBoundary, useErrorBoundary, withErrorBoundary } from './error-boundary';
export { 
  InitializationProvider, 
  HydrationProvider, 
  StoreSyncProvider,
  useIsHydrated,
  useSafeLocalStorage 
} from './hydration-provider';
export { ToastContainer } from '../components/toast';

// Export tRPC related
export { TRPCProvider, SimpleTRPCProvider, useTRPC, useQueryClient } from '../trpc/provider';
export { trpc } from '../trpc/client';
export { serverClient } from '../trpc/server';
export type { 
  RouterInputs, 
  RouterOutputs, 
  TRPCError,
  QueryOptions,
  MutationOptions
} from '../trpc/types';