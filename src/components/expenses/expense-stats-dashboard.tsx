/**
 * Expense Stats Dashboard Component
 */

'use client';

import { useExpenseStats } from '@/lib/hooks/use-expenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, TrendingDown, ArrowDown, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ExpenseStatsDashboard() {
    const { data: stats, isLoading } = useExpenseStats();

    if (isLoading) {
        return <StatsSkeleton />;
    }

    if (!stats) {
        return null;
    }

    const { totalAmount, totalCount, avgAmount, thisMonth, lastMonth } = stats;

    // Calculate month-over-month change
    const monthChange = lastMonth > 0
        ? ((thisMonth - lastMonth) / lastMonth) * 100
        : thisMonth > 0 ? 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Total Expenses"
                value={totalAmount}
                icon={Receipt}
                description={`${totalCount} expenses recorded`}
                trend="neutral"
            />
            <StatsCard
                title="This Month"
                value={thisMonth}
                icon={Calendar}
                description={
                    monthChange !== 0
                        ? `${monthChange > 0 ? '+' : ''}${monthChange.toFixed(1)}% from last month`
                        : 'No change from last month'
                }
                trend={monthChange > 0 ? 'up' : monthChange < 0 ? 'down' : 'neutral'}
                className={monthChange > 0 ? 'text-destructive' : monthChange < 0 ? 'text-success' : ''}
            />
            <StatsCard
                title="Last Month"
                value={lastMonth}
                icon={TrendingDown}
                description="Previous month total"
                trend="neutral"
            />
            <StatsCard
                title="Avg. Expense"
                value={avgAmount}
                icon={ArrowDown}
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
    icon: React.ElementType;
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
                    {'\u20B9'}{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
