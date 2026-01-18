
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchSales,
    fetchSaleById,
    createSale,
    updateSale,
    deleteSale,
    fetchSalePayments,
    createSalePayment,
    fetchSaleStats
} from '@/lib/api/sales';
import { ISaleInput, QueryParams } from '@/types';
import { toast } from 'sonner';

export function useSales(params?: QueryParams) {
    return useQuery({
        queryKey: ['sales', params],
        queryFn: () => fetchSales(params),
    });
}

export function useSale(id: string) {
    return useQuery({
        queryKey: ['sale', id],
        queryFn: () => fetchSaleById(id),
        enabled: !!id,
    });
}

export function useCreateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ISaleInput) => createSale(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            // Invalidate inventory/client queries as they might be affected
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Sale created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create sale');
        },
    });
}

export function useUpdateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ISaleInput> }) =>
            updateSale(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['sale', data.data?._id] });
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Sale updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to update sale');
        },
    });
}

export function useDeleteSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteSale(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Sale deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to delete sale');
        },
    });
}

export function useSalePayments(id: string) {
    return useQuery({
        queryKey: ['sale-payments', id],
        queryFn: () => fetchSalePayments(id),
        enabled: !!id,
    });
}

export function useCreateSalePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => createSalePayment(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sale-payments', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            // Also invalidate payments list generally if needed, and clients
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Payment recorded successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to record payment');
        },
    });
}

export function useSaleStats() {
    return useQuery({
        queryKey: ['sales-stats'],
        queryFn: () => fetchSaleStats(),
    });
}
