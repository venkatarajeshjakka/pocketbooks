/**
 * Procurement API Helper Functions
 *
 * Centralized functions for procurement-related API calls
 */

import { IRawMaterialProcurement, ITradingGoodsProcurement, ApiResponse, PaginatedResponse } from '@/types';

type IProcurement = IRawMaterialProcurement | ITradingGoodsProcurement;

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

const API_BASE = '/api/procurement';

export interface FetchProcurementsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    itemId?: string;
}

/**
 * Fetch all procurements
 */
export async function fetchProcurements(
    type: 'raw_material' | 'trading_good',
    params: FetchProcurementsParams = {}
): Promise<PaginatedResponse<IProcurement>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.itemId) searchParams.set('itemId', params.itemId);

    // endpoint is /api/procurement/raw-materials or /api/procurement/trading-goods
    // The type arg is 'raw_material' or 'trading_good'.
    // We need to map it to the route segments 'raw-materials' or 'trading-goods'.
    const routeSegment = type === 'raw_material' ? 'raw-materials' : 'trading-goods';

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${API_BASE}/${routeSegment}?${searchParams.toString()}`;

    const response = await fetch(url, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch procurements');
    }

    return response.json();
}

/**
 * Fetch a single procurement by ID
 */
export async function fetchProcurement(
    type: 'raw_material' | 'trading_good',
    id: string
): Promise<IProcurement> {
    const routeSegment = type === 'raw_material' ? 'raw-materials' : 'trading-goods';
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${API_BASE}/${routeSegment}/${id}`;

    const response = await fetch(url, {
        cache: 'no-store',
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Procurement not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch procurement (${response.status})`);
    }

    const data: ApiResponse<IProcurement> = await response.json();
    if (!data.success || !data.data) {
        throw new Error('Invalid response from server');
    }

    return data.data as IProcurement;
}

/**
 * Create a new procurement
 */
export async function createProcurement(
    type: 'raw_material' | 'trading_good',
    input: any
): Promise<ApiResponse<IProcurement>> {
    const routeSegment = type === 'raw_material' ? 'raw-materials' : 'trading-goods';
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${API_BASE}/${routeSegment}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    // Check valid JSON response
    let data;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error('Server returned invalid response');
    }

    if (!response.ok) {
        throw new Error(data.error || 'Failed to create procurement');
    }

    return data;
}

/**
 * Update a procurement
 */
export async function updateProcurement(
    type: 'raw_material' | 'trading_good',
    id: string,
    input: any
): Promise<ApiResponse<IProcurement>> {
    const routeSegment = type === 'raw_material' ? 'raw-materials' : 'trading-goods';
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${API_BASE}/${routeSegment}/${id}`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to update procurement');
    }

    return data;
}

/**
 * Delete a procurement
 */
export async function deleteProcurement(
    type: 'raw_material' | 'trading_good',
    id: string
): Promise<ApiResponse<void>> {
    const routeSegment = type === 'raw_material' ? 'raw-materials' : 'trading-goods';
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${API_BASE}/${routeSegment}/${id}`;

    const response = await fetch(url, {
        method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete procurement');
    }

    return data;
}
