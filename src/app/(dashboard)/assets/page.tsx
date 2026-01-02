/**
 * Assets Page
 */

import { Suspense } from 'react';
import { Monitor } from 'lucide-react';
import { AssetList } from '@/components/assets/asset-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="flex flex-1 flex-col gap-6 md:gap-8 p-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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
            </div>

            {/* Search, Filters, and Actions Bar */}
            <EntitySearchFilterBar
                entityType="asset"
                addNewPath="/assets/procurement/new"
                addNewLabel="Purchase Asset"
                searchPlaceholder="Search assets by name, category..."
            />

            <Suspense fallback={<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-48 w-full" /></div>}>
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
