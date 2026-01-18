
'use client';

import { useSalePayments } from '@/lib/hooks/use-sales';
import { IPayment, PaymentMethod } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, CreditCard, HandCoins, Wallet, Landmark, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/ui/empty-state';

interface SalePaymentHistoryProps {
    saleId: string;
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

export function SalePaymentHistory({ saleId }: SalePaymentHistoryProps) {
    const { data: paymentsData, isLoading, error } = useSalePayments(saleId);
    // useSalePayments returns ApiResponse<any[]> (step 108/114)
    const payments = paymentsData?.data || [];

    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={CreditCard}
                title="Failed to load payments"
                description="An error occurred while loading payment history."
            />
        );
    }

    if (payments.length === 0) {
        return (
            <EmptyState
                icon={CreditCard}
                title="No payments recorded"
                description="No payments have been recorded for this sale yet."
            />
        );
    }

    const totalPaid = payments.reduce((sum: number, payment: IPayment) => sum + payment.amount, 0);

    return (
        <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-4 px-2">
                <h4 className="text-sm font-medium text-muted-foreground hidden">Total Paid</h4>
                <Badge variant="outline" className="ml-auto bg-success/10 text-success border-success/20 h-7 text-xs font-bold gap-1.5 px-3">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Total Received: ₹{totalPaid.toLocaleString('en-IN')}
                </Badge>
            </div>

            <div className="space-y-3">
                {payments.map((payment: IPayment) => (
                    <div
                        key={payment._id.toString()}
                        className="group flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border/80 transition-all hover:shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-foreground">
                                    {format(new Date(payment.paymentDate), 'MMMM dd, yyyy')}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="capitalize font-medium text-foreground/80">
                                        {payment.paymentMethod.replace('_', ' ')}
                                    </span>
                                    {payment.trancheNumber && payment.totalTranches && (
                                        <>
                                            <span className="text-border">•</span>
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 rounded-md font-medium">
                                                {payment.trancheNumber}/{payment.totalTranches}
                                            </Badge>
                                        </>
                                    )}
                                    {(payment.transactionId || payment.referenceNumber) && (
                                        <>
                                            <span className="text-border">•</span>
                                            <span className="font-mono text-[10px] bg-muted/50 px-1 py-0.5 rounded text-muted-foreground">
                                                {payment.referenceNumber || payment.transactionId}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="font-black text-lg text-success tracking-tight">
                                ₹{payment.amount.toLocaleString('en-IN')}
                            </span>
                            {payment.notes && (
                                <span className="text-[11px] text-muted-foreground/80 italic max-w-[200px] text-right line-clamp-1 group-hover:text-muted-foreground transition-colors">
                                    {payment.notes}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
