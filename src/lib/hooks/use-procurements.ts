'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchProcurements,
    fetchProcurement,
    createProcurement,
    updateProcurement,
    deleteProcurement,
    type FetchProcurementsParams
} from '@/lib/api/procurements';
import { toast } from 'sonner';

interface UseProcurementsParams extends FetchProcurementsParams {
    type: 'raw_material' | 'trading_good';
    startDate?: string;
    endDate?: string;
}

export const PROCUREMENT_KEYS = {
    all: ['procurements'] as const,
    lists: () => [...PROCUREMENT_KEYS.all, 'list'] as const,
    list: (params: any) => [...PROCUREMENT_KEYS.lists(), params] as const,
    details: () => [...PROCUREMENT_KEYS.all, 'detail'] as const,
    detail: (type: string, id: string) => [...PROCUREMENT_KEYS.details(), type, id] as const,
};

export function useProcurements(params: UseProcurementsParams) {
    return useQuery({
        queryKey: PROCUREMENT_KEYS.list(params),
        queryFn: () => fetchProcurements(params.type, params),
        staleTime: 60 * 1000,
    });
}

export function useProcurement(type: 'raw_material' | 'trading_good', id: string) {
    return useQuery({
        queryKey: PROCUREMENT_KEYS.detail(type, id),
        queryFn: () => fetchProcurement(type, id),
        enabled: !!id,
    });
}

export function useCreateProcurement(type: 'raw_material' | 'trading_good') {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: any) => createProcurement(type, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROCUREMENT_KEYS.lists() });
            toast.success('Procurement created', {
                description: 'The procurement has been successfully created.',
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to create procurement', {
                description: error.message,
            });
        },
    });
}

export function useUpdateProcurement(type: 'raw_material' | 'trading_good') {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: any }) => updateProcurement(type, id, input),
        onSuccess: (data, { id }) => {
            queryClient.invalidateQueries({ queryKey: PROCUREMENT_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: PROCUREMENT_KEYS.detail(type, id) });
            toast.success('Procurement updated', {
                description: 'The procurement has been successfully updated.',
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to update procurement', {
                description: error.message,
            });
        },
    });
}

export function useDeleteProcurement(type: 'raw_material' | 'trading_good') {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteProcurement(type, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROCUREMENT_KEYS.lists() });
            toast.success('Procurement deleted', {
                description: 'The procurement has been successfully deleted.',
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to delete procurement', {
                description: error.message,
            });
        },
    });
}
