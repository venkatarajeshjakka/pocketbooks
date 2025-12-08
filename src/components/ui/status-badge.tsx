/**
 * Status Badge Component
 *
 * Displays status with color-coded badge
 */

import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={`${getStatusColor(status)} transition-colors duration-200 ${className || ''}`} variant="secondary">
      {status.replace(/_/g, ' ').toUpperCase()}
    </Badge>
  );
}
