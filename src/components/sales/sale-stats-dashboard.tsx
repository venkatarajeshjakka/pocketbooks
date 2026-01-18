'use client';

import { useSaleStats } from '@/lib/hooks/use-sales';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    TrendingUp,
    CreditCard,
    AlertCircle,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
    color: 'primary' | 'success' | 'warning' | 'destructive';
    isLoading?: boolean;
    delay?: number;
}

function StatCard({ title, value, icon: Icon, description, trend, color, isLoading, delay = 0 }: StatCardProps) {
    const colorStyles = {
        primary: 'bg-primary/10 text-primary border-primary/20 shadow-primary/5',
        success: 'bg-success/10 text-success border-success/20 shadow-success/5',
        warning: 'bg-warning/10 text-warning border-warning/20 shadow-warning/5',
        destructive: 'bg-destructive/10 text-destructive border-destructive/20 shadow-destructive/5',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <Card className={cn(
                "relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:border-border/60 group",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-transparent before:to-transparent hover:before:from-primary/5 transition-all"
            )}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className={cn("p-3 rounded-2xl border transition-all duration-500 group-hover:scale-110", colorStyles[color])}>
                            <Icon className="h-6 w-6" />
                        </div>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border",
                                trend.isUp ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                {trend.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {trend.value}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground/60">{title}</p>
                        {isLoading ? (
                            <Skeleton className="h-9 w-24 rounded-lg" />
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-3xl font-black tracking-tight text-foreground">
                                    {value}
                                </h3>
                                {description && <span className="text-xs font-medium text-muted-foreground/40">{description}</span>}
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-500 w-0 group-hover:w-full bg-gradient-to-r",
                    color === 'primary' && "from-primary/50 to-primary",
                    color === 'success' && "from-success/50 to-success",
                    color === 'warning' && "from-warning/50 to-warning",
                    color === 'destructive' && "from-destructive/50 to-destructive"
                )} />
            </Card>
        </motion.div>
    );
}

export function SaleStatsDashboard() {
    const { data: statsData, isLoading, error } = useSaleStats();

    if (error) {
        return (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive p-6">
                <AlertCircle className="mr-2 h-5 w-5" />
                <p className="text-sm font-medium">Failed to load statistics</p>
            </div>
        );
    }

    const stats = statsData?.data || {
        totalValue: 0,
        totalPaid: 0,
        totalRemaining: 0,
        totalCount: 0
    };

    const formatCurrency = (val: number) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
        return `₹${val.toLocaleString('en-IN')}`;
    };

    const settlementPercentage = stats.totalValue > 0
        ? Math.round((stats.totalPaid / stats.totalValue) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalValue)}
                    icon={TrendingUp}
                    color="primary"
                    isLoading={isLoading}
                    delay={0.1}
                />
                <StatCard
                    title="Total Collected"
                    value={formatCurrency(stats.totalPaid)}
                    icon={CreditCard}
                    color="success"
                    description={`${settlementPercentage}%`}
                    isLoading={isLoading}
                    delay={0.2}
                />
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(stats.totalRemaining)}
                    icon={AlertCircle}
                    color="destructive"
                    isLoading={isLoading}
                    delay={0.3}
                />
                <StatCard
                    title="Sales Volume"
                    value={stats.totalCount}
                    icon={ShoppingCart}
                    color="warning"
                    description="orders"
                    isLoading={isLoading}
                    delay={0.4}
                />
            </div>

            {/* Performance Bar */}
            {!isLoading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                        <CardContent className="p-4 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Settlement Progress</span>
                                        <span className="text-sm font-black text-primary">{settlementPercentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${settlementPercentage}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                                            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full relative shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-stripe_2s_linear_infinite]" />
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-2 border-l border-border/20 pl-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Target</p>
                                    <p className="text-sm font-black text-foreground">100%</p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success border border-success/20">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
