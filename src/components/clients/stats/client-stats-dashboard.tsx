/**
 * ClientStatsDashboard Component
 * Server Component that displays aggregated client metrics
 */

import { Users, UserCheck, UserX, IndianRupee } from 'lucide-react';
import { StatCard } from './stat-card';
import { fetchClientStats } from '@/lib/api/client-stats';

export async function ClientStatsDashboard() {
  const stats = await fetchClientStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Clients"
        value={stats.totalClients}
        subtitle="All registered clients"
        icon={Users}
        gradient="blue"
        delay={0}
      />
      <StatCard
        title="Active Clients"
        value={stats.activeClients}
        subtitle={`${stats.inactiveClients} inactive`}
        icon={UserCheck}
        gradient="green"
        delay={0.1}
      />
      <StatCard
        title="Outstanding Balance"
        value={`₹${stats.totalOutstanding.toLocaleString('en-IN')}`}
        subtitle={`${stats.clientsWithOutstanding} clients`}
        icon={IndianRupee}
        gradient="purple"
        delay={0.2}
      />
      <StatCard
        title="Average Outstanding"
        value={`₹${Math.round(stats.averageOutstanding).toLocaleString('en-IN')}`}
        subtitle="Per client with balance"
        icon={IndianRupee}
        gradient="pink"
        delay={0.3}
      />
    </div>
  );
}
