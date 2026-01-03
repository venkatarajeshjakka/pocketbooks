/**
 * Assets Page - Full-featured with Stats Dashboard and Caching
 * Modern UI with stats dashboard, advanced search/filters, and React Query caching
 * Mirrors the client/vendor management page structure
 */

import { Suspense } from 'react';
import { Monitor } from 'lucide-react';
import { AssetStatsDashboard } from '@/components/assets/asset-stats-dashboard';
import { AssetList } from '@/components/assets/asset-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Asset } from '@/models';
import { connectToDatabase } from '@/lib/api-helpers';

// Bulk Payment Actions Component
async function BulkPaymentActions() {
    try {
        await connectToDatabase();
        const assets = await Asset.find({
            paymentStatus: { $ne: 'fully_paid' },
            remainingAmount: { $gt: 0 }
        }).limit(1000).lean();

        if (assets.length === 0) {
            return null;
        }

        const { BulkPaymentDialog } = await import('@/components/assets/bulk-payment-dialog');
        return <BulkPaymentDialog assets={assets as any} />;
    } catch (error) {
        console.error('Failed to load assets for bulk payment:', error);
        return null;
    }
}

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
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
                        <Monitor className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Assets
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage industrial assets, machinery, and office equipment
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
                    <BulkPaymentActions />
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
