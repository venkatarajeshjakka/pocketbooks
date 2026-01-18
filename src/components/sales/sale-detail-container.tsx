'use client';

import { useSale } from '@/lib/hooks/use-sales';
import { SaleDetailView } from './sale-detail-view';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface SaleDetailContainerProps {
    id: string;
}

export function SaleDetailContainer({ id }: SaleDetailContainerProps) {
    const { data: saleResponse, isLoading, error } = useSale(id);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    if (error || !saleResponse?.data) {
        return <div>Sale not found or an error occurred.</div>;
    }

    return <SaleDetailView sale={saleResponse.data} />;
}
