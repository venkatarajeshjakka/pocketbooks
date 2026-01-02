/**
 * Vendors Error Page
 *
 * Displayed when an error occurs loading the vendors page
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VendorsError({ error, reset }: VendorsErrorProps) {
  useEffect(() => {
    console.error('Vendors page error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          An error occurred while loading the vendors page. Please try again.
        </p>
      </div>

      <Button onClick={reset} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
