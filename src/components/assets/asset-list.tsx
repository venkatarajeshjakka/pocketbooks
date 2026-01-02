/**
 * AssetList Component using shared entity components
 */

'use client';

import { useAssets } from '@/lib/hooks/use-assets';
import { useDeleteAsset } from '@/lib/hooks/use-assets';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { AssetStatus, IAsset } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { AssetStats } from './asset-stats';

interface AssetListProps {
    page: number;
    search: string;
    status: string;
    category: string;
    view: 'grid' | 'table';
}

export function AssetList({ page, search, status, category, view }: AssetListProps) {
    const { data, isLoading, error } = useAssets({
        page,
        search,
        status,
        category,
        limit: 12,
    });

    const deleteAsset = useDeleteAsset();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center text-destructive">
                Error loading assets: {error.message}
            </div>
        );
    }

    const columns = [
        {
            header: 'Asset Name',
            accessorKey: 'name',
            cell: (asset: IAsset) => (
                <div className="flex flex-col">
                    <span className="font-medium">{asset.name}</span>
                    <span className="text-xs text-muted-foreground">{asset.category}</span>
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (asset: IAsset) => {
                return (
                    <Badge variant={asset.status === AssetStatus.ACTIVE ? 'default' : 'outline'}>
                        {asset.status.toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            header: 'Purchase Date',
            accessorKey: 'purchaseDate',
            cell: (asset: IAsset) => format(new Date(asset.purchaseDate), 'dd MMM yyyy'),
        },
        {
            header: 'Value',
            accessorKey: 'currentValue',
            cell: (asset: IAsset) => `₹${asset.currentValue.toLocaleString('en-IN')}`,
        },
    ];

    const handleDelete = async (id: string) => {
        await deleteAsset.mutateAsync(id);
    };

    return (
        <div className="space-y-8">
            {data?.data && <AssetStats assets={data.data} />}

            <EntityListContainer
                entityType="asset"
                entities={data?.data || []}
                initialView={view}
                basePath="/assets"
                onDelete={handleDelete}
                renderCardContent={(asset: IAsset) => (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {asset.category}
                            </span>
                            <Badge variant={asset.status === AssetStatus.ACTIVE ? 'default' : 'outline'} className="h-5 text-[10px]">
                                {asset.status}
                            </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{asset.name}</h3>
                        <p className="text-sm font-bold text-primary">₹{asset.currentValue.toLocaleString('en-IN')}</p>
                    </div>
                )}
                columns={columns}
            />
        </div>
    );
}
