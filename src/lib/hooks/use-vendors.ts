/**
 * Custom React Query hooks for vendor data management
 *
 * These hooks provide cached data fetching, mutations, and automatic
 * cache invalidation for vendor operations.
 * Mirrors the client hooks structure for consistency.
 */

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  fetchVendors,
  fetchVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  type FetchVendorsParams,
} from '@/lib/api/vendors';
import { IVendor, IVendorInput, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

// Query Keys - Centralized for consistency
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (params: FetchVendorsParams) =>
    [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated vendors list with caching
 *
 * Features:
 * - Automatic caching (1 min stale time)
 * - Background refetch on window focus
 * - Deduplication of simultaneous requests
 */
export function useVendors(
  params: FetchVendorsParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<IVendor>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () => fetchVendors(params),
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    ...options,
  });
}

/**
 * Hook to fetch a single vendor by ID
 *
 * Features:
 * - Caches individual vendor data
 * - Automatically refetches when stale
 */
export function useVendor(
  id: string,
  options?: Omit<UseQueryOptions<IVendor>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => fetchVendor(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new vendor
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Error handling with toast notifications
 */
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IVendorInput) => createVendor(input),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: vendorKeys.lists(),
        refetchType: 'all'
      });

      if (data.success && data.data) {
        queryClient.setQueryData(
          vendorKeys.detail(data.data._id.toString()),
          data.data
        );
      }

      toast.success('Vendor created', {
        description: 'The vendor has been successfully created.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create vendor', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing vendor
 *
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation
 * - Rollback on error
 */
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IVendorInput }) =>
      updateVendor(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: vendorKeys.detail(id) });

      const previousVendor = queryClient.getQueryData<IVendor>(
        vendorKeys.detail(id)
      );

      if (previousVendor) {
        queryClient.setQueryData<IVendor>(vendorKeys.detail(id), {
          ...previousVendor,
          ...input,
        });
      }

      return { previousVendor };
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });

      if (data.success && data.data) {
        queryClient.setQueryData(vendorKeys.detail(id), data.data);
      }

      toast.success('Vendor updated', {
        description: 'The vendor has been successfully updated.',
      });
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousVendor) {
        queryClient.setQueryData(vendorKeys.detail(id), context.previousVendor);
      }

      toast.error('Failed to update vendor', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a vendor
 *
 * Features:
 * - Optimistic removal from cache
 * - Automatic cache invalidation
 * - Rollback on error
 */
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: vendorKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: vendorKeys.lists() });

      const previousVendor = queryClient.getQueryData<IVendor>(
        vendorKeys.detail(id)
      );

      queryClient.removeQueries({ queryKey: vendorKeys.detail(id) });

      return { previousVendor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });

      toast.success('Vendor deleted', {
        description: 'The vendor has been successfully deleted.',
      });
    },
    onError: (error: Error, id, context) => {
      if (context?.previousVendor) {
        queryClient.setQueryData(
          vendorKeys.detail(id),
          context.previousVendor
        );
      }

      toast.error('Failed to delete vendor', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to manually invalidate vendor cache
 *
 * Useful for forcing a refetch after external changes
 */
export function useInvalidateVendors() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: vendorKeys.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() }),
    invalidateVendor: (id: string) =>
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) }),
  };
}
