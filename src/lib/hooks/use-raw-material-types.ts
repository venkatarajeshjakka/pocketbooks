/**
 * Raw Material Types Hook
 * 
 * Provides functions for fetching and managing raw material types
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, PaginatedResponse, IRawMaterialType, IRawMaterialTypeInput, QueryParams } from '@/types';
import { toast } from 'sonner';

const BASE_URL = '/api/settings/raw-material-types';

export function useRawMaterialTypes(params: QueryParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    return useQuery({
        queryKey: ['raw-material-types', params],
        queryFn: async () => {
            const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to fetch raw material types');
            return response.json() as Promise<PaginatedResponse<IRawMaterialType>>;
        },
    });
}

export function useRawMaterialType(id: string) {
    return useQuery({
        queryKey: ['raw-material-types', id],
        queryFn: async () => {
            const response = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to fetch raw material type');
            return response.json() as Promise<ApiResponse<IRawMaterialType>>;
        },
        enabled: !!id,
    });
}

export function useCreateRawMaterialType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: IRawMaterialTypeInput) => {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create');
            return data as ApiResponse<IRawMaterialType>;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['raw-material-types'] });
            toast.success(data.message || 'Created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useUpdateRawMaterialType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: IRawMaterialTypeInput }) => {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update');
            return data as ApiResponse<IRawMaterialType>;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['raw-material-types'] });
            toast.success(data.message || 'Updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useDeleteRawMaterialType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete');
            return data as ApiResponse<void>;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['raw-material-types'] });
            toast.success(data.message || 'Deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}
