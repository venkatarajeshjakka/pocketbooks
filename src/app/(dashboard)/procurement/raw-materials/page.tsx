import { Suspense } from 'react';
import { ProcurementList } from '@/components/procurement/procurement-list';

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RawMaterialsPage({ searchParams }: PageProps) {
    // Resolve searchParams before accessing properties (Next 15)
    const resolvedParams = await searchParams;

    // Parse params
    const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';
    const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : '';
    const view = typeof resolvedParams.view === 'string' && resolvedParams.view === 'table' ? 'table' : 'grid';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Raw Materials Procurement</h1>
                <p className="text-muted-foreground">
                    Manage your raw material purchases, orders, and receipts.
                </p>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <ProcurementList
                    type="raw_material"
                    page={page}
                    search={search}
                    status={status}
                    view={view}
                />
            </Suspense>
        </div>
    );
}

// Add revalidation or dynamic config if needed, but since it's a client component mostly fetching via RQ, this is fine.
// Actually `ProcurementList` is client component.
