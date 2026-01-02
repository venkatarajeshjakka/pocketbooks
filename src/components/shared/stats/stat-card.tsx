/**
 * StatCard Component
 * Individual metric card with gradient backgrounds and animations
 */

'use client';

import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, IndianRupee } from 'lucide-react';
import { fadeInUp } from '@/lib/utils/animation-variants';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: 'Users' | 'UserCheck' | 'UserX' | 'IndianRupee';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient: 'primary' | 'secondary' | 'warning' | 'success';
    delay?: number;
}

const gradientClasses = {
    primary: 'from-primary/20 via-primary/10 to-transparent',
    secondary: 'from-secondary/30 via-secondary/15 to-transparent',
    warning: 'from-warning/30 via-warning/15 to-transparent',
    success: 'from-success/20 via-success/10 to-transparent',
};

const iconBgClasses = {
    primary: 'bg-primary/15 text-primary',
    secondary: 'bg-secondary/15 text-secondary',
    warning: 'bg-warning/15 text-warning',
    success: 'bg-success/15 text-success',
};

const iconMap = {
    Users,
    UserCheck,
    UserX,
    IndianRupee,
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
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-lg"
        >
            {/* Gradient Background */}
            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100',
                    gradientClasses[gradient]
                )}
            />

            {/* Content */}
            <div className="relative p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</p>
                        <div className="mt-3 flex items-baseline gap-2">
                            <h3 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{value}</h3>
                            {trend && (
                                <span
                                    className={cn(
                                        'text-sm font-bold',
                                        trend.isPositive ? 'text-success' : 'text-destructive'
                                    )}
                                >
                                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="mt-2 text-xs font-medium text-muted-foreground/70">{subtitle}</p>}
                    </div>

                    {/* Icon */}
                    <div
                        className={cn(
                            'flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl',
                            iconBgClasses[gradient]
                        )}
                    >
                        <Icon className="h-7 w-7" />
                    </div>
                </div>
            </div>

            {/* Shine effect on hover */}
            <motion.div
                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                }}
                animate={{
                    x: ['-100%', '200%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                }}
            />
        </motion.div>
    );
}
