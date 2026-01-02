/**
 * Custom Hook: useEntityFilters
 * Generic filter hook for entities with URL synchronization
 * Can be used for clients, vendors, or any other entity type
 */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EntityStatus } from '@/types';

export interface EntityFilters {
  status?: EntityStatus;
  hasOutstanding?: boolean;
}

export interface UseEntityFiltersReturn {
  activeFilters: EntityFilters;
  setFilter: (key: keyof EntityFilters, value: string | boolean | undefined) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  isPending: boolean;
}

export function useEntityFilters(): UseEntityFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse active filters from URL
  const activeFilters: EntityFilters = {
    status: (searchParams.get('status') as EntityStatus) || undefined,
    hasOutstanding: searchParams.get('hasOutstanding') === 'true' || undefined,
  };

  const hasActiveFilters = Object.values(activeFilters).some((val) => val !== undefined);

  const setFilter = useCallback(
    (key: keyof EntityFilters, value: string | boolean | undefined) => {
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
