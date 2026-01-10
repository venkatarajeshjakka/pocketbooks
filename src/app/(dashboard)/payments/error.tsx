/**
 * Payments Error Page
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function PaymentsError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Payments page error:', error);
    }, [error]);

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Something went wrong!</h2>
                <p className="text-muted-foreground max-w-md">
                    We encountered an error while loading the payments. Please try again.
                </p>
            </div>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    );
}
