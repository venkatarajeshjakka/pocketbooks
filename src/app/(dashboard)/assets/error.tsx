/**
 * Assets Error Page
 *
 * Displayed when an error occurs on the assets page
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Monitor, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AssetsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Assets page error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 p-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/10 ring-1 ring-destructive/20">
        <Monitor className="h-10 w-10 text-destructive" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md">
          We encountered an error while loading the assets page. Please try again or return to the homepage.
        </p>
        {error.message && (
          <p className="text-sm text-destructive/70 font-mono bg-destructive/5 px-4 py-2 rounded-lg mt-4">
            {error.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={reset}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
