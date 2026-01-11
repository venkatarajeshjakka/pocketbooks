import { Suspense } from 'react';
import { ProcurementList } from '@/components/procurement/procurement-list';

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TradingGoodsPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';
    const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : '';
    const view = typeof resolvedParams.view === 'string' && resolvedParams.view === 'table' ? 'table' : 'grid';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Trading Goods Procurement</h1>
                <p className="text-muted-foreground">
                    Manage your trading goods items procurement.
                </p>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <ProcurementList
                    type="trading_good"
                    page={page}
                    search={search}
                    status={status}
                    view={view}
                />
            </Suspense>
        </div>
    );
}
