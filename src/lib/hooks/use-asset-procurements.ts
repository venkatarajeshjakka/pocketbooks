/**
 * use-asset-procurements Hook
 *
 * React Query hooks for Asset Procurements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IAssetProcurement, IAssetProcurementInput, PaginatedResponse, ApiResponse } from '@/types';

const ASSET_PROCUREMENTS_QUERY_KEY = 'asset-procurements';

export function useAssetProcurements(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return useQuery<PaginatedResponse<IAssetProcurement>>({
        queryKey: [ASSET_PROCUREMENTS_QUERY_KEY, params],
        queryFn: async () => {
            const response = await fetch(`/api/assets/procurement?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch asset procurements');
            return response.json();
        },
    });
}

export function useCreateAssetProcurement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (procurement: IAssetProcurementInput & { paymentDetails?: any }) => {
            const response = await fetch('/api/assets/procurement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(procurement),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to record asset purchase');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ASSET_PROCUREMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}
