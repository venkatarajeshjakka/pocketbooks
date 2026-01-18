'use client';

import { useAsset } from '@/lib/hooks/use-assets';
import { AssetDetailView } from './asset-detail-view';
import { Loader2 } from 'lucide-react';

interface AssetDetailContainerProps {
    id: string;
}

export function AssetDetailContainer({ id }: AssetDetailContainerProps) {
    const { data: assetResponse, isLoading, error } = useAsset(id);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground/50">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !assetResponse?.data) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Asset Not Found</h2>
                <p className="text-sm text-muted-foreground max-w-xs">We couldn't find the asset you're looking for. It might have been deleted or the ID is invalid.</p>
            </div>
        );
    }

    return <AssetDetailView asset={assetResponse.data as any} assetId={id} />;
}
