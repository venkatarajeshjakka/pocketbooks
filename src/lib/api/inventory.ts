import { ApiResponse, PaginatedResponse, IRawMaterial, ITradingGood, IFinishedGood } from '@/types';

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

const baseUrl = getBaseUrl();

// ============================================================================
// RAW MATERIALS
// ============================================================================

export async function fetchRawMaterials(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<IRawMaterial>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await fetch(`${baseUrl}/api/inventory/raw-materials?${searchParams.toString()}`);
    return response.json();
}

export async function fetchRawMaterial(id: string): Promise<ApiResponse<IRawMaterial>> {
    const response = await fetch(`${baseUrl}/api/inventory/raw-materials/${id}`);
    return response.json();
}

export async function createRawMaterial(data: any): Promise<ApiResponse<IRawMaterial>> {
    const response = await fetch(`${baseUrl}/api/inventory/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create raw material');
    }
    return response.json();
}

export async function updateRawMaterial(id: string, data: any): Promise<ApiResponse<IRawMaterial>> {
    const response = await fetch(`${baseUrl}/api/inventory/raw-materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update raw material');
    }
    return response.json();
}

export async function deleteRawMaterial(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${baseUrl}/api/inventory/raw-materials/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete raw material');
    }
    return response.json();
}

// ============================================================================
// TRADING GOODS
// ============================================================================

export async function fetchTradingGoods(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<ITradingGood>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await fetch(`${baseUrl}/api/inventory/trading-goods?${searchParams.toString()}`);
    return response.json();
}

export async function fetchTradingGood(id: string): Promise<ApiResponse<ITradingGood>> {
    const response = await fetch(`${baseUrl}/api/inventory/trading-goods/${id}`);
    return response.json();
}

export async function createTradingGood(data: any): Promise<ApiResponse<ITradingGood>> {
    const response = await fetch(`${baseUrl}/api/inventory/trading-goods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create trading good');
    }
    return response.json();
}

export async function updateTradingGood(id: string, data: any): Promise<ApiResponse<ITradingGood>> {
    const response = await fetch(`${baseUrl}/api/inventory/trading-goods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update trading good');
    }
    return response.json();
}

export async function deleteTradingGood(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${baseUrl}/api/inventory/trading-goods/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete trading good');
    }
    return response.json();
}

// ============================================================================
// FINISHED GOODS
// ============================================================================

export async function fetchFinishedGoods(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<IFinishedGood>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await fetch(`${baseUrl}/api/inventory/finished-goods?${searchParams.toString()}`);
    return response.json();
}

export async function fetchFinishedGood(id: string): Promise<ApiResponse<IFinishedGood>> {
    const response = await fetch(`${baseUrl}/api/inventory/finished-goods/${id}`);
    return response.json();
}

export async function createFinishedGood(data: any): Promise<ApiResponse<IFinishedGood>> {
    const response = await fetch(`${baseUrl}/api/inventory/finished-goods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create finished good');
    }
    return response.json();
}

export async function updateFinishedGood(id: string, data: any): Promise<ApiResponse<IFinishedGood>> {
    const response = await fetch(`${baseUrl}/api/inventory/finished-goods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update finished good');
    }
    return response.json();
}

export async function deleteFinishedGood(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${baseUrl}/api/inventory/finished-goods/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete finished good');
    }
    return response.json();
}
