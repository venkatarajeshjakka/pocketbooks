'use client';

import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentHistoryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Illustration */}
      <div className="rounded-full bg-[var(--saas-canvas)] p-6 mb-4">
        <CreditCard className="h-12 w-12 text-[var(--saas-subtle)]" />
      </div>

      {/* Text */}
      <h4 className="text-base font-medium text-[var(--saas-heading)] mb-1">
        No payment history
      </h4>
      <p className="text-sm text-[var(--saas-muted)] max-w-sm mb-6">
        Payment transactions will appear here once you start recording payments for this client.
      </p>

      {/* CTA */}
      <Button
        className="bg-[var(--saas-accent)] hover:bg-[var(--saas-accent-dark)] text-white rounded-lg"
        disabled
      >
        <Plus className="mr-2 h-4 w-4" />
        Record Payment
      </Button>
      <p className="text-xs text-[var(--saas-subtle)] mt-2">Coming soon</p>
    </div>
  );
}
