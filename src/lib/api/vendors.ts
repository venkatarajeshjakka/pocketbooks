/**
 * Vendor API Helper Functions
 *
 * Centralized functions for vendor-related API calls
 * Mirrors the client API structure for consistency
 */

import { IVendor, IVendorInput, ApiResponse, PaginatedResponse } from '@/types';

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

const API_BASE = '/api/vendors';

export interface FetchVendorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Fetch all vendors with pagination and filters
 */
export async function fetchVendors(
  params: FetchVendorsParams = {}
): Promise<PaginatedResponse<IVendor>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${API_BASE}?${searchParams.toString()}`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendors');
  }

  return response.json();
}

/**
 * Fetch a single vendor by ID
 */
export async function fetchVendor(id: string): Promise<IVendor> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Vendor not found');
    }
    throw new Error('Failed to fetch vendor');
  }

  const data: ApiResponse<IVendor> = await response.json();
  if (!data.success || !data.data) {
    throw new Error('Invalid response from server');
  }

  return data.data;
}

/**
 * Create a new vendor
 */
export async function createVendor(
  input: IVendorInput
): Promise<ApiResponse<IVendor>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<IVendor> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create vendor');
  }

  return data;
}

/**
 * Update an existing vendor
 */
export async function updateVendor(
  id: string,
  input: IVendorInput
): Promise<ApiResponse<IVendor>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<IVendor> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update vendor');
  }

  return data;
}

/**
 * Delete a vendor
 */
export async function deleteVendor(id: string): Promise<ApiResponse<void>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  const data: ApiResponse<void> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete vendor');
  }

  return data;
}
