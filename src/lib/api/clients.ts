/**
 * Client API Helper Functions
 *
 * Centralized functions for client-related API calls
 */

import { IClient, IClientInput, ApiResponse, PaginatedResponse } from '@/types';

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

  const url = `${API_BASE}?${searchParams.toString()}`;

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
  const response = await fetch(`${API_BASE}/${id}`, {
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
  const response = await fetch(API_BASE, {
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
  const response = await fetch(`${API_BASE}/${id}`, {
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
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  const data: ApiResponse<void> = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete client');
  }

  return data;
}
