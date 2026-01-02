/**
 * VendorStatsDashboard Component
 * Server Component that displays aggregated vendor metrics
 * Reuses the StatCard component from clients
 */

import { StatCard } from '@/components/clients/stats/stat-card';
import { fetchVendorStats } from '@/lib/api/vendor-stats';

export async function VendorStatsDashboard() {
  const stats = await fetchVendorStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Vendors"
        value={stats.totalVendors}
        subtitle="All registered vendors"
        icon="Users"
        gradient="primary"
        delay={0}
      />
      <StatCard
        title="Active Vendors"
        value={stats.activeVendors}
        subtitle={`${stats.inactiveVendors} inactive`}
        icon="UserCheck"
        gradient="success"
        delay={0.1}
      />
      <StatCard
        title="Total Payable"
        value={`\u20B9${stats.totalPayable.toLocaleString('en-IN')}`}
        subtitle={`${stats.vendorsWithPayable} vendors`}
        icon="IndianRupee"
        gradient="warning"
        delay={0.2}
      />
      <StatCard
        title="Average Payable"
        value={`\u20B9${Math.round(stats.averagePayable).toLocaleString('en-IN')}`}
        subtitle="Per vendor with balance"
        icon="IndianRupee"
        gradient="secondary"
        delay={0.3}
      />
    </div>
  );
}
