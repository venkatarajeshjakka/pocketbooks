'use client';

import { useProcurements, useDeleteProcurement } from '@/lib/hooks/use-procurements';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { ProcurementStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, ShoppingCart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcurementDeleteButton } from './procurement-delete-button';

interface ProcurementListProps {
    type: 'raw_material' | 'trading_good';
    page: number;
    search: string;
    status: string;
    view: 'grid' | 'table';
}

function getStatusBadgeStyles(status: string) {
    switch (status) {
        case ProcurementStatus.RECEIVED:
        case ProcurementStatus.COMPLETED:
            return 'bg-success/10 text-success border-success/20';
        case ProcurementStatus.PARTIALLY_RECEIVED:
            return 'bg-warning/10 text-warning border-warning/20';
        case ProcurementStatus.CANCELLED:
        case ProcurementStatus.RETURNED:
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

function getPaymentStatusBadgeStyles(status: string) {
    switch (status) {
        case 'paid':
            return 'bg-success/10 text-success border-success/20';
        case 'partial':
            return 'bg-warning/10 text-warning border-warning/20';
        case 'unpaid':
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export function ProcurementList({ type, page, search, status, view }: ProcurementListProps) {
    const { data, isLoading, error, refetch } = useProcurements({
        type,
        page,
        search,
        status,
        limit: 50,
    });

    const deleteMutation = useDeleteProcurement(type);

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
        refetch();
    };

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
                icon={AlertCircle}
                title="Failed to load procurements"
                description="An error occurred while loading procurements. Please try again later."
            />
        );
    }

    const procurements = data?.data || [];
    const endpointType = type === 'raw_material' ? 'raw-material' : 'trading-good';
    const basePath = `/procurement/${endpointType}s`;

    if (procurements.length === 0) {
        const hasFilters = search || (status && status !== 'all');

        return (
            <EmptyState
                icon={ShoppingCart}
                title={hasFilters ? 'No procurements found' : 'No procurements yet'}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : 'Get started by creating your first procurement.'
                }
                action={
                    !hasFilters
                        ? {
                            label: 'Create Procurement',
                            onClick: () => {
                                window.location.href = `${basePath}/new`;
                            },
                        }
                        : undefined
                }
            />
        );
    }

    // Since EntityListContainer uses generic "onDelete", we might need to wrap our delete logic differently 
    // or just pass a dummy and handle delete inside columns if possible?
    // Actually EntityListContainer wraps generic actions. But let's see. 
    // It provides "onDelete" which triggers a simple confirm. 
    // But our delete is complex (reverses inventory).
    // So we might want to override the delete action or utilize the custom delete dialog.
    // However, EntityListContainer might force its own delete dialog.
    // Let's check EntityListContainer again. 
    // It seems to take `onDelete` which is `(id: string) => Promise<void>`.
    // If I pass a function there, it will show a delete confirmation.
    // My `ProcurementDeleteButton` has its own dialog with specific warning text.
    // Maybe I can just pass a function that calls the API directly, and rely on EntityListContainer's dialog?
    // But EntityListContainer dialog is generic "Are you sure?".
    // I prefer the specific warning about inventory reversal.
    // I'll stick to providing a dummy onDelete to satisfy props if needed, or modify EntityListContainer.
    // Actually, EntityListContainer probably renders `EntityCard` or `EntityRow`.
    // If I want custom actions, passing `renderCardContent` is fine for grid. 
    // For table, `columns` are used.


    const columns = [
        {
            header: 'Invoice & Vendor',
            accessorKey: 'invoiceNumber',
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.invoiceNumber || 'No Invoice #'}</span>
                    <span className="text-xs text-muted-foreground">
                        {item.vendorId?.name || 'Unknown Vendor'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Date',
            accessorKey: 'procurementDate',
            cell: (item: any) => format(new Date(item.procurementDate), 'dd MMM yyyy'),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (item: any) => (
                <div className="flex flex-col gap-1">
                    <Badge
                        variant="outline"
                        className={cn('text-[10px] capitalize w-fit', getStatusBadgeStyles(item.status))}
                    >
                        {item.status.replace('_', ' ')}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn('text-[10px] capitalize w-fit', getPaymentStatusBadgeStyles(item.paymentStatus))}
                    >
                        {item.paymentStatus}
                    </Badge>
                </div>
            ),
        },
        {
            header: 'Amount',
            accessorKey: 'gstBillPrice',
            cell: (item: any) => (
                <div className="flex flex-col text-right">
                    <span className="font-semibold">
                        {'\u20B9'}{(item.gstBillPrice || 0).toLocaleString('en-IN')}
                    </span>
                    {(item.remainingAmount || 0) > 0 && (
                        <span className="text-xs text-destructive">
                            Due: {'\u20B9'}{(item.remainingAmount || 0).toLocaleString('en-IN')}
                        </span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <EntityListContainer
            entityType={type === 'raw_material' ? 'procurement' : 'trading_good_procurement'} // just a key
            entities={procurements}
            initialView={view}
            basePath={basePath}
            onDelete={handleDelete}
            renderCardContent={(item: any) => (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            {format(new Date(item.procurementDate), 'MMM d, yyyy')}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn('text-[10px] capitalize', getStatusBadgeStyles(item.status))}
                        >
                            {item.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                            {item.vendorId?.name || 'Unknown Vendor'}
                        </h3>
                        <span className="text-xs font-mono bg-muted px-1 rounded">
                            {item.invoiceNumber || '#'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">
                                {'\u20B9'}{(item.gstBillPrice || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                Paid: {'\u20B9'}{(item.totalPaid || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn('text-[9px] capitalize', getPaymentStatusBadgeStyles(item.paymentStatus))}
                        >
                            {item.paymentStatus}
                        </Badge>
                    </div>
                    {(item.remainingAmount || 0) > 0 && (
                        <div className="pt-1 text-right">
                            <span className="text-[10px] text-destructive font-medium">
                                Due: {'\u20B9'}{(item.remainingAmount || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                    )}
                </div>
            )}
            columns={columns}
        />
    );
}
