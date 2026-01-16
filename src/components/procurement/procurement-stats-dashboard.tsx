/**
 * ProcurementStatsDashboard Component
 * Server Component that displays aggregated procurement metrics
 */

import { StatCard } from '@/components/shared/stats/stat-card';
import { connectToDatabase } from '@/lib/api-helpers';
import RawMaterialProcurement from '@/models/RawMaterialProcurement';
import TradingGoodsProcurement from '@/models/TradingGoodsProcurement';

async function fetchProcurementStats() {
    try {
        await connectToDatabase();

        const [
            rawMaterialStats,
            tradingGoodsStats
        ] = await Promise.all([
            RawMaterialProcurement.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$gstBillPrice' },
                        totalPaid: { $sum: '$totalPaid' },
                        totalRemaining: { $sum: '$remainingAmount' }
                    }
                }
            ]),
            TradingGoodsProcurement.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$gstBillPrice' },
                        totalPaid: { $sum: '$totalPaid' },
                        totalRemaining: { $sum: '$remainingAmount' }
                    }
                }
            ])
        ]);

        const rm = rawMaterialStats[0] || { totalValue: 0, totalPaid: 0, totalRemaining: 0 };
        const tg = tradingGoodsStats[0] || { totalValue: 0, totalPaid: 0, totalRemaining: 0 };

        return {
            totalValue: rm.totalValue + tg.totalValue,
            totalPaid: rm.totalPaid + tg.totalPaid,
            totalRemaining: rm.totalRemaining + tg.totalRemaining,
            totalOrders: (await RawMaterialProcurement.countDocuments()) + (await TradingGoodsProcurement.countDocuments())
        };
    } catch (error) {
        console.error('Failed to fetch procurement stats:', error);
        return {
            totalValue: 0,
            totalPaid: 0,
            totalRemaining: 0,
            totalOrders: 0
        };
    }
}

export async function ProcurementStatsDashboard() {
    const stats = await fetchProcurementStats();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Procurement"
                value={`₹${stats.totalValue.toLocaleString('en-IN')}`}
                subtitle="All time purchase value"
                icon="ShoppingCart"
                gradient="primary"
                delay={0}
            />
            <StatCard
                title="Total Paid"
                value={`₹${stats.totalPaid.toLocaleString('en-IN')}`}
                subtitle="Payments cleared"
                icon="CreditCard"
                gradient="success"
                delay={0.1}
            />
            <StatCard
                title="Outstanding"
                value={`₹${stats.totalRemaining.toLocaleString('en-IN')}`}
                subtitle="Pending to vendors"
                icon="IndianRupee"
                gradient="warning"
                delay={0.2}
            />
            <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                subtitle="RM & Trading Goods"
                icon="Package"
                gradient="secondary"
                delay={0.3}
            />
        </div>
    );
}

// Note: Procurement icon isn't in StatCard iconMap yet, using ShoppingCart if available or Package.
// Actually StatCard iconMap is limited. Let's fix StatCard too.
