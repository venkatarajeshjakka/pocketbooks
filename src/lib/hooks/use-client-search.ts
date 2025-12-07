/**
 * Custom Hook: useClientSearch
 * Manages client search state with debouncing and URL synchronization
 */

'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from './use-debounce';

export interface UseClientSearchReturn {
  searchQuery: string;
  debouncedQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
}

export function useClientSearch(): UseClientSearchReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQueryState] = useState(initialSearch);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Update URL when debounced query changes
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';

    // Only update URL if the debounced query differs from current URL param
    if (debouncedQuery === currentSearch) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery) {
      params.set('search', debouncedQuery);
    } else {
      params.delete('search');
    }

    // Reset to page 1 when search changes
    params.delete('page');

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [debouncedQuery, router, searchParams]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState('');
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
    clearSearch,
    isSearching: isPending || searchQuery !== debouncedQuery,
  };
}
