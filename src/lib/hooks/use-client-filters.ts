/**
 * Custom Hook: useClientFilters
 * Manages client filter state with URL synchronization
 */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EntityStatus } from '@/types';

export interface ClientFilters {
  status?: EntityStatus;
  hasOutstanding?: boolean;
}

export interface UseClientFiltersReturn {
  activeFilters: ClientFilters;
  setFilter: (key: keyof ClientFilters, value: string | boolean | undefined) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  isPending: boolean;
}

export function useClientFilters(): UseClientFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse active filters from URL
  const activeFilters: ClientFilters = {
    status: (searchParams.get('status') as EntityStatus) || undefined,
    hasOutstanding: searchParams.get('hasOutstanding') === 'true' || undefined,
  };

  const hasActiveFilters = Object.values(activeFilters).some((val) => val !== undefined);

  const setFilter = useCallback(
    (key: keyof ClientFilters, value: string | boolean | undefined) => {
      const params = new URLSearchParams(searchParams);

      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      params.delete('page');

      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);

    // Remove all filter params
    params.delete('status');
    params.delete('hasOutstanding');
    params.delete('page');

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  return {
    activeFilters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    isPending,
  };
}
