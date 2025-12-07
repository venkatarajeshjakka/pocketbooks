'use client';

import { TrendingUp, DollarSign, Receipt } from 'lucide-react';
import { IClient } from '@/types';
import { cn } from '@/lib/utils';

interface MetricCardsRowProps {
  client: IClient;
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'success' | 'warning';
}

function MetricCard({ icon: Icon, label, value, subtext, variant = 'default' }: MetricCardProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-primary/10 dark:bg-primary/20',
      iconColor: 'text-primary',
      valueColor: 'text-foreground',
    },
    success: {
      iconBg: 'bg-green-100 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600 dark:text-green-400',
    },
    warning: {
      iconBg: 'bg-orange-100 dark:bg-orange-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={cn('rounded-xl p-2.5 sm:p-3', styles.iconBg)}>
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
          <p className={cn('text-xl sm:text-2xl font-bold tracking-tight', styles.valueColor)}>
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MetricCardsRow({ client }: MetricCardsRowProps) {
  const hasOutstanding = client.outstandingBalance > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Revenue - Placeholder for now */}
      <MetricCard
        icon={TrendingUp}
        label="Total Revenue"
        value="₹0"
        subtext="All time revenue"
        variant="default"
      />

      {/* Outstanding Balance */}
      <MetricCard
        icon={DollarSign}
        label="Outstanding Balance"
        value={`₹${client.outstandingBalance.toLocaleString('en-IN')}`}
        subtext={hasOutstanding ? 'Payment pending' : 'All settled'}
        variant={hasOutstanding ? 'warning' : 'success'}
      />

      {/* Last Invoice - Placeholder */}
      <MetricCard
        icon={Receipt}
        label="Last Invoice"
        value="—"
        subtext="No invoices yet"
        variant="default"
      />
    </div>
  );
}
