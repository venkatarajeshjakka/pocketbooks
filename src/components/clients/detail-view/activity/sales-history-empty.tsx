'use client';

import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SalesHistoryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      {/* Illustration */}
      <div className="rounded-full bg-muted p-4 sm:p-6 mb-4">
        <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
      </div>

      {/* Text */}
      <h4 className="text-base font-medium text-foreground mb-1">
        No sales history
      </h4>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Sales transactions with this client will appear here once you create sales orders.
      </p>

      {/* CTA */}
      <Button disabled>
        <Plus className="mr-2 h-4 w-4" />
        Create Sale
      </Button>
      <p className="text-xs text-muted-foreground/70 mt-2">Coming soon</p>
    </div>
  );
}
