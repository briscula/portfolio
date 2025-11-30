'use client';

import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/navigation';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Circuit breaker to prevent infinite redirect loops
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
    console.warn('🔒 Session expired - redirecting to login');

    // Clear any existing timer
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }

    // Reset the flag after 3 seconds to allow future redirects if needed
    redirectTimer = setTimeout(() => {
      isRedirecting = false;
      redirectTimer = null;
    }, 3000);

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
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: false, // Completely disable retries
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error: any) => {
            if (error?.message?.includes('Authentication required') ||
                error?.message?.includes('401') ||
                error?.message?.includes('Authentication expired') ||
                error?.message?.includes('prisma') ||
                error?.message?.includes('database')) {
              handleAuthError();
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            if (error?.message?.includes('Authentication required') ||
                error?.message?.includes('401') ||
                error?.message?.includes('Authentication expired') ||
                error?.message?.includes('prisma') ||
                error?.message?.includes('database')) {
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
