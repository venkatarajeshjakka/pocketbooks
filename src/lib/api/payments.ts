/**
 * Payments API Functions
 */

import { IPayment, ApiResponse, PaginatedResponse } from '@/types';

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

const API_BASE = '/api/payments';

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
    assetId?: string;
    saleId?: string;
    startDate?: string;
    endDate?: string;
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
    if (params.assetId) queryParams.set('assetId', params.assetId);
    if (params.saleId) queryParams.set('saleId', params.saleId);
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}?${queryParams.toString()}`, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch payments');
    }
    return response.json();
}

/**
 * Fetch a single payment by ID
 */
export async function fetchPayment(id: string): Promise<IPayment> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
        cache: 'no-store'
    });
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
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/stats`, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch payment stats');
    }
    const result = await response.json();
    return result.data;
}
