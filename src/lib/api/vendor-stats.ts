/**
 * Vendor Statistics API Functions
 * Calculates and returns aggregated vendor metrics
 */

import { fetchVendors } from './vendors';

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  totalPayable: number;
  averagePayable: number;
  vendorsWithPayable: number;
}

/**
 * Fetch aggregated vendor statistics
 */
export async function fetchVendorStats(): Promise<VendorStats> {
  try {
    // Fetch all vendors
    const response = await fetchVendors({ limit: 1000 });
    const vendors = response.data;

    const stats: VendorStats = {
      totalVendors: vendors.length,
      activeVendors: vendors.filter((v) => v.status === 'active').length,
      inactiveVendors: vendors.filter((v) => v.status === 'inactive').length,
      totalPayable: vendors.reduce((sum, v) => sum + (v.outstandingPayable || 0), 0),
      averagePayable: 0,
      vendorsWithPayable: vendors.filter((v) => (v.outstandingPayable || 0) > 0).length,
    };

    stats.averagePayable =
      stats.vendorsWithPayable > 0
        ? stats.totalPayable / stats.vendorsWithPayable
        : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    // Return empty stats on error
    return {
      totalVendors: 0,
      activeVendors: 0,
      inactiveVendors: 0,
      totalPayable: 0,
      averagePayable: 0,
      vendorsWithPayable: 0,
    };
  }
}
