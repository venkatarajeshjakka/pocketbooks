/**
 * Custom React Query hooks for client data management
 *
 * These hooks provide cached data fetching, mutations, and automatic
 * cache invalidation for client operations.
 */

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  fetchClients,
  fetchClient,
  createClient,
  updateClient,
  deleteClient,
  type FetchClientsParams,
} from '@/lib/api/clients';
import { IClient, IClientInput, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

// Query Keys - Centralized for consistency
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: FetchClientsParams) =>
    [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated clients list with caching
 *
 * Features:
 * - Automatic caching (5 min stale time)
 * - Background refetch on window focus
 * - Deduplication of simultaneous requests
 */
export function useClients(
  params: FetchClientsParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<IClient>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => fetchClients(params),
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    ...options,
  });
}

/**
 * Hook to fetch a single client by ID
 *
 * Features:
 * - Caches individual client data
 * - Automatically refetches when stale
 */
export function useClient(
  id: string,
  options?: Omit<UseQueryOptions<IClient>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClient(id),
    enabled: !!id, // Only fetch if ID is provided
    ...options,
  });
}

/**
 * Hook to create a new client
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Error handling with toast notifications
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IClientInput) => createClient(input),
    onSuccess: async (data) => {
      // Invalidate all client lists and refetch immediately
      await queryClient.invalidateQueries({
        queryKey: clientKeys.lists(),
        refetchType: 'all'
      });

      // Optionally set the new client in cache
      if (data.success && data.data) {
        queryClient.setQueryData(
          clientKeys.detail(data.data._id.toString()),
          data.data
        );
      }

      toast.success('Client created', {
        description: 'The client has been successfully created.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create client', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing client
 *
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation
 * - Rollback on error
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IClientInput }) =>
      updateClient(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });

      // Snapshot the previous value for rollback
      const previousClient = queryClient.getQueryData<IClient>(
        clientKeys.detail(id)
      );

      // Optimistically update the client in cache
      if (previousClient) {
        queryClient.setQueryData<IClient>(clientKeys.detail(id), {
          ...previousClient,
          ...input,
        });
      }

      return { previousClient };
    },
    onSuccess: (data, { id }) => {
      // Invalidate all client lists
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });

      // Update the client detail cache with server response
      if (data.success && data.data) {
        queryClient.setQueryData(clientKeys.detail(id), data.data);
      }

      toast.success('Client updated', {
        description: 'The client has been successfully updated.',
      });
    },
    onError: (error: Error, { id }, context) => {
      // Rollback to previous value on error
      if (context?.previousClient) {
        queryClient.setQueryData(clientKeys.detail(id), context.previousClient);
      }

      toast.error('Failed to update client', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a client
 *
 * Features:
 * - Optimistic removal from cache
 * - Automatic cache invalidation
 * - Rollback on error
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onMutate: async (id) => {
      // Cancel queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });

      // Snapshot previous values
      const previousClient = queryClient.getQueryData<IClient>(
        clientKeys.detail(id)
      );

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });

      return { previousClient };
    },
    onSuccess: () => {
      // Invalidate all lists to refetch without deleted client
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });

      toast.success('Client deleted', {
        description: 'The client has been successfully deleted.',
      });
    },
    onError: (error: Error, id, context) => {
      // Restore client on error
      if (context?.previousClient) {
        queryClient.setQueryData(
          clientKeys.detail(id),
          context.previousClient
        );
      }

      toast.error('Failed to delete client', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to manually invalidate client cache
 *
 * Useful for forcing a refetch after external changes
 */
export function useInvalidateClients() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: clientKeys.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() }),
    invalidateClient: (id: string) =>
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) }),
  };
}
