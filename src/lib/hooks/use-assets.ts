/**
 * use-assets Hook
 *
 * React Query hooks for Asset management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IAsset, IAssetInput, PaginatedResponse, ApiResponse } from '@/types';

const ASSETS_QUERY_KEY = 'assets';

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
        queryKey: [ASSETS_QUERY_KEY, params],
        queryFn: async () => {
            const response = await fetch(`/api/assets?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch assets');
            return response.json();
        },
    });
}

export function useAsset(id: string) {
    return useQuery<ApiResponse<IAsset>>({
        queryKey: [ASSETS_QUERY_KEY, id],
        queryFn: async () => {
            const response = await fetch(`/api/assets/${id}`);
            if (!response.ok) throw new Error('Failed to fetch asset');
            return response.json();
        },
        enabled: !!id,
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
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
            queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, id] });
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
            queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
        },
    });
}
