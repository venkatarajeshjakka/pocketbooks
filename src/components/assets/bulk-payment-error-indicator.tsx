/**
 * BulkPaymentErrorIndicator Component
 * Displays an error indicator when bulk payment data fails to load
 * This is shown instead of silently failing (B8 fix)
 */

'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function BulkPaymentErrorIndicator() {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            // Force a page refresh to retry loading
            window.location.reload();
        } catch (error) {
            toast.error('Failed to reload. Please refresh the page manually.');
            setIsRetrying(false);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={handleRetry}
                        disabled={isRetrying}
                        aria-label="Bulk payment feature unavailable. Click to retry loading."
                    >
                        {isRetrying ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                        )}
                        {isRetrying ? 'Retrying...' : 'Bulk Payment Unavailable'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-sm">
                        Failed to load assets for bulk payment. Click to retry or refresh the page.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
