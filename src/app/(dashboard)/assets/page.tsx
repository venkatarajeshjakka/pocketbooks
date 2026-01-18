/**
 * Assets Page - Full-featured with Stats Dashboard and Caching
 * Modern UI with stats dashboard, advanced search/filters, and React Query caching
 * Mirrors the client/vendor management page structure
 */

import { Suspense } from 'react';
import { Package } from 'lucide-react';
import { AssetStatsDashboard } from '@/components/assets/asset-stats-dashboard';
import { AssetList } from '@/components/assets/asset-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Asset } from '@/models'; // Kept for generic types if needed, but preferably remove. But AssetList imports it.
// Actually AssetList imports from '@/models'? No, it imports types probably or just uses it.
// Let's replace the imports.
import { BulkPaymentContainer } from '@/components/assets/bulk-payment-container';

interface AssetsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        status?: string;
        category?: string;
        view?: 'grid' | 'table';
    }>;
}

export const metadata = {
    title: 'Assets | PocketBooks',
    description: 'Manage industrial assets and equipment',
};

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || '';
    const status = params?.status || '';
    const category = params?.category || '';
    const view = params?.view || 'grid';

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/20 backdrop-blur-md shadow-lg shadow-primary/5">
                        <Package className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                            Asset Registry
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground/60">
                            Enterprise resource and asset management
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <Suspense
                fallback={
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-border/50 bg-card/50 p-6"
                            >
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-8 w-32 mb-2" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        ))}
                    </div>
                }
            >
                <AssetStatsDashboard />
            </Suspense>

            {/* Search, Filters, and Actions Bar */}
            <div className="flex items-center justify-between gap-4">
                <EntitySearchFilterBar
                    entityType="asset"
                    addNewPath="/assets/new"
                    addNewLabel="Add Asset"
                    searchPlaceholder="Search assets by name, category..."
                    showOutstandingFilter={false}
                />
                <Suspense fallback={null}>
                    <BulkPaymentContainer />
                </Suspense>
            </div>

            {/* Assets List */}
            <Suspense
                fallback={
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                }
            >
                <AssetList
                    page={page}
                    search={search}
                    status={status}
                    category={category}
                    view={view}
                />
            </Suspense>
        </div>
    );
}
