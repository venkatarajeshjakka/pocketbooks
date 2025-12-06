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
  gradient: 'blue' | 'purple' | 'pink' | 'green';
  delay?: number;
}

const gradientClasses = {
  blue: 'from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/10',
  purple:
    'from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/10',
  pink: 'from-pink-500/10 via-pink-500/5 to-transparent dark:from-pink-500/20 dark:via-pink-500/10',
  green:
    'from-green-500/10 via-green-500/5 to-transparent dark:from-green-500/20 dark:via-green-500/10',
};

const iconBgClasses = {
  blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  pink: 'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
  green: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
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
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg"
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
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          {/* Icon */}
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110',
              iconBgClasses[gradient]
            )}
          >
            <Icon className="h-6 w-6" />
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
