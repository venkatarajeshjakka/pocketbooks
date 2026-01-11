/**
 * Asset API Helper Functions
 */

import { IAsset, PaginatedResponse, ApiResponse } from '@/types';

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

const API_BASE = '/api/assets';

export async function fetchAssets(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    paymentStatus?: string; // $ne logic needs to be handled in API route or here via specific params if API supports it.
    // Assuming API supports simple filtering. For complex query like $ne: 'fully_paid', we might need to update API route too.
    // Or we can just pass a flag like 'hasOutstanding'.
    hasOutstanding?: boolean;
} = {}): Promise<PaginatedResponse<IAsset>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.hasOutstanding) queryParams.append('hasOutstanding', 'true');

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}?${queryParams.toString()}`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch assets');
    }

    return response.json();
}

export async function fetchAsset(id: string): Promise<ApiResponse<IAsset>> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch asset');
    }

    return response.json();
}

export async function createAsset(data: any): Promise<ApiResponse<IAsset>> {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create asset');
    }

    return response.json();
}

export async function updateAsset(id: string, data: any): Promise<ApiResponse<IAsset>> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update asset');
    }

    return response.json();
}

export async function deleteAsset(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete asset');
    }

    return response.json();
}

export async function fetchAssetStats(): Promise<{
    totalAssets: number;
    activeAssets: number;
    inRepairAssets: number;
    retiredAssets: number;
    totalInvestment: number;
    currentValue: number;
    depreciation: number;
}> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/assets/stats`, {
        cache: 'no-store' // Ensure fresh data
    });

    if (!response.ok) {
        throw new Error('Failed to fetch asset stats');
    }

    const data = await response.json();
    return data.data;
}
