/**
 * Status Badge Components
 *
 * Reusable status badges with consistent styling across the application
 * Includes generic StatusBadge plus specific variants for payments and assets
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Generic status color mapping using semantic tokens
 */
const statusColors: Record<string, string> = {
  // General statuses
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',

  // Payment statuses
  paid: 'bg-success/10 text-success border-success/20',
  fully_paid: 'bg-success/10 text-success border-success/20',
  partial: 'bg-warning/10 text-warning border-warning/20',
  partially_paid: 'bg-warning/10 text-warning border-warning/20',
  unpaid: 'bg-destructive/10 text-destructive border-destructive/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',

  // Asset statuses
  repair: 'bg-warning/10 text-warning border-warning/20',
  retired: 'bg-muted text-muted-foreground border-border',
  disposed: 'bg-destructive/10 text-destructive border-destructive/20',

  // Transaction types
  sale: 'bg-success/10 text-success border-success/20',
  purchase: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  expense: 'bg-orange-500/10 text-orange-500 border-orange-500/20',

  // Default
  default: 'bg-muted text-muted-foreground border-border',
};

const sizeClasses = {
  sm: 'text-[10px] h-5 px-1.5',
  md: 'text-xs h-6 px-2',
  lg: 'text-sm h-7 px-3',
};

function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  return statusColors[normalizedStatus] || statusColors.default;
}

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Generic StatusBadge - works for any status type
 */
export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        getStatusColor(status),
        sizeClasses[size],
        'font-medium capitalize transition-colors duration-200',
        className
      )}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}

/**
 * PaymentStatusBadge - specifically styled for payment statuses
 */
export function PaymentStatusBadge({
  status,
  className,
  size = 'md'
}: StatusBadgeProps) {
  // Map common payment status variations
  const normalizedStatus = status.toLowerCase();
  let displayStatus = status;

  if (normalizedStatus === 'fully_paid' || normalizedStatus === 'paid') {
    displayStatus = 'Paid';
  } else if (normalizedStatus === 'partially_paid' || normalizedStatus === 'partial') {
    displayStatus = 'Partial';
  } else if (normalizedStatus === 'unpaid') {
    displayStatus = 'Unpaid';
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        getStatusColor(status),
        sizeClasses[size],
        'font-medium capitalize transition-colors duration-200',
        className
      )}
      aria-label={`Payment status: ${displayStatus}`}
    >
      {displayStatus}
    </Badge>
  );
}

/**
 * AssetStatusBadge - specifically styled for asset statuses
 */
export function AssetStatusBadge({
  status,
  className,
  size = 'md'
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        getStatusColor(status),
        sizeClasses[size],
        'font-medium capitalize transition-colors duration-200',
        className
      )}
      aria-label={`Asset status: ${formatStatusLabel(status)}`}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}

/**
 * TransactionTypeBadge - for transaction types (sale, purchase, expense)
 */
export function TransactionTypeBadge({
  status,
  className,
  size = 'md'
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        getStatusColor(status),
        sizeClasses[size],
        'font-medium capitalize transition-colors duration-200',
        className
      )}
      aria-label={`Transaction type: ${formatStatusLabel(status)}`}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
