/**
 * PaymentStatsDashboard Component
 * Server Component that displays aggregated payment metrics
 * Synchronized with AssetStatsDashboard design
 */

import { StatCard } from '@/components/shared/stats/stat-card';
import Payment from '@/models/Payment';
import { connectToDatabase } from '@/lib/api-helpers';

export async function PaymentStatsDashboard() {
    try {
        await connectToDatabase();

        // Aggregations to get useful statistics (matching API logic)
        const statsResult = await Payment.aggregate([
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: '$amount' },
                                totalCount: { $sum: 1 },
                                avgAmount: { $avg: '$amount' }
                            }
                        }
                    ],
                    byTransactionType: [
                        {
                            $group: {
                                _id: '$transactionType',
                                totalAmount: { $sum: '$amount' },
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = statsResult[0];
        const totalAmount = result.totalStats[0]?.totalAmount || 0;
        const totalCount = result.totalStats[0]?.totalCount || 0;
        const avgAmount = result.totalStats[0]?.avgAmount || 0;

        const byType = result.byTransactionType.reduce((acc: any, item: any) => {
            acc[item._id] = { amount: item.totalAmount, count: item.count };
            return acc;
        }, {});

        const incomeAmount = byType?.income?.amount || 0;
        const expenseAmount = byType?.expense?.amount || 0;
        const purchaseAmount = byType?.purchase?.amount || 0;
        const outflowAmount = expenseAmount + purchaseAmount;

        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Volume"
                    value={`₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    subtitle={`${totalCount} Total transactions`}
                    icon="IndianRupee"
                    gradient="primary"
                    delay={0}
                />
                <StatCard
                    title="Total Income"
                    value={`₹${incomeAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    subtitle="Revenue & Sales"
                    icon="TrendingUp"
                    gradient="success"
                    delay={0.1}
                />
                <StatCard
                    title="Total Expenses"
                    value={`₹${outflowAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    subtitle="Exp. & Purchases"
                    icon="CreditCard"
                    gradient="secondary"
                    delay={0.2}
                />
                <StatCard
                    title="Avg. Transaction"
                    value={`₹${avgAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    subtitle="Per single record"
                    icon="PiggyBank"
                    gradient="warning"
                    delay={0.3}
                />
            </div>
        );
    } catch (error) {
        console.error('Failed to load payment stats:', error);
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Volume" value="₹0" icon="IndianRupee" gradient="primary" />
                <StatCard title="Total Income" value="₹0" icon="TrendingUp" gradient="success" />
                <StatCard title="Total Expenses" value="₹0" icon="CreditCard" gradient="secondary" />
                <StatCard title="Avg. Transaction" value="₹0" icon="PiggyBank" gradient="warning" />
            </div>
        );
    }
}
