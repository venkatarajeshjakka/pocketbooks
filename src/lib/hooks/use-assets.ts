/**
 * use-assets Hook
 *
 * React Query hooks for Asset management
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IAsset, IAssetInput, PaginatedResponse, ApiResponse } from '@/types';
import { toast } from 'sonner';
import {
    assetKeys,
    paymentKeys,
    vendorKeys,
} from '@/lib/query-keys';

// Re-export for backwards compatibility
export { assetKeys };

export function useAssets(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return useQuery<PaginatedResponse<IAsset>>({
        queryKey: assetKeys.list(params || {}),
        queryFn: async () => {
            const response = await fetch(`/api/assets?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch assets');
            return response.json();
        },
        staleTime: 1000 * 60, // 1 minute - match client pattern
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

export function useAsset(id: string) {
    return useQuery<ApiResponse<IAsset>>({
        queryKey: assetKeys.detail(id),
        queryFn: async () => {
            const response = await fetch(`/api/assets/${id}`);
            if (!response.ok) throw new Error('Failed to fetch asset');
            return response.json();
        },
        enabled: !!id,
        staleTime: 1000 * 60, // 1 minute
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

export function useCreateAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (asset: IAssetInput) => {
            const response = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create asset');
            }
            return response.json();
        },
        onMutate: async (newAsset) => {
            await queryClient.cancelQueries({ queryKey: assetKeys.lists() });
            const previousAssets = queryClient.getQueryData(assetKeys.lists());

            // Optimistically add the new asset (simplified - normally would need to handle pagination)
            // For now, we'll relying on invalidation for the list, but we can set the cache implies it

            return { previousAssets };
        },
        onSuccess: () => {
            // Use structured keys for consistent cross-module cache invalidation (G4 fix)
            queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
        onError: (error, _newAsset, context) => {
            if (context?.previousAssets) {
                queryClient.setQueryData(assetKeys.lists(), context.previousAssets);
            }
            toast.error(error.message || "Failed to create asset");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
        },
    });
}

export function useUpdateAsset(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (asset: Partial<IAssetInput>) => {
            const response = await fetch(`/api/assets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update asset');
            }
            return response.json();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: assetKeys.detail(id) });
            const previousAsset = queryClient.getQueryData(assetKeys.detail(id));
            return { previousAsset };
        },
        onSuccess: () => {
            // Use structured keys for consistent cross-module cache invalidation (G4 fix)
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
        onError: (error, _asset, context) => {
            if (context?.previousAsset) {
                queryClient.setQueryData(assetKeys.detail(id), context.previousAsset);
            }
            toast.error(error.message || "Failed to update asset");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) });
        },
    });
}

export function useDeleteAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/assets/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete asset');
            }
            return response.json();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: assetKeys.lists() });
            const previousAssets = queryClient.getQueryData(assetKeys.lists());
            return { previousAssets };
        },
        onSuccess: () => {
            // Use structured keys for consistent cross-module cache invalidation (G4 fix)
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
        onError: (error, _id, context) => {
            if (context?.previousAssets) {
                queryClient.setQueryData(assetKeys.lists(), context.previousAssets);
            }
            toast.error(error.message || "Failed to delete asset");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
        },
    });
}

/**
 * Hook to manually invalidate asset cache
 *
 * Useful for forcing a refetch after external changes
 * Matches the pattern from use-clients.ts
 */
export function useInvalidateAssets() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: assetKeys.all }),
        invalidateLists: () =>
            queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        invalidateAsset: (id: string) =>
            queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) }),
    };
}
