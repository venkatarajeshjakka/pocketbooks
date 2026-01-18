'use client';

import { Suspense } from 'react';
import { useProcurement } from '@/lib/hooks/use-procurements';
import { ProcurementDetailView } from '@/components/procurement/procurement-detail-view';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface ProcurementDetailContainerProps {
    id: string;
    type: 'raw_material' | 'trading_good';
}

export function ProcurementDetailContainer({ id, type }: ProcurementDetailContainerProps) {
    const { data: procurement, isLoading, isError, error } = useProcurement(type, id);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
                <Skeleton className="h-14 w-full rounded-2xl" />
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-64 rounded-2xl" />
                        <Skeleton className="h-96 rounded-2xl" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-80 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !procurement) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center bg-card rounded-3xl border border-dashed">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Failed to load procurement</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        {error instanceof Error ? error.message : 'The procurement could not be found or there was an error loading it.'}
                    </p>
                </div>
                <Button asChild variant="outline" className="mt-2">
                    <Link href={`/procurement/${type === 'raw_material' ? 'raw-materials' : 'trading-goods'}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Procurements
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <ProcurementDetailView
                procurement={procurement as any}
                type={type}
            />
        </div>
    );
}
