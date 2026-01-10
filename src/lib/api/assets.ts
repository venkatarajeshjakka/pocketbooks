/**
 * Asset API Helper Functions
 */

import { IAsset, PaginatedResponse, ApiResponse } from '@/types';

const API_BASE = '/api/assets';

export async function fetchAssets(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
} = {}): Promise<PaginatedResponse<IAsset>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE}?${queryParams.toString()}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch assets');
    }
    
    return response.json();
}

export async function fetchAsset(id: string): Promise<ApiResponse<IAsset>> {
    const response = await fetch(`${API_BASE}/${id}`);
    
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
    // For server-side calls, we need to use the full URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/assets/stats`, {
        cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch asset stats');
    }
    
    const data = await response.json();
    return data.data;
}