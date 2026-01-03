/**
 * Payments React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPayments, fetchPayment, fetchPaymentStats } from '@/lib/api/payments';
import { IPaymentInput, ApiResponse } from '@/types';

export const PAYMENTS_QUERY_KEY = 'payments';

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
            queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
        },
    });
}
