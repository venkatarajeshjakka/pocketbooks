
/**
 * Edit Sale Page
 */
import { Suspense } from 'react';
import { SaleForm } from '@/components/sales/sale-form';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditSalePage({ params }: PageProps) {
    const { id } = await params;

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                    Edit Sale
                </h1>
                <p className="text-sm font-medium text-muted-foreground/60">
                    Modify sale details and items
                </p>
            </div>

            <Suspense
                fallback={
                    <div className="space-y-8">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                }
            >
                <SaleForm mode="edit" saleId={id} />
            </Suspense>
        </div>
    );
}
