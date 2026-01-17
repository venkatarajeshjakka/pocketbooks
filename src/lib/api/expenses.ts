/**
 * Expenses API Functions
 */

import { IExpense, ApiResponse, PaginatedResponse } from '@/types';

/**
 * Get the base URL for API calls
 */
function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        return '';
    }
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return `http://localhost:${process.env.PORT || 3000}`;
}

const API_BASE = '/api/expenses';

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

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}?${queryParams.toString()}`, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch expenses');
    }
    return response.json();
}

/**
 * Fetch a single expense by ID
 */
export async function fetchExpense(id: string): Promise<IExpense> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
        cache: 'no-store'
    });
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
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/stats`, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch expense stats');
    }
    const result = await response.json();
    return result.data;
}
