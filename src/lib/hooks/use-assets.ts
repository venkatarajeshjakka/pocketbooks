/**
 * use-assets Hook
 *
 * React Query hooks for Asset management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IAsset, IAssetInput, PaginatedResponse, ApiResponse } from '@/types';

import { toast } from 'sonner';

/**
 * Structured query keys for better cache management
 */
export const assetKeys = {
    all: ['assets'] as const,
    lists: () => [...assetKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...assetKeys.lists(), filters] as const,
    details: () => [...assetKeys.all, 'detail'] as const,
    detail: (id: string) => [...assetKeys.details(), id] as const,
};

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
            queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
            toast.success("Asset created successfully");
        },
        onError: (error, newAsset, context: any) => {
            if (context?.previousAssets) {
                queryClient.setQueryData(assetKeys.lists(), context.previousAssets);
            }
            toast.error(error.message || "Failed to create asset");
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            toast.success("Asset updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update asset");
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            toast.success("Asset deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete asset");
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
