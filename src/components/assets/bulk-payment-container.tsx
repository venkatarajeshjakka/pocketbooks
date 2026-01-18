'use client';

import { useAssets } from '@/lib/hooks/use-assets';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const BulkPaymentDialog = dynamic(() => import('./bulk-payment-dialog').then(mod => mod.BulkPaymentDialog), { ssr: false });
const BulkPaymentErrorIndicator = dynamic(() => import('./bulk-payment-error-indicator').then(mod => mod.BulkPaymentErrorIndicator), { ssr: false });

export function BulkPaymentContainer() {
    const { data: assetsResponse, isLoading, error } = useAssets({
        limit: 1000,
        status: 'active', // Assuming hasOutstanding is handled or we use a custom param if supported
        // Wait, the API supports hasOutstanding?
    });

    if (isLoading) return null;
    if (error) return <BulkPaymentErrorIndicator />;

    const assets = assetsResponse?.data || [];
    // Filter outstanding if API didn't
    const outstandingAssets = assets.filter(a => (a.remainingAmount || 0) > 0);

    if (outstandingAssets.length === 0) return null;

    return <BulkPaymentDialog assets={outstandingAssets} />;
}
