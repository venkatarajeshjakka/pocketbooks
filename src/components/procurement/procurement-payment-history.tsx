'use client';

import { usePayments } from '@/lib/hooks/use-payments';
import { IPayment, PaymentMethod } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2, CreditCard, HandCoins, Wallet, Landmark } from 'lucide-react';
import { EmptyState } from '@/components/shared/ui/empty-state';

interface ProcurementPaymentHistoryProps {
    procurementId: string;
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

export function ProcurementPaymentHistory({ procurementId }: ProcurementPaymentHistoryProps) {
    const { data, isLoading, error } = usePayments({
        procurementId,
        sortBy: 'paymentDate',
        sortOrder: 'desc',
        limit: 100,
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={CreditCard}
                        title="Failed to load payments"
                        description="An error occurred while loading payment history."
                    />
                </CardContent>
            </Card>
        );
    }

    const payments = data?.data || [];

    if (payments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={CreditCard}
                        title="No payments recorded"
                        description="No payments have been recorded for this procurement yet."
                    />
                </CardContent>
            </Card>
        );
    }

    const totalPaid = payments.reduce((sum: number, payment: IPayment) => sum + payment.amount, 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Payment History</CardTitle>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Total: ₹{totalPaid.toLocaleString('en-IN')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {payments.map((payment: IPayment) => (
                        <div
                            key={payment._id.toString()}
                            className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    {getPaymentMethodIcon(payment.paymentMethod)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                                    </span>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="capitalize">
                                            {payment.paymentMethod.replace('_', ' ')}
                                        </span>
                                        {payment.transactionId && (
                                            <>
                                                <span>•</span>
                                                <span className="font-mono text-xs">
                                                    {payment.transactionId}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-lg text-success">
                                    ₹{payment.amount.toLocaleString('en-IN')}
                                </span>
                                {payment.notes && (
                                    <span className="text-xs text-muted-foreground italic max-w-[200px] text-right line-clamp-1">
                                        {payment.notes}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
