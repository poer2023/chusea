'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { getQueryClient } from '../api/query-client';
import { useSimpleToast } from '../stores/simple-stores';

interface QueryProviderProps {
  children: React.ReactNode;
  enableDevtools?: boolean;
  devtoolsConfig?: {
    initialIsOpen?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    panelPosition?: 'top' | 'bottom' | 'left' | 'right';
  };
}

export function QueryProvider({ 
  children, 
  enableDevtools = process.env.NODE_ENV === 'development',
  devtoolsConfig = {}
}: QueryProviderProps) {
  // Create a stable query client instance
  // Using useState ensures the client is created only once per component tree
  const [queryClient] = useState(() => getQueryClient());
  const toast = useSimpleToast();

  // Set up global error handling for queries
  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 429 (rate limit)
          if (error?.code === 'HTTP_401' || error?.code === 'HTTP_403') {
            return false;
          }
          if (error?.code?.startsWith('HTTP_4') && error?.code !== 'HTTP_429') {
            return false;
          }
          return failureCount < 3;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry mutations on client errors
          if (error?.code?.startsWith('HTTP_4')) {
            return false;
          }
          return failureCount < 2;
        },
        onError: (error: any) => {
          // Show error toast for mutations
          console.error('Mutation error:', error);
          toast.error(
            'Operation failed',
            error?.message || 'An unexpected error occurred'
          );
        },
      },
    });

    // Global query error handler
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'error') {
        const error = event.error as any;
        console.error('Query error:', error);
        
        // Don't show toast for background refetch errors
        if (event.query.state.fetchStatus !== 'fetching') {
          return;
        }

        // Handle specific error types
        if (error?.code === 'HTTP_401') {
          toast.error('Authentication required', 'Please log in to continue');
        } else if (error?.code === 'HTTP_403') {
          toast.error('Access denied', 'You don\'t have permission for this action');
        } else if (error?.code === 'HTTP_429') {
          toast.warning('Rate limit exceeded', 'Please try again in a moment');
        } else if (error?.code === 'NETWORK_ERROR') {
          toast.error('Network error', 'Please check your internet connection');
        } else if (error?.code === 'TIMEOUT') {
          toast.error('Request timeout', 'The operation took too long to complete');
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient, toast]);

  const {
    initialIsOpen = false,
    position = 'bottom-right',
    panelPosition = 'bottom'
  } = devtoolsConfig;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ReactQuery DevTools - enhanced configuration */}
      {enableDevtools && (
        <ReactQueryDevtools 
          initialIsOpen={initialIsOpen}
          buttonPosition={position}
          position={panelPosition}
          toggleButtonProps={{
            style: {
              fontSize: '12px',
              background: '#FF6B6B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              margin: '8px',
              zIndex: 99999,
            }
          }}
          panelProps={{
            style: {
              fontSize: '14px',
              zIndex: 99998,
            }
          }}
          closeButtonProps={{
            style: {
              background: '#FF6B6B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
            }
          }}
        />
      )}
    </QueryClientProvider>
  );
}

// Enhanced query client getter with better configuration
export function getEnhancedQueryClient() {
  return getQueryClient();
}

// Hook to get query client instance
export function useQueryClient() {
  const client = getQueryClient();
  return client;
}