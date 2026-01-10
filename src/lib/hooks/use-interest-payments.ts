/**
 * Interest Payments React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInterestPayments, fetchInterestPayment } from '@/lib/api/interest-payments';
import { IInterestPaymentInput, QueryParams } from '@/types';
import { toast } from 'sonner';
import { interestPaymentKeys, expenseKeys, paymentKeys, loanKeys } from '@/lib/query-keys';

/**
 * Hook to fetch all interest payments with filtering
 */
export function useInterestPayments(params: QueryParams = {}) {
    return useQuery({
        queryKey: interestPaymentKeys.list(params as Record<string, unknown>),
        queryFn: () => fetchInterestPayments(params),
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Hook to fetch a single interest payment
 */
export function useInterestPayment(id: string) {
    return useQuery({
        queryKey: interestPaymentKeys.detail(id),
        queryFn: () => fetchInterestPayment(id),
        enabled: !!id,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Hook to register a new interest payment
 */
export function useCreateInterestPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: IInterestPaymentInput) => {
            const response = await fetch('/api/interest-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to record interest payment');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate multiple caches due to integration
            queryClient.invalidateQueries({ queryKey: interestPaymentKeys.all });
            queryClient.invalidateQueries({ queryKey: expenseKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: loanKeys.all });

            toast.success('Interest payment recorded successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to record interest payment');
        },
    });
}

/**
 * Hook to delete an interest payment
 */
export function useDeleteInterestPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/interest-payments/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete interest payment');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: interestPaymentKeys.all });
            // Note: In reality, we might also need to delete associated expense/payment
            // or at least invalidate them. For now, we'll invalidate them all.
            queryClient.invalidateQueries({ queryKey: expenseKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: loanKeys.all });

            toast.success('Interest payment deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete interest payment');
        },
    });
}
/**
 * Hook to update an interest payment
 */
export function useUpdateInterestPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<IInterestPaymentInput> }) => {
            const response = await fetch(`/api/interest-payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update interest payment');
            }

            return response.json();
        },
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: interestPaymentKeys.all });
            queryClient.invalidateQueries({ queryKey: interestPaymentKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: expenseKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: loanKeys.all });

            toast.success('Interest payment updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update interest payment');
        },
    });
}
