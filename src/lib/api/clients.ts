/**
 * Client API Helper Functions
 *
 * Centralized functions for client-related API calls
 */

import { IClient, IClientInput, ApiResponse, PaginatedResponse } from '@/types';

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

const API_BASE = '/api/clients';

export interface FetchClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Fetch all clients with pagination and filters
 */
export async function fetchClients(
  params: FetchClientsParams = {}
): Promise<PaginatedResponse<IClient>> {
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
    throw new Error('Failed to fetch clients');
  }

  return response.json();
}

/**
 * Fetch a single client by ID
 */
export async function fetchClient(id: string): Promise<IClient> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Client not found');
    }
    throw new Error('Failed to fetch client');
  }

  const data: ApiResponse<IClient> = await response.json();
  if (!data.success || !data.data) {
    throw new Error('Invalid response from server');
  }

  return data.data;
}

/**
 * Create a new client
 */
export async function createClient(
  input: IClientInput
): Promise<ApiResponse<IClient>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<IClient> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create client');
  }

  return data;
}

/**
 * Update an existing client
 */
export async function updateClient(
  id: string,
  input: IClientInput
): Promise<ApiResponse<IClient>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<IClient> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update client');
  }

  return data;
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<ApiResponse<void>> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  const data: ApiResponse<void> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete client');
  }

  return data;
}
