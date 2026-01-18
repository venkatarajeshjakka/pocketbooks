
/**
 * Sales API Helper Functions
 *
 * Centralized functions for sales-related API calls
 */

import { ApiResponse, ISale, ISaleInput, PaginatedResponse, QueryParams } from '@/types';

/**
 * Get the base URL for API calls
 * Works in both server and client contexts
 */
function getBaseUrl(): string {
    // Browser should use relative URL
    if (typeof window !== 'undefined') {
        return '';
    }

    // Server: Use NEXTAUTH_URL if available (for deployed environments)
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }

    // Server: Use VERCEL_URL if available (Vercel deployment)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Server: Default to localhost for development
    return `http://localhost:${process.env.PORT || 3000}`;
}

const API_BASE = '/api/sales';

export async function fetchSales(params?: QueryParams): Promise<ApiResponse<ISale[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, String(value));
        });
    }

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}?${searchParams.toString()}`, {
        cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
}

export async function fetchSaleById(id: string): Promise<ApiResponse<ISale>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
        cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch sale');
    return response.json();
}

export async function createSale(data: ISaleInput): Promise<ApiResponse<ISale>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const resData: ApiResponse<ISale> = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Failed to create sale');
    return resData;
}

export async function updateSale(id: string, data: Partial<ISaleInput>): Promise<ApiResponse<ISale>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const resData: ApiResponse<ISale> = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Failed to update sale');
    return resData;
}

export async function deleteSale(id: string): Promise<ApiResponse<{ id: string }>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
        method: 'DELETE',
    });

    const resData: ApiResponse<{ id: string }> = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Failed to delete sale');
    return resData;
}

export async function fetchSalePayments(id: string): Promise<ApiResponse<any[]>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}/payments`, {
        cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch sale payments');
    return response.json();
}

export async function createSalePayment(id: string, data: any): Promise<ApiResponse<any>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const resData: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Failed to create payment');
    return resData;
}

export async function fetchSaleStats(): Promise<ApiResponse<any>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/stats`, {
        cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch sales stats');
    return response.json();
}
