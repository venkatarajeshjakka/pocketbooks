/**
 * StatCard Component
 * Individual metric card with refined financial styling
 */

'use client';

import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    UserX,
    IndianRupee,
    Package,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Monitor,
    CreditCard,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart
} from 'lucide-react';
import { fadeInUp } from '@/lib/utils/animation-variants';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: 'Users' | 'UserCheck' | 'UserX' | 'IndianRupee' | 'Package' | 'CheckCircle' | 'TrendingUp' | 'Monitor' | 'CreditCard' | 'PiggyBank' | 'ShoppingCart';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient: 'primary' | 'secondary' | 'warning' | 'success';
    delay?: number;
}

const iconAccentClasses = {
    primary: 'text-primary bg-primary/10 ring-1 ring-primary/20',
    secondary: 'text-muted-foreground bg-muted ring-1 ring-border/50',
    warning: 'text-warning bg-warning/10 ring-1 ring-warning/20',
    success: 'text-success bg-success/10 ring-1 ring-success/20',
};

const iconMap = {
    Users,
    UserCheck,
    UserX,
    IndianRupee,
    Package,
    CheckCircle,
    TrendingUp,
    Monitor,
    CreditCard,
    PiggyBank,
    ShoppingCart,
};

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    gradient,
    delay = 0,
}: StatCardProps) {
    const Icon = iconMap[icon];
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay }}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-border"
        >
            {/* Content */}
            <div className="relative p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                {value}
                            </h3>
                            {trend && (
                                <div
                                    className={cn(
                                        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
                                        trend.isPositive
                                            ? 'bg-success/10 text-success'
                                            : 'bg-destructive/10 text-destructive'
                                    )}
                                >
                                    {trend.isPositive ? (
                                        <ArrowUpRight className="h-3 w-3" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3" />
                                    )}
                                    <span>{Math.abs(trend.value)}%</span>
                                </div>
                            )}
                        </div>
                        {subtitle && (
                            <p className="mt-1.5 text-xs text-muted-foreground/70">{subtitle}</p>
                        )}
                    </div>

                    {/* Icon Container */}
                    <div
                        className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
                            iconAccentClasses[gradient]
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
