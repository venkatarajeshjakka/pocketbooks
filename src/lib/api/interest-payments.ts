/**
 * Interest Payments API Functions
 */

import { IInterestPayment, IInterestPaymentInput, PaginatedResponse, ApiResponse, QueryParams } from '@/types';

/**
 * Get the base URL for API calls
 * Works in both server and client contexts
 */
function getBaseUrl(): string {
    // Browser should use relative URL
    if (typeof window !== 'undefined') {
        return '';
    }

    // Server: Default to localhost for development
    return `http://localhost:${process.env.PORT || 3000}`;
}

/**
 * Fetch all interest payments with filtering
 */
export async function fetchInterestPayments(params: QueryParams = {}): Promise<PaginatedResponse<IInterestPayment>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.loanAccountId) searchParams.append('loanAccountId', params.loanAccountId);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/interest-payments?${searchParams.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch interest payments');
    }
    return response.json();
}

/**
 * Fetch a single interest payment by ID
 */
export async function fetchInterestPayment(id: string): Promise<ApiResponse<IInterestPayment>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/interest-payments/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch interest payment');
    }
    return response.json();
}
