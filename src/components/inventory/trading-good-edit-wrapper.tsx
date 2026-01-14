'use client';

import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { TradingGoodForm } from './trading-good-form';
import { useTradingGood } from '@/lib/hooks/use-inventory-items';

interface TradingGoodEditWrapperProps {
  id: string;
}

export function TradingGoodEditWrapper({ id }: TradingGoodEditWrapperProps) {
  const { data: good, isLoading, error } = useTradingGood(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !good) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-destructive/10 p-8 border border-destructive/20">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">Failed to load trading good. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Back Button */}
      <Link
        href={`/inventory/trading-goods/${id}`}
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
          <ChevronLeft className="h-4 w-4" />
        </div>
        Back to Details
      </Link>

      {/* Page Title */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
        <h1 className="text-4xl font-extrabold tracking-tight">Edit Trading Good</h1>
        <p className="text-base text-muted-foreground mt-2">
          Update the details of {good.name}
        </p>
      </div>

      {/* Form */}
      <TradingGoodForm initialData={good} isEdit={true} />
    </div>
  );
}
