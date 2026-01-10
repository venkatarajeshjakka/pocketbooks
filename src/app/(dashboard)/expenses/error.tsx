/**
 * Expenses Page Error State
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ExpensesErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ExpensesError({ error, reset }: ExpensesErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Expenses page error:', error);
    }, [error]);

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    Something went wrong
                </h2>
                <p className="text-muted-foreground max-w-md">
                    We encountered an error while loading the expenses page.
                    Please try again or return to the dashboard.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Button
                    onClick={reset}
                    variant="default"
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
