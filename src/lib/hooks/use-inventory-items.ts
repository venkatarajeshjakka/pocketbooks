import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as inventoryApi from '@/lib/api/inventory';
import { inventoryKeys } from '@/lib/query-keys';
import { ApiResponse, PaginatedResponse } from '@/types';

interface InventoryItem {
    _id: string;
    name: string;
    sku?: string;
    unit: string;
    currentStock: number;
    costPrice: number;
    description?: string;
    category?: string;
    defaultVendorId?: string;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

export function useRawMaterials(params?: { search?: string; limit?: number; page?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    return useQuery({
        queryKey: inventoryKeys.rawMaterials.list(params || {}),
        queryFn: () => inventoryApi.fetchRawMaterials(params || {}),
        staleTime: 60 * 1000,
    });
}

export function useTradingGoods(params?: { search?: string; limit?: number; page?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    return useQuery({
        queryKey: inventoryKeys.tradingGoods.list(params || {}),
        queryFn: () => inventoryApi.fetchTradingGoods(params || {}),
        staleTime: 60 * 1000,
    });
}

export function useFinishedGoods(params?: { search?: string; limit?: number; page?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    return useQuery({
        queryKey: inventoryKeys.finishedGoods.list(params || {}),
        queryFn: () => inventoryApi.fetchFinishedGoods(params || {}),
        staleTime: 60 * 1000,
    });
}

export function useRawMaterial(id: string) {
    return useQuery({
        queryKey: inventoryKeys.rawMaterials.detail(id),
        queryFn: () => inventoryApi.fetchRawMaterial(id),
        enabled: !!id,
        staleTime: 60 * 1000,
        select: (data) => data.data,
    });
}

export function useTradingGood(id: string) {
    return useQuery({
        queryKey: inventoryKeys.tradingGoods.detail(id),
        queryFn: () => inventoryApi.fetchTradingGood(id),
        enabled: !!id,
        staleTime: 60 * 1000,
        select: (data) => data.data,
    });
}

export function useFinishedGood(id: string) {
    return useQuery({
        queryKey: inventoryKeys.finishedGoods.detail(id),
        queryFn: () => inventoryApi.fetchFinishedGood(id),
        enabled: !!id,
        staleTime: 60 * 1000,
        select: (data) => data.data,
    });
}

// ============================================================================
// MUTATION HOOKS - RAW MATERIALS
// ============================================================================

export function useCreateRawMaterial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.createRawMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.rawMaterials.lists() });
            toast.success('Raw material created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create raw material');
        },
    });
}

export function useUpdateRawMaterial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            inventoryApi.updateRawMaterial(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.rawMaterials.lists() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.rawMaterials.detail(variables.id) });
            toast.success('Raw material updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update raw material');
        },
    });
}

export function useDeleteRawMaterial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.deleteRawMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.rawMaterials.lists() });
            toast.success('Raw material deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete raw material');
        },
    });
}

// ============================================================================
// MUTATION HOOKS - TRADING GOODS
// ============================================================================

export function useCreateTradingGood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.createTradingGood,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.tradingGoods.lists() });
            toast.success('Trading good created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create trading good');
        },
    });
}

export function useUpdateTradingGood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            inventoryApi.updateTradingGood(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.tradingGoods.lists() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.tradingGoods.detail(variables.id) });
            toast.success('Trading good updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update trading good');
        },
    });
}

export function useDeleteTradingGood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.deleteTradingGood,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.tradingGoods.lists() });
            toast.success('Trading good deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete trading good');
        },
    });
}

// ============================================================================
// MUTATION HOOKS - FINISHED GOODS
// ============================================================================

export function useCreateFinishedGood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.createFinishedGood,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.finishedGoods.lists() });
            toast.success('Finished good created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create finished good');
        },
    });
}

export function useUpdateFinishedGood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            inventoryApi.updateFinishedGood(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.finishedGoods.lists() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.finishedGoods.detail(variables.id) });
            toast.success('Finished good updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update finished good');
        },
    });
}

export function useDeleteFinishedGood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.deleteFinishedGood,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.finishedGoods.lists() });
            toast.success('Finished good deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete finished good');
        },
    });
}
