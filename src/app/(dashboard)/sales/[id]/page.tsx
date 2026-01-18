
/**
 * Sale Details Page
 */
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { SaleDetailView } from '@/components/sales/sale-detail-view';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSaleById } from '@/lib/api/sales';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Sale Details | PocketBooks',
    description: 'View sale details and payment history',
};

async function SaleDetails({ id }: { id: string }) {
    try {
        const response = await fetchSaleById(id);
        if (!response || !response.data) {
            notFound();
        }
        return <SaleDetailView sale={response.data} />;
    } catch (error) {
        console.error('Error fetching sale details:', error);
        notFound();
    }
}

export default async function SaleDetailsPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense
            fallback={
                <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-32 rounded-xl" />
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
            }
        >
            <SaleDetails id={id} />
        </Suspense>
    );
}
