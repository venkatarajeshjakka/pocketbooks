/**
 * TanStack Query Provider
 *
 * Provides React Query context for client-side data caching and state management
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

// Default stale time: 5 minutes
// Data is considered fresh for 5 minutes before background refetch
const DEFAULT_STALE_TIME = 1000 * 60 * 5;

// Default cache time: 10 minutes
// Unused data stays in cache for 10 minutes before garbage collection
const DEFAULT_CACHE_TIME = 1000 * 60 * 10;

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance per component mount
  // This ensures isolated cache for each user session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // How long data is considered fresh (no refetch during this time)
            staleTime: DEFAULT_STALE_TIME,
            // How long unused data stays in cache
            gcTime: DEFAULT_CACHE_TIME,
            // Refetch on window focus (good for real-time updates)
            refetchOnWindowFocus: true,
            // Don't refetch on component remount if data is still fresh
            refetchOnMount: false,
            // Retry failed requests (with exponential backoff)
            retry: 1,
            // Don't retry on 4xx errors
            retryOnMount: true,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
