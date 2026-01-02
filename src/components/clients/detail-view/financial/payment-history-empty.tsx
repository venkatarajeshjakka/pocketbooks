'use client';

import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentHistoryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      {/* Illustration */}
      <div className="rounded-full bg-muted p-4 sm:p-6 mb-4">
        <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
      </div>

      {/* Text */}
      <h4 className="text-base font-medium text-foreground mb-1">
        No payment history
      </h4>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Payment transactions will appear here once you start recording payments for this client.
      </p>

      {/* CTA */}
      <Button disabled>
        <Plus className="mr-2 h-4 w-4" />
        Record Payment
      </Button>
      <p className="text-xs text-muted-foreground/70 mt-2">Coming soon</p>
    </div>
  );
}
