/**
 * InterestPaymentList Component
 *
 * Displays a list of interest payments with breakdown and linked loan accounts
 */

'use client';

import { IInterestPayment, ILoanAccount, PaymentMethod } from '@/types';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, Wallet, Landmark, Info } from 'lucide-react';
import { format } from 'date-fns';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useInterestPayments, useDeleteInterestPayment } from '@/lib/hooks/use-interest-payments';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/ui/empty-state';

interface InterestPaymentListProps {
    page?: number;
    search?: string;
    loanAccountId?: string;
}

export function InterestPaymentList({ page = 1, search = '', loanAccountId = '' }: InterestPaymentListProps) {
    const { data, isLoading, error } = useInterestPayments({
        page,
        search,
        loanAccountId,
        limit: 50,
    });
    const deletePaymentMutation = useDeleteInterestPayment();

    const handleDelete = async (id: string) => {
        await deletePaymentMutation.mutateAsync(id);
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
                icon={Wallet}
                title="Failed to load interest payments"
                description="An error occurred while loading payment history. Please try again later."
            />
        );
    }

    const payments = data?.data || [];

    if (payments.length === 0) {
        const hasFilters = search || loanAccountId;
        return (
            <EmptyState
                icon={Wallet}
                title={hasFilters ? 'No payments found' : 'No interest payments yet'}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : 'Get started by recording your first interest payment.'
                }
                action={
                    !hasFilters
                        ? {
                            label: 'Record first payment',
                            onClick: () => {
                                window.location.href = '/interest-payments/new';
                            },
                        }
                        : undefined
                }
            />
        );
    }

    const columns = [
        {
            header: 'Date & Loan',
            cell: (payment: IInterestPayment) => {
                const loan = payment.loanAccountId as unknown as ILoanAccount;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                            <div className="font-bold text-foreground/90">{format(new Date(payment.date), 'dd MMM yyyy')}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                {loan?.bankName || 'Unknown Bank'}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Breakdown',
            cell: (payment: IInterestPayment) => (
                <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Interest</div>
                        <div className="text-sm font-bold text-indigo-600">₹{payment.interestAmount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="h-8 w-px bg-border/40" />
                    <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Principal</div>
                        <div className="text-sm font-bold text-success">₹{payment.principalAmount.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Method',
            accessorKey: 'paymentMethod',
            cell: (payment: IInterestPayment) => (
                <Badge variant="outline" className="capitalize font-bold border-border/60 bg-muted/30">
                    {payment.paymentMethod}
                </Badge>
            ),
        },
        {
            header: 'Total Amount',
            cell: (payment: IInterestPayment) => (
                <div className="text-right">
                    <div className="text-lg font-black text-foreground">
                        ₹{payment.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        Recorded
                    </div>
                </div>
            ),
        },
    ];

    return (
        <TooltipProvider>
            <EntityListContainer
                entities={payments}
                entityType="interest-payment"
                basePath="/interest-payments"
                onDelete={handleDelete}
                columns={columns}
                canEdit={true}
                renderCardContent={(payment: IInterestPayment) => {
                    const loan = payment.loanAccountId as unknown as ILoanAccount;
                    return (
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                        <Wallet className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-foreground">
                                            ₹{payment.totalAmount.toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
                                            Total Payment
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter border-primary/20 bg-primary/5 text-primary">
                                    {payment.paymentMethod}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/40">
                                <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1">
                                        <span className="h-1 w-1 rounded-full bg-indigo-500" /> Interest
                                    </div>
                                    <div className="font-bold text-indigo-600">₹{payment.interestAmount.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1">
                                        <span className="h-1 w-1 rounded-full bg-success" /> Principal
                                    </div>
                                    <div className="font-bold text-success">₹{payment.principalAmount.toLocaleString('en-IN')}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                                    <Landmark className="h-3 w-3" />
                                    <span className="truncate max-w-[120px]">{loan?.bankName || 'Unknown Bank'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold italic">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(payment.date), 'dd MMM yyyy')}
                                </div>
                            </div>

                            {payment.notes && (
                                <div className="mt-2 p-2 rounded-lg bg-muted/30 text-[10px] text-muted-foreground italic flex gap-2 items-start">
                                    <Info className="h-3 w-3 mt-0.5 opacity-50 flex-shrink-0" />
                                    <span className="line-clamp-2">{payment.notes}</span>
                                </div>
                            )}
                        </div>
                    );
                }}
            />
        </TooltipProvider>
    );
}
