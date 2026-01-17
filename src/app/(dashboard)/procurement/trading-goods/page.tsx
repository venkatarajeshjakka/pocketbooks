import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';
import { ProcurementList } from '@/components/procurement/procurement-list';
import { ProcurementStatsDashboard } from '@/components/procurement/procurement-stats-dashboard';
import { ProcurementListSkeleton } from '@/components/procurement/procurement-list-skeleton';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
    title: 'Trading Goods Procurement | PocketBooks',
    description: 'Manage trading goods procurement and vendor settlements',
};

export default async function TradingGoodsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
    const search = typeof params.search === 'string' ? params.search : '';
    const status = typeof params.status === 'string' ? params.status : '';
    const view = typeof params.view === 'string' && params.view === 'table' ? 'table' : 'grid';

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/20 backdrop-blur-md shadow-lg shadow-primary/5">
                        <ShoppingCart className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                            Trading Goods
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground/60">
                            Procurement and vendor order management
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <Suspense fallback={<ProcurementListSkeleton view="grid" />}>
                <ProcurementStatsDashboard />
            </Suspense>

            {/* Search, Filters, and Actions Bar */}
            <div className="flex items-center justify-between gap-4">
                <EntitySearchFilterBar
                    entityType="trading-good-procurement"
                    addNewPath="/procurement/trading-goods/new"
                    addNewLabel="Create Order"
                    searchPlaceholder="Search by invoice or vendor..."
                    showOutstandingFilter={false}
                />
            </div>

            {/* Procurement List */}
            <Suspense fallback={<ProcurementListSkeleton view={view} />}>
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
