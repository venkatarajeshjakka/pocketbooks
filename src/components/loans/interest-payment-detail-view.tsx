/**
 * InterestPaymentDetailView Component
 *
 * Detailed view of a single interest payment transaction.
 */

'use client';

import { IInterestPayment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Calendar,
    ArrowLeft,
    Trash2,
    FileText,
    ExternalLink,
    Landmark,
    Receipt,
    Wallet,
    Percent,
    CreditCard as CreditCardIcon
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeleteInterestPayment } from '@/lib/hooks/use-interest-payments';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PaymentDeleteButton } from '@/components/payments/payment-delete-button';

interface InterestPaymentDetailViewProps {
    payment: IInterestPayment;
}

export function InterestPaymentDetailView({ payment }: InterestPaymentDetailViewProps) {
    const router = useRouter();
    const deleteMutation = useDeleteInterestPayment();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this payment record? This will also revert the loan balance, delete the associated expense and payment records.')) {
            await deleteMutation.mutateAsync(payment._id.toString());
            router.push('/interest-payments');
        }
    };

    // Calculate total if not explicitly there
    const totalAmount = payment.totalAmount || (payment.principalAmount + payment.interestAmount);

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div>
                    <Link href="/interest-payments">
                        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to History
                        </Button>
                    </Link>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
                            <Percent className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Payment Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Recorded on {format(new Date(payment.date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Record
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column: Transaction Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Transaction Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Big Amount Display */}
                        <div className="p-6 text-center bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-border/50">
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Total Amount Paid</div>
                            <div className="text-4xl md:text-5xl font-black text-foreground tabular-nums">
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </div>
                        </div>

                        {/* Split Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Interest</div>
                                <div className="text-xl font-bold text-amber-600">
                                    ₹{payment.interestAmount.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Principal</div>
                                <div className="text-xl font-bold text-success">
                                    ₹{payment.principalAmount.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>

                        {/* Additional Details Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-border/50">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                <div className="mt-1">
                                    <Badge variant="outline" className="capitalize">
                                        {payment.paymentMethod?.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                                <p className="mt-1 font-mono text-sm">
                                    {payment._id.toString().substring(0, 8)}...
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Related Information */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Landmark className="h-5 w-5" />
                                Related Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Loan Account */}
                            <div className="p-4 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                                        <Landmark className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Account</p>
                                        {(() => {
                                            const loanId = typeof payment.loanAccountId === 'object'
                                                ? (payment.loanAccountId as any)._id?.toString()
                                                : payment.loanAccountId?.toString();
                                            const loanName = typeof payment.loanAccountId === 'object'
                                                ? (payment.loanAccountId as any).name
                                                : 'View Loan Account';

                                            return (
                                                <Link href={`/loan-accounts/${loanId}`} className="font-medium hover:underline flex items-center gap-1">
                                                    {loanName} <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest pt-2">Financial Records</div>
                            <div className="space-y-2">
                                {(() => {
                                    const expenseRecordId = typeof payment.expenseId === 'object'
                                        ? (payment.expenseId as any)._id?.toString()
                                        : payment.expenseId?.toString();

                                    if (!expenseRecordId) return null;

                                    return (
                                        <Link
                                            href={`/expenses/${expenseRecordId}`}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted font-medium transition-colors"
                                        >
                                            <span className="flex items-center gap-3 text-sm">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <Receipt className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                Expense Record
                                            </span>
                                            <ExternalLink className="h-4 w-4 opacity-40" />
                                        </Link>
                                    );
                                })()}
                                {(() => {
                                    const paymentRecordId = typeof payment.paymentId === 'object'
                                        ? (payment.paymentId as any)._id?.toString()
                                        : payment.paymentId?.toString();

                                    if (!paymentRecordId) return null;

                                    return (
                                        <Link
                                            href={`/payments/${paymentRecordId}`}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted font-medium transition-colors"
                                        >
                                            <span className="flex items-center gap-3 text-sm">
                                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <Wallet className="h-4 w-4 text-blue-600" />
                                                </div>
                                                Payment Record
                                            </span>
                                            <ExternalLink className="h-4 w-4 opacity-40" />
                                        </Link>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {payment.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic leading-relaxed">
                                    "{payment.notes}"
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
