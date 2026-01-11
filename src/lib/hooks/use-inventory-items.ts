import { useQuery } from '@tanstack/react-query';
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

export function useRawMaterials(params?: { search?: string; limit?: number }) {
    return useQuery<PaginatedResponse<InventoryItem>>({
        queryKey: ['raw-materials', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.search) searchParams.set('search', params.search);
            if (params?.limit) searchParams.set('limit', params.limit.toString());

            const response = await fetch(
                `/api/inventory/raw-materials?${searchParams.toString()}`
            );
            return response.json();
        },
        staleTime: 60 * 1000, // 1 minute
    });
}

export function useTradingGoods(params?: { search?: string; limit?: number }) {
    return useQuery<PaginatedResponse<InventoryItem>>({
        queryKey: ['trading-goods', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.search) searchParams.set('search', params.search);
            if (params?.limit) searchParams.set('limit', params.limit.toString());

            const response = await fetch(
                `/api/inventory/trading-goods?${searchParams.toString()}`
            );
            return response.json();
        },
        staleTime: 60 * 1000, // 1 minute
    });
}
