/**
 * Asset API Helper Functions
 *
 * Centralized functions for asset-related API calls
 * Mirrors the vendor API structure for consistency
 */

import { IAsset, IAssetInput, ApiResponse, PaginatedResponse } from '@/types';

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

const API_BASE = '/api/assets';

export interface FetchAssetsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch all assets with pagination and filters
 */
export async function fetchAssets(
  params: FetchAssetsParams = {}
): Promise<PaginatedResponse<IAsset>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.category) searchParams.set('category', params.category);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${API_BASE}?${searchParams.toString()}`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch assets');
  }

  return response.json();
}

/**
 * Fetch a single asset by ID
 */
export async function fetchAsset(id: string): Promise<IAsset> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Asset not found');
    }
    throw new Error('Failed to fetch asset');
  }

  const data: ApiResponse<IAsset> = await response.json();
  if (!data.success || !data.data) {
    throw new Error('Invalid response from server');
  }

  return data.data;
}

/**
 * Create a new asset
 */
export async function createAsset(
  input: IAssetInput
): Promise<ApiResponse<IAsset>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<IAsset> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create asset');
  }

  return data;
}

/**
 * Update an existing asset
 */
export async function updateAsset(
  id: string,
  input: Partial<IAssetInput>
): Promise<ApiResponse<IAsset>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<IAsset> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update asset');
  }

  return data;
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: string): Promise<ApiResponse<void>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  const data: ApiResponse<void> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete asset');
  }

  return data;
}

/**
 * Fetch asset statistics for dashboard
 */
export async function fetchAssetStats(): Promise<{
  totalAssets: number;
  activeAssets: number;
  inRepairAssets: number;
  retiredAssets: number;
  totalInvestment: number;
  currentValue: number;
  depreciation: number;
  assetsByCategory: { category: string; count: number; value: number }[];
}> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}?limit=1000`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch asset statistics');
  }

  const result: PaginatedResponse<IAsset> = await response.json();
  const assets = result.data || [];

  // Calculate statistics
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const inRepairAssets = assets.filter(a => a.status === 'repair').length;
  const retiredAssets = assets.filter(a => a.status === 'retired' || a.status === 'disposed').length;
  const totalInvestment = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const currentValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
  const depreciation = totalInvestment - currentValue;

  // Group by category
  const categoryMap = new Map<string, { count: number; value: number }>();
  assets.forEach(asset => {
    const existing = categoryMap.get(asset.category) || { count: 0, value: 0 };
    categoryMap.set(asset.category, {
      count: existing.count + 1,
      value: existing.value + (asset.currentValue || 0),
    });
  });

  const assetsByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    value: data.value,
  }));

  return {
    totalAssets,
    activeAssets,
    inRepairAssets,
    retiredAssets,
    totalInvestment,
    currentValue,
    depreciation,
    assetsByCategory,
  };
}
