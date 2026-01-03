/**
 * Payments React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPayments, fetchPayment, fetchPaymentStats } from '@/lib/api/payments';
import { IPaymentInput, ApiResponse, IPayment } from '@/types';
import { toast } from 'sonner';

export const PAYMENTS_QUERY_KEY = 'payments';
export const ASSETS_QUERY_KEY = 'assets';

/**
 * Structured query keys for better cache management
 */
export const paymentKeys = {
    all: [PAYMENTS_QUERY_KEY] as const,
    lists: () => [...paymentKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...paymentKeys.lists(), filters] as const,
    details: () => [...paymentKeys.all, 'detail'] as const,
    detail: (id: string) => [...paymentKeys.details(), id] as const,
    stats: () => [...paymentKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all payments with filtering
 */
export function usePayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    transactionType?: string;
    partyType?: string;
    assetId?: string;
    saleId?: string;
    startDate?: string;
    endDate?: string;
} = {}) {
    return useQuery({
        queryKey: [PAYMENTS_QUERY_KEY, params],
        queryFn: () => fetchPayments(params),
        staleTime: 0, // Ensure fresh data
    });
}

/**
 * Hook to fetch a single payment
 */
export function usePayment(id: string) {
    return useQuery({
        queryKey: [PAYMENTS_QUERY_KEY, id],
        queryFn: () => fetchPayment(id),
        enabled: !!id,
        staleTime: 0,
    });
}

/**
 * Hook to fetch payment stats
 */
export function usePaymentStats() {
    return useQuery({
        queryKey: [PAYMENTS_QUERY_KEY, 'stats'],
        queryFn: fetchPaymentStats,
        staleTime: 0,
    });
}

/**
 * Hook to create a new payment
 */
export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: IPaymentInput) => {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create payment');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
            toast.success('Payment created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create payment');
        },
    });
}

/**
 * Hook to update a payment
 */
export function useUpdatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<IPaymentInput> }) => {
            const response = await fetch(`/api/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update payment');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
            toast.success('Payment updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update payment');
        },
    });
}

/**
 * Hook to delete a payment
 */
export function useDeletePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/payments/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete payment');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
            toast.success('Payment deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete payment');
        },
    });
}

/**
 * Hook to invalidate payment queries
 */
export function useInvalidatePayments() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    };
}
