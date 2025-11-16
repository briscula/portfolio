'use client';

import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/navigation';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const router = useRouter();

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              if (error?.message?.includes('Authentication') || error?.message?.includes('401')) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error: any) => {
            if (error?.message?.includes('Authentication required') ||
                error?.message?.includes('401') ||
                error?.message?.includes('Authentication expired')) {
              console.warn('🔒 Session expired - redirecting to login');
              router.push('/api/auth/login');
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            if (error?.message?.includes('Authentication required') ||
                error?.message?.includes('401') ||
                error?.message?.includes('Authentication expired')) {
              console.warn('🔒 Session expired - redirecting to login');
              router.push('/api/auth/login');
            }
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
