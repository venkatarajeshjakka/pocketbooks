/**
 * Expenses API Functions
 */

import { IExpense, ApiResponse, PaginatedResponse } from '@/types';

/**
 * Fetch all expenses with optional filtering and pagination
 */
export async function fetchExpenses(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
} = {}): Promise<PaginatedResponse<IExpense>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.category) queryParams.set('category', params.category);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);

    const response = await fetch(`/api/expenses?${queryParams.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch expenses');
    }
    return response.json();
}

/**
 * Fetch a single expense by ID
 */
export async function fetchExpense(id: string): Promise<IExpense> {
    const response = await fetch(`/api/expenses/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch expense');
    }
    const result: ApiResponse<IExpense> = await response.json();
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Expense not found');
    }
    return result.data;
}

/**
 * Fetch expense stats
 */
export async function fetchExpenseStats(): Promise<{
    totalAmount: number;
    totalCount: number;
    avgAmount: number;
    byCategory: Record<string, { amount: number; count: number }>;
    thisMonth: number;
    lastMonth: number;
}> {
    const response = await fetch('/api/expenses/stats');
    if (!response.ok) {
        throw new Error('Failed to fetch expense stats');
    }
    const result = await response.json();
    return result.data;
}
