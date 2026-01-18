/**
 * Expenses React Query Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { fetchExpenses, fetchExpense, fetchExpenseStats } from '@/lib/api/expenses';
import { IExpenseInput, ApiResponse, IExpense } from '@/types';
import { toast } from 'sonner';
import {
    expenseKeys,
    paymentKeys,
    EXPENSES_QUERY_KEY,
} from '@/lib/query-keys';

// Re-export for backwards compatibility
export { expenseKeys, EXPENSES_QUERY_KEY };

/**
 * Hook to fetch all expenses with filtering
 */
export function useExpenses(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
} = {}) {
    return useQuery({
        queryKey: expenseKeys.list(params),
        queryFn: () => fetchExpenses(params),
        staleTime: 1000 * 60, // 1 minute
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}


/**
 * Hook to fetch a single expense
 */
export function useExpense(id: string, options?: Omit<UseQueryOptions<IExpense>, 'queryKey' | 'queryFn'>) {
    return useQuery<IExpense>({
        queryKey: expenseKeys.detail(id),
        queryFn: () => fetchExpense(id),
        enabled: !!id,
        staleTime: 1000 * 60, // 1 minute
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        ...options,
    });
}

/**
 * Hook to fetch expense stats
 */
export function useExpenseStats() {
    return useQuery({
        queryKey: expenseKeys.stats(),
        queryFn: fetchExpenseStats,
        staleTime: 1000 * 60 * 5, // 5 minutes - stats change less frequently
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to create a new expense
 */
export function useCreateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: IExpenseInput) => {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create expense');
            }

            return response.json();
        },
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: expenseKeys.lists() });

            // Snapshot the previous value for rollback
            const previousExpenses = queryClient.getQueryData(expenseKeys.lists());

            return { previousExpenses };
        },
        onSuccess: () => {
            // Invalidate both expense and payment caches since expenses create payment records
            queryClient.invalidateQueries({ queryKey: expenseKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
        onError: (error: Error, _newExpense, context) => {
            // Rollback on error
            if (context?.previousExpenses) {
                queryClient.setQueryData(expenseKeys.lists(), context.previousExpenses);
            }
            toast.error(error.message || 'Failed to create expense');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
        },
    });
}

/**
 * Hook to update an expense
 */
export function useUpdateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<IExpenseInput> }) => {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update expense');
            }

            return response.json();
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: expenseKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: expenseKeys.lists() });

            const previousExpense = queryClient.getQueryData(expenseKeys.detail(id));
            const previousExpenses = queryClient.getQueryData(expenseKeys.lists());

            if (previousExpense) {
                queryClient.setQueryData(expenseKeys.detail(id), (old: any) => ({
                    ...old,
                    data: { ...old?.data, ...data }
                }));
            }

            return { previousExpense, previousExpenses };
        },
        onSuccess: () => {
            // Invalidate both expense and payment caches since expenses update payment records
            queryClient.invalidateQueries({ queryKey: expenseKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
        onError: (error: Error, { id }, context) => {
            if (context?.previousExpense) {
                queryClient.setQueryData(expenseKeys.detail(id), context.previousExpense);
            }
            if (context?.previousExpenses) {
                queryClient.setQueryData(expenseKeys.lists(), context.previousExpenses);
            }
            toast.error(error.message || 'Failed to update expense');
        },
        onSettled: (_data, _error, { id }) => {
            queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
        },
    });
}

/**
 * Hook to delete an expense
 */
export function useDeleteExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete expense');
            }

            return response.json();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: expenseKeys.lists() });

            const previousExpenses = queryClient.getQueryData(expenseKeys.lists());

            return { previousExpenses };
        },
        onSuccess: () => {
            // Invalidate both expense and payment caches since deleting expense also deletes payment
            queryClient.invalidateQueries({ queryKey: expenseKeys.all });
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            toast.success('Expense deleted successfully');
        },
        onError: (error: Error, _id, context) => {
            if (context?.previousExpenses) {
                queryClient.setQueryData(expenseKeys.lists(), context.previousExpenses);
            }
            toast.error(error.message || 'Failed to delete expense');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
        },
    });
}

/**
 * Hook to manually invalidate expense cache
 */
export function useInvalidateExpenses() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        invalidateLists: () =>
            queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
        invalidateExpense: (id: string) =>
            queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) }),
        invalidateStats: () =>
            queryClient.invalidateQueries({ queryKey: expenseKeys.stats() }),
    };
}
