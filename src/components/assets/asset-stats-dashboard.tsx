/**
 * AssetStatsDashboard Component
 * Server Component that displays aggregated asset metrics
 * Directly queries the database for better performance
 */

import { StatCard } from '@/components/shared/stats/stat-card';
import { fetchAssetStats } from '@/lib/api/assets';

export async function AssetStatsDashboard() {
  try {
    const stats = await fetchAssetStats();

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          subtitle="All registered assets"
          icon="Monitor"
          gradient="primary"
          delay={0}
        />
        <StatCard
          title="Active Assets"
          value={stats.activeAssets}
          subtitle={`${stats.inRepairAssets} in repair, ${stats.retiredAssets} retired`}
          icon="CheckCircle"
          gradient="success"
          delay={0.1}
        />
        <StatCard
          title="Total Investment"
          value={`₹${stats.totalInvestment.toLocaleString('en-IN')}`}
          subtitle="Original purchase value"
          icon="IndianRupee"
          gradient="warning"
          delay={0.2}
        />
        <StatCard
          title="Current Value"
          value={`₹${stats.currentValue.toLocaleString('en-IN')}`}
          subtitle={`₹${stats.depreciation.toLocaleString('en-IN')} depreciation`}
          icon="TrendingUp"
          gradient="secondary"
          delay={0.3}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to load asset stats:', error);

    // Return fallback UI with zero stats
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={0}
          subtitle="All registered assets"
          icon="Monitor"
          gradient="primary"
          delay={0}
        />
        <StatCard
          title="Active Assets"
          value={0}
          subtitle="0 in repair, 0 retired"
          icon="CheckCircle"
          gradient="success"
          delay={0.1}
        />
        <StatCard
          title="Total Investment"
          value="₹0"
          subtitle="Original purchase value"
          icon="IndianRupee"
          gradient="warning"
          delay={0.2}
        />
        <StatCard
          title="Current Value"
          value="₹0"
          subtitle="₹0 depreciation"
          icon="TrendingUp"
          gradient="secondary"
          delay={0.3}
        />
      </div>
    );
  }
}
