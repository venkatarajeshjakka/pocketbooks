'use client';

import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SalesHistoryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Illustration */}
      <div className="rounded-full bg-[var(--saas-canvas)] p-6 mb-4">
        <ShoppingCart className="h-12 w-12 text-[var(--saas-subtle)]" />
      </div>

      {/* Text */}
      <h4 className="text-base font-medium text-[var(--saas-heading)] mb-1">
        No sales history
      </h4>
      <p className="text-sm text-[var(--saas-muted)] max-w-sm mb-6">
        Sales transactions with this client will appear here once you create sales orders.
      </p>

      {/* CTA */}
      <Button
        className="bg-[var(--saas-accent)] hover:bg-[var(--saas-accent-dark)] text-white rounded-lg"
        disabled
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Sale
      </Button>
      <p className="text-xs text-[var(--saas-subtle)] mt-2">Coming soon</p>
    </div>
  );
}
