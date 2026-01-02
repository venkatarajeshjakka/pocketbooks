/**
 * AssetStats Component
 */

import { StatCard } from '@/components/shared/stats/stat-card';
import { IAsset, AssetStatus } from '@/types';

interface AssetStatsProps {
    assets: IAsset[];
}

export function AssetStats({ assets }: AssetStatsProps) {
    const totalAssets = assets.length;
    const activeAssets = assets.filter(a => a.status === AssetStatus.ACTIVE).length;
    const totalValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
    const totalInvestment = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Assets"
                value={totalAssets}
                subtitle="All recorded assets"
                icon="Package"
                gradient="primary"
                delay={0}
            />
            <StatCard
                title="Active Assets"
                value={activeAssets}
                subtitle={`${totalAssets - activeAssets} maintenance/retired`}
                icon="CheckCircle"
                gradient="success"
                delay={0.1}
            />
            <StatCard
                title="Total Investment"
                value={`₹${totalInvestment.toLocaleString('en-IN')}`}
                subtitle="Original purchase price"
                icon="IndianRupee"
                gradient="warning"
                delay={0.2}
            />
            <StatCard
                title="Current Value"
                value={`₹${totalValue.toLocaleString('en-IN')}`}
                subtitle="Estimated current value"
                icon="TrendingUp"
                gradient="secondary"
                delay={0.3}
            />
        </div>
    );
}
