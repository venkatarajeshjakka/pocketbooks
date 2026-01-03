/**
 * Payment Stats Dashboard Component
 */

'use client';

import { usePaymentStats } from '@/lib/hooks/use-payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PaymentStatsDashboard() {
    const { data: stats, isLoading } = usePaymentStats();

    if (isLoading) {
        return <StatsSkeleton />;
    }

    if (!stats) {
        return null;
    }

    const { totalAmount, totalCount, byTransactionType } = stats;

    // Calculate percentages or defaults
    const incomeAmount = byTransactionType?.income?.amount || 0;
    const expenseAmount = byTransactionType?.expense?.amount || 0;
    const purchaseAmount = byTransactionType?.purchase?.amount || 0;

    // Total outflow (expense + purchase)
    const outflowAmount = expenseAmount + purchaseAmount;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Total Volume"
                value={totalAmount}
                icon={IndianRupee}
                description={`${totalCount} transactions`}
                trend="neutral"
            />
            <StatsCard
                title="Total Income"
                value={incomeAmount}
                icon={TrendingUp}
                description="Revenue & Sales"
                trend="up"
                className="text-success"
            />
            <StatsCard
                title="Total Expenses"
                value={outflowAmount}
                icon={ArrowDownRight}
                description="Expenses & Purchases"
                trend="down"
                className="text-destructive"
            />
            <StatsCard
                title="Avg. Transaction"
                value={stats.avgAmount || 0}
                icon={CreditCard}
                description="Per transaction"
                trend="neutral"
            />
        </div>
    );
}

function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className
}: {
    title: string;
    value: number;
    icon: any;
    description: string;
    trend: 'up' | 'down' | 'neutral';
    className?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${className}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${className}`}>
                    ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-[120px] mb-2" />
                        <Skeleton className="h-3 w-[80px]" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
