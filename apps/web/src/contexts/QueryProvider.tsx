'use client';

import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/navigation';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Circuit breaker to prevent infinite redirect loops and cascading queries
let isRedirecting = false;
let redirectTimer: NodeJS.Timeout | null = null;

export function QueryProvider({ children }: QueryProviderProps) {
  const router = useRouter();

  const handleAuthError = React.useCallback(() => {
    // Prevent multiple simultaneous redirects
    if (isRedirecting) {
      console.log('🚫 Redirect already in progress, skipping');
      return;
    }

    isRedirecting = true;
    console.warn('🔒 Auth/DB error detected - redirecting to login');

    // Clear any existing timer
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }

    // Reset the flag after 5 seconds
    redirectTimer = setTimeout(() => {
      isRedirecting = false;
      redirectTimer = null;
    }, 5000);

    router.push('/api/auth/login');
  }, [router]);

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Never retry authentication or database errors
              if (error?.message?.includes('Authentication') ||
                  error?.message?.includes('401') ||
                  error?.message?.includes('prisma') ||
                  error?.message?.includes('database') ||
                  error?.message?.includes('does not exist')) {
                console.log('🛑 Stopping retries for auth/db error');
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
          onError: (error: any, query) => {
            console.error('Query error:', error?.message, 'Query:', query.queryKey);
            if (error?.message?.includes('Authentication required') ||
                error?.message?.includes('401') ||
                error?.message?.includes('Authentication expired') ||
                error?.message?.includes('prisma') ||
                error?.message?.includes('database') ||
                error?.message?.includes('does not exist')) {

              // Cancel ALL pending queries immediately
              queryClient.cancelQueries();
              handleAuthError();
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            console.error('Mutation error:', error?.message);
            if (error?.message?.includes('Authentication required') ||
                error?.message?.includes('401') ||
                error?.message?.includes('Authentication expired') ||
                error?.message?.includes('prisma') ||
                error?.message?.includes('database') ||
                error?.message?.includes('does not exist')) {

              // Cancel ALL pending queries immediately
              queryClient.cancelQueries();
              handleAuthError();
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
