/**
 * StatCard Component
 * Individual metric card with gradient backgrounds and animations
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
    Monitor,
    CreditCard,
    PiggyBank
} from 'lucide-react';
import { fadeInUp } from '@/lib/utils/animation-variants';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: 'Users' | 'UserCheck' | 'UserX' | 'IndianRupee' | 'Package' | 'CheckCircle' | 'TrendingUp' | 'Monitor' | 'CreditCard' | 'PiggyBank';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient: 'primary' | 'secondary' | 'warning' | 'success';
    delay?: number;
}

const iconAccentClasses = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    success: 'text-success bg-success/10 border-success/20',
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
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/40 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/5"
        >
            {/* Content */}
            <div className="relative p-6 px-7">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{title}</p>
                        <div className="mt-4 flex items-baseline gap-2">
                            <h3 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                                {value}
                            </h3>
                            {trend && (
                                <div
                                    className={cn(
                                        'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
                                        trend.isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                                    )}
                                >
                                    <span>{trend.isPositive ? '↑' : '↓'}</span>
                                    <span>{Math.abs(trend.value)}%</span>
                                </div>
                            )}
                        </div>
                        {subtitle && <p className="mt-2 text-xs font-semibold text-muted-foreground/40">{subtitle}</p>}
                    </div>

                    {/* Icon Container */}
                    <div
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm',
                            iconAccentClasses[gradient]
                        )}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Subtle Inner Glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent dark:from-white/2" />
        </motion.div>
    );
}
