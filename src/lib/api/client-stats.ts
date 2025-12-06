/**
 * Client Statistics API Functions
 * Calculates and returns aggregated client metrics
 */

import { IClient } from '@/types';
import { fetchClients } from './clients';

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalOutstanding: number;
  averageOutstanding: number;
  clientsWithOutstanding: number;
}

/**
 * Fetch aggregated client statistics
 */
export async function fetchClientStats(): Promise<ClientStats> {
  try {
    // Fetch all clients (we'll need to update the API to support stats endpoint later)
    const response = await fetchClients({ limit: 1000 });
    const clients = response.data;

    const stats: ClientStats = {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === 'active').length,
      inactiveClients: clients.filter((c) => c.status === 'inactive').length,
      totalOutstanding: clients.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0),
      averageOutstanding: 0,
      clientsWithOutstanding: clients.filter((c) => (c.outstandingBalance || 0) > 0).length,
    };

    stats.averageOutstanding =
      stats.clientsWithOutstanding > 0
        ? stats.totalOutstanding / stats.clientsWithOutstanding
        : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching client stats:', error);
    // Return empty stats on error
    return {
      totalClients: 0,
      activeClients: 0,
      inactiveClients: 0,
      totalOutstanding: 0,
      averageOutstanding: 0,
      clientsWithOutstanding: 0,
    };
  }
}
