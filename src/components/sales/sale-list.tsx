
'use client';

import { useSales, useDeleteSale } from '@/lib/hooks/use-sales';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { SaleStatus, ISale, PaymentStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SaleListProps {
    page: number;
    search: string;
    status: string;
    view: 'grid' | 'table';
}

function getPaymentStatusBadgeStyles(status: string) {
    switch (status) {
        case PaymentStatus.FULLY_PAID:
            return 'bg-success/10 text-success border-success/20';
        case PaymentStatus.PARTIALLY_PAID:
            return 'bg-warning/10 text-warning border-warning/20';
        case PaymentStatus.UNPAID:
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

function getStatusBadgeStyles(status: SaleStatus) {
    switch (status) {
        case SaleStatus.COMPLETED:
            return 'bg-success/10 text-success border-success/20';
        case SaleStatus.PENDING:
            return 'bg-warning/10 text-warning border-warning/20';
        case SaleStatus.CANCELLED:
            return 'bg-destructive/10 text-destructive border-destructive/20';
        case SaleStatus.PARTIALLY_PAID:
            return 'bg-info/10 text-info border-info/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export function SaleList({ page, search, status, view }: SaleListProps) {
    const { data: salesData, isLoading, error } = useSales({
        page,
        search, // Note: Search usually filters by client name or invoice number
        status, // Filter by SaleStatus
        // limit is default or handled by hook logic if needed
    });

    // Note: useSales returns direct data based on api/sales.ts fetchSales implementation
    // Depending on api implementation, if it returns { success: true, data: [...] } or just [...]
    // src/lib/api/sales.ts fetchSales returns response.data
    // If API endpoint returns { success: true, data: [...] }, then salesData corresponds to that object.

    // Check types: ApiResponse<ISale[]>
    const sales = salesData?.data || [];

    const deleteSale = useDeleteSale();
    const router = useRouter();

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
                icon={ShoppingCart}
                title="Failed to load sales"
                description="An error occurred while loading sales. Please try again later."
            />
        );
    }

    if (sales.length === 0) {
        const hasFilters = search || status;

        return (
            <EmptyState
                icon={ShoppingCart}
                title={hasFilters ? 'No sales found' : 'No sales yet'}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : 'Create your first sale to start tracking revenue.'
                }
                action={
                    !hasFilters
                        ? {
                            label: 'Create new sale',
                            onClick: () => {
                                router.push('/sales/new');
                            },
                        }
                        : undefined
                }
            />
        );
    }

    const columns = [
        {
            header: 'Date',
            accessorKey: 'saleDate',
            cell: (sale: ISale) => format(new Date(sale.saleDate), 'dd MMM yyyy'),
        },
        {
            header: 'Invoice',
            accessorKey: 'invoiceNumber',
            cell: (sale: ISale) => (
                <span className="font-medium text-primary">{sale.invoiceNumber}</span>
            ),
        },
        {
            header: 'Client',
            accessorKey: 'clientId',
            cell: (sale: ISale) => {
                // populate clientId is object
                const clientName = (sale.clientId as any)?.name || 'Unknown Client';
                return <span className="font-medium">{clientName}</span>;
            },
        },
        {
            header: 'Total',
            accessorKey: 'grandTotal',
            cell: (sale: ISale) => (
                <span className="font-semibold">
                    {'\u20B9'}{(sale.grandTotal || 0).toLocaleString('en-IN')}
                </span>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'paymentStatus',
            cell: (sale: ISale) => (
                <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', getPaymentStatusBadgeStyles(sale.paymentStatus))}
                >
                    {sale.paymentStatus?.replace('_', ' ') || 'Unpaid'}
                </Badge>
            ),
        },
    ];

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
            await deleteSale.mutateAsync(id);
        }
    };

    return (
        <EntityListContainer
            entityType="sale"
            entities={sales}
            initialView={view}
            basePath="/sales"
            onDelete={handleDelete}
            renderCardContent={(sale: ISale) => (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            {format(new Date(sale.saleDate), 'dd MMM yyyy')}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn('h-5 text-[10px] capitalize', getPaymentStatusBadgeStyles(sale.paymentStatus))}
                        >
                            {sale.paymentStatus?.replace('_', ' ') || 'Unpaid'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground line-clamp-1">{(sale.clientId as any)?.name}</h3>
                        <span className="text-xs text-primary font-medium">{sale.invoiceNumber}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground">Amount</span>
                            <span className="font-bold text-sm">
                                {'\u20B9'}{(sale.grandTotal || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-muted-foreground">Balance</span>
                            <span className={cn("font-medium text-sm", (sale.remainingAmount || 0) > 0 ? "text-destructive" : "text-success")}>
                                {'\u20B9'}{(sale.remainingAmount || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            columns={columns}
        />
    );
}
