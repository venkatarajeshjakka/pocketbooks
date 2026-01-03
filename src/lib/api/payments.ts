/**
 * Payments API Functions
 */

import { IPayment, ApiResponse, PaginatedResponse } from '@/types';

/**
 * Fetch all payments with optional filtering and pagination
 */
export async function fetchPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    transactionType?: string;
    partyType?: string;
} = {}): Promise<PaginatedResponse<IPayment>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    if (params.transactionType) queryParams.set('transactionType', params.transactionType);
    if (params.partyType) queryParams.set('partyType', params.partyType);

    const response = await fetch(`/api/payments?${queryParams.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch payments');
    }
    return response.json();
}

/**
 * Fetch a single payment by ID
 */
export async function fetchPayment(id: string): Promise<IPayment> {
    const response = await fetch(`/api/payments/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch payment');
    }
    const result: ApiResponse<IPayment> = await response.json();
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Payment not found');
    }
    return result.data;
}

/**
 * Fetch payment stats
 */
export async function fetchPaymentStats(): Promise<any> {
    const response = await fetch('/api/payments/stats');
    if (!response.ok) {
        throw new Error('Failed to fetch payment stats');
    }
    const result = await response.json();
    return result.data;
}
