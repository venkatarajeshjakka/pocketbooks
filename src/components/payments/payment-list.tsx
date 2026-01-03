/**
 * PaymentList Component
 * Displays a list of payments with filtering
 */

'use client';

import { usePayments } from '@/lib/hooks/use-payments';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { IPayment, TransactionType, PaymentMethod, PartyType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, CreditCard, ArrowUpRight, ArrowDownRight, Wallet, Landmark, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentListProps {
    page: number;
    search: string;
    transactionType: string;
    partyType: string;
}

function getTransactionTypeStyles(type: TransactionType) {
    switch (type) {
        case TransactionType.SALE:
            return 'bg-success/10 text-success border-success/20';
        case TransactionType.PURCHASE:
            return 'bg-destructive/10 text-destructive border-destructive/20';
        case TransactionType.EXPENSE:
            return 'bg-warning/10 text-warning border-warning/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

function getTransactionContext(payment: IPayment) {
    if (payment.assetId) {
        const asset = payment.assetId as any;
        return {
            type: 'Asset',
            name: asset?.name || 'Unknown Asset',
            id: typeof payment.assetId === 'string' ? payment.assetId : payment.assetId.toString()
        };
    }
    if (payment.saleId) {
        return {
            type: 'Sale',
            name: `Invoice #${payment.saleId}`,
            id: typeof payment.saleId === 'string' ? payment.saleId : payment.saleId.toString()
        };
    }
    if (payment.procurementId) {
        return {
            type: 'Procurement',
            name: `Purchase #${payment.procurementId}`,
            id: typeof payment.procurementId === 'string' ? payment.procurementId : payment.procurementId.toString()
        };
    }
    return {
        type: 'General',
        name: 'General Payment',
        id: ''
    };
}
function getPaymentMethodIcon(method: PaymentMethod) {
    switch (method) {
        case PaymentMethod.CASH:
            return <HandCoins className="h-4 w-4" />;
        case PaymentMethod.UPI:
            return <Wallet className="h-4 w-4" />;
        case PaymentMethod.BANK_TRANSFER:
        case PaymentMethod.CHEQUE:
            return <Landmark className="h-4 w-4" />;
        case PaymentMethod.CARD:
            return <CreditCard className="h-4 w-4" />;
        default:
            return <CreditCard className="h-4 w-4" />;
    }
}

export function PaymentList({ page, search, transactionType, partyType }: PaymentListProps) {
    const { data, isLoading, error } = usePayments({
        page,
        search,
        transactionType,
        partyType,
        limit: 50,
        sortBy: 'paymentDate',
        sortOrder: 'desc',
    });

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
                icon={CreditCard}
                title="Failed to load payments"
                description="An error occurred while loading payment history. Please try again later."
            />
        );
    }

    const payments = data?.data || [];

    if (payments.length === 0) {
        const hasFilters = search || transactionType || partyType;

        return (
            <EmptyState
                icon={CreditCard}
                title={hasFilters ? 'No payments found' : 'No payments yet'}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : 'Get started by recording your first payment transaction.'
                }
                action={
                    !hasFilters
                        ? {
                            label: 'Record your first payment',
                            onClick: () => {
                                window.location.href = '/payments/new';
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
            accessorKey: 'paymentDate',
            cell: (payment: IPayment) => format(new Date(payment.paymentDate), 'dd MMM yyyy'),
        },
        {
            header: 'Party',
            accessorKey: 'partyId',
            cell: (payment: IPayment) => {
                const party = payment.partyId as any;
                const context = getTransactionContext(payment);
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{party?.name || 'Unknown Party'}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="uppercase tracking-widest font-bold">
                                {payment.partyType}
                            </span>
                            {context.type !== 'General' && (
                                <>
                                    <span>•</span>
                                    <span className="text-primary font-medium">
                                        {context.type}: {context.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Type',
            accessorKey: 'transactionType',
            cell: (payment: IPayment) => (
                <Badge
                    variant="outline"
                    className={cn('text-[10px] h-6 px-2 capitalize font-bold tracking-wider', getTransactionTypeStyles(payment.transactionType))}
                >
                    {payment.transactionType === TransactionType.SALE ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {payment.transactionType}
                </Badge>
            ),
        },
        {
            header: 'Method',
            accessorKey: 'paymentMethod',
            cell: (payment: IPayment) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                </div>
            ),
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            cell: (payment: IPayment) => (
                <span className={cn(
                    "font-bold text-base",
                    payment.transactionType === TransactionType.SALE ? "text-success" : "text-destructive"
                )}>
                    {payment.transactionType === TransactionType.SALE ? '+' : '-'}
                    {'\u20B9'}{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            header: 'Notes',
            accessorKey: 'notes',
            cell: (payment: IPayment) => (
                <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                    {payment.notes || '-'}
                </span>
            ),
        },
    ];

    return (
        <EntityListContainer
            entityType="payment"
            entities={payments}
            initialView="table"
            basePath="/payments"
            onDelete={async () => { }} // Payments usually shouldn't be deleted easily
            columns={columns}
            renderCardContent={(payment: IPayment) => (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="outline"
                            className={cn('text-[10px] h-5 px-1.5 capitalize font-bold', getTransactionTypeStyles(payment.transactionType))}
                        >
                            {payment.transactionType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                            {(payment.partyId as any)?.name || 'Unknown Party'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="uppercase font-bold">
                                {payment.partyType}
                            </span>
                            {(() => {
                                const context = getTransactionContext(payment);
                                return context.type !== 'General' ? (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary font-medium">
                                            {context.type}: {context.name}
                                        </span>
                                    </>
                                ) : null;
                            })()}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/10">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <span className={cn(
                            "font-bold text-sm",
                            payment.transactionType === TransactionType.SALE ? "text-success" : "text-destructive"
                        )}>
                            {payment.transactionType === TransactionType.SALE ? '+' : '-'}
                            {'\u20B9'}{payment.amount.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {payment.notes && (
                        <p className="text-[10px] text-muted-foreground italic line-clamp-1 opacity-70">
                            "{payment.notes}"
                        </p>
                    )}
                </div>
            )}
        />
    );
}
