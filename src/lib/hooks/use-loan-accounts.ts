/**
 * Loan Accounts React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { fetchLoanAccounts, fetchLoanAccount } from '@/lib/api/loan-accounts';
import { ILoanAccountInput, QueryParams, ApiResponse, ILoanAccount } from '@/types';
import { toast } from 'sonner';
import { loanKeys } from '@/lib/query-keys';

/**
 * Hook to fetch all loan accounts with filtering
 */
export function useLoanAccounts(params: QueryParams = {}) {
    return useQuery({
        queryKey: loanKeys.list(params as Record<string, unknown>),
        queryFn: () => fetchLoanAccounts(params),
        staleTime: 1000 * 60, // 1 minute
    });
}


/**
 * Hook to fetch a single loan account
 */
export function useLoanAccount(id: string, options?: Omit<UseQueryOptions<ApiResponse<ILoanAccount>>, 'queryKey' | 'queryFn'>) {
    return useQuery<ApiResponse<ILoanAccount>>({
        queryKey: loanKeys.detail(id),
        queryFn: () => fetchLoanAccount(id),
        enabled: !!id,
        staleTime: 1000 * 60, // 1 minute
        ...options,
    });
}

/**
 * Hook to create a new loan account
 */
export function useCreateLoanAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ILoanAccountInput) => {
            const response = await fetch('/api/loan-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create loan account');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: loanKeys.all });
            toast.success('Loan account created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create loan account');
        },
    });
}

/**
 * Hook to update a loan account
 */
export function useUpdateLoanAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ILoanAccountInput> }) => {
            const response = await fetch(`/api/loan-accounts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update loan account');
            }

            return response.json();
        },
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: loanKeys.all });
            queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
            toast.success('Loan account updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update loan account');
        },
    });
}

/**
 * Hook to delete a loan account
 */
export function useDeleteLoanAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/loan-accounts/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete loan account');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: loanKeys.all });
            toast.success('Loan account deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete loan account');
        },
    });
}
