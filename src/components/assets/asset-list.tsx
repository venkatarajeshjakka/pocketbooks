/**
 * AssetList Component using shared entity components
 * Displays a list of assets with grid/table view options
 */

'use client';

import { useAssets, useDeleteAsset } from '@/lib/hooks/use-assets';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { AssetStatus, IAsset } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetListProps {
    page: number;
    search: string;
    status: string;
    category: string;
    view: 'grid' | 'table';
}

function getStatusBadgeStyles(status: AssetStatus) {
    switch (status) {
        case AssetStatus.ACTIVE:
            return 'bg-success/10 text-success border-success/20';
        case AssetStatus.REPAIR:
            return 'bg-warning/10 text-warning border-warning/20';
        case AssetStatus.RETIRED:
            return 'bg-muted text-muted-foreground border-border';
        case AssetStatus.DISPOSED:
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export function AssetList({ page, search, status, category, view }: AssetListProps) {
    const { data, isLoading, error } = useAssets({
        page,
        search,
        status,
        category,
        limit: 50,
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
            <EmptyState
                icon={Monitor}
                title="Failed to load assets"
                description="An error occurred while loading assets. Please try again later."
            />
        );
    }

    const assets = data?.data || [];

    // Empty state
    if (assets.length === 0) {
        const hasFilters = search || status || category;

        return (
            <EmptyState
                icon={Monitor}
                title={hasFilters ? 'No assets found' : 'No assets yet'}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : 'Get started by adding your first asset to begin tracking your equipment and machinery.'
                }
                action={
                    !hasFilters
                        ? {
                            label: 'Add your first asset',
                            onClick: () => {
                                window.location.href = '/assets/new';
                            },
                        }
                        : undefined
                }
            />
        );
    }

    const columns = [
        {
            header: 'Asset Name',
            accessorKey: 'name',
            cell: (asset: IAsset) => (
                <div className="flex flex-col">
                    <span className="font-medium">{asset.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                        {asset.category.replace('_', ' ')}
                    </span>
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (asset: IAsset) => (
                <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', getStatusBadgeStyles(asset.status))}
                >
                    {asset.status}
                </Badge>
            ),
        },
        {
            header: 'Location',
            accessorKey: 'location',
            cell: (asset: IAsset) => (
                <span className="text-sm text-muted-foreground">
                    {asset.location || '-'}
                </span>
            ),
        },
        {
            header: 'Purchase Date',
            accessorKey: 'purchaseDate',
            cell: (asset: IAsset) => format(new Date(asset.purchaseDate), 'dd MMM yyyy'),
        },
        {
            header: 'Current Value',
            accessorKey: 'currentValue',
            cell: (asset: IAsset) => (
                <span className="font-semibold">
                    {'\u20B9'}{asset.currentValue.toLocaleString('en-IN')}
                </span>
            ),
        },
    ];

    const handleDelete = async (id: string) => {
        await deleteAsset.mutateAsync(id);
    };

    return (
        <EntityListContainer
            entityType="asset"
            entities={assets}
            initialView={view}
            basePath="/assets"
            onDelete={handleDelete}
            renderCardContent={(asset: IAsset) => (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {asset.category.replace('_', ' ')}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn('h-5 text-[10px] capitalize', getStatusBadgeStyles(asset.status))}
                        >
                            {asset.status}
                        </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{asset.name}</h3>
                    {asset.location && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{asset.location}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                        <p className="text-sm font-bold text-primary">
                            {'\u20B9'}{asset.currentValue.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(asset.purchaseDate), 'MMM yyyy')}
                        </p>
                    </div>
                </div>
            )}
            columns={columns}
        />
    );
}
