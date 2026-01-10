/**
 * Payments React Query Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPayments, fetchPayment, fetchPaymentStats } from '@/lib/api/payments';
import { IPaymentInput } from '@/types';
import { toast } from 'sonner';
import {
    paymentKeys,
    assetKeys,
    vendorKeys,
    PAYMENTS_QUERY_KEY,
} from '@/lib/query-keys';

// Re-export for backwards compatibility
export { paymentKeys, PAYMENTS_QUERY_KEY };

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
        queryKey: paymentKeys.list(params),
        queryFn: () => fetchPayments(params),
        staleTime: 1000 * 60, // 1 minute - matches assets/clients pattern for consistent caching
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to fetch a single payment
 */
export function usePayment(id: string) {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => fetchPayment(id),
        enabled: !!id,
        staleTime: 1000 * 60, // 1 minute - matches assets/clients pattern
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to fetch payment stats
 */
export function usePaymentStats() {
    return useQuery({
        queryKey: paymentKeys.stats(),
        queryFn: fetchPaymentStats,
        staleTime: 1000 * 60 * 5, // 5 minutes - stats change less frequently
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to create a new payment
 * Implements optimistic updates for better UX
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
        onMutate: async (newPayment) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: paymentKeys.lists() });

            // Snapshot the previous value for rollback
            const previousPayments = queryClient.getQueryData(paymentKeys.lists());

            return { previousPayments };
        },
        onSuccess: () => {
            // Use structured keys for consistent cross-module cache invalidation (G4 fix)
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
        onError: (error: Error, _newPayment, context) => {
            // Rollback on error
            if (context?.previousPayments) {
                queryClient.setQueryData(paymentKeys.lists(), context.previousPayments);
            }
            toast.error(error.message || 'Failed to create payment');
        },
        onSettled: () => {
            // Always refetch after error or success to ensure consistency
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
        },
    });
}

/**
 * Hook to update a payment
 * Implements optimistic updates for better UX
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
        onMutate: async ({ id, data }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: paymentKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: paymentKeys.lists() });

            // Snapshot previous values for rollback
            const previousPayment = queryClient.getQueryData(paymentKeys.detail(id));
            const previousPayments = queryClient.getQueryData(paymentKeys.lists());

            // Optimistically update the single payment cache
            if (previousPayment) {
                queryClient.setQueryData(paymentKeys.detail(id), (old: any) => ({
                    ...old,
                    data: { ...old?.data, ...data }
                }));
            }

            return { previousPayment, previousPayments };
        },
        onSuccess: () => {
            // Use structured keys for consistent cross-module cache invalidation (G4 fix)
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
        onError: (error: Error, { id }, context) => {
            // Rollback on error
            if (context?.previousPayment) {
                queryClient.setQueryData(paymentKeys.detail(id), context.previousPayment);
            }
            if (context?.previousPayments) {
                queryClient.setQueryData(paymentKeys.lists(), context.previousPayments);
            }
            toast.error(error.message || 'Failed to update payment');
        },
        onSettled: (_data, _error, { id }) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
        },
    });
}

/**
 * Hook to delete a payment
 * Implements optimistic updates for better UX
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
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: paymentKeys.lists() });

            // Snapshot the previous value for rollback
            const previousPayments = queryClient.getQueryData(paymentKeys.lists());

            return { previousPayments };
        },
        onSuccess: () => {
            // Use structured keys for consistent cross-module cache invalidation (G4 fix)
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
        onError: (error: Error, _id, context) => {
            // Rollback on error
            if (context?.previousPayments) {
                queryClient.setQueryData(paymentKeys.lists(), context.previousPayments);
            }
            toast.error(error.message || 'Failed to delete payment');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
        },
    });
}

/**
 * Hook to manually invalidate payment cache
 *
 * Useful for forcing a refetch after external changes
 * Matches the pattern from use-clients.ts
 */
export function useInvalidatePayments() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
        invalidateLists: () =>
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
        invalidatePayment: (id: string) =>
            queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) }),
        invalidateStats: () =>
            queryClient.invalidateQueries({ queryKey: paymentKeys.stats() }),
    };
}
