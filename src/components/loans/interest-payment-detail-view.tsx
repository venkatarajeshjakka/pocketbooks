/**
 * InterestPaymentDetailView Component
 *
 * Detailed view of a single interest payment transaction.
 */

'use client';

import { IInterestPayment, ILoanAccount } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Wallet,
    Calendar,
    IndianRupee,
    ArrowLeft,
    Trash2,
    FileText,
    ExternalLink,
    Landmark,
    Receipt,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useDeleteInterestPayment } from '@/lib/hooks/use-interest-payments';
import { useRouter } from 'next/navigation';

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

    // Calculate total if not explicitly there (though schema calculates it)
    const totalAmount = payment.totalAmount || (payment.principalAmount + payment.interestAmount);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header / Navigation */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Link href="/interest-payments" className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Payment History
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Details</h1>
                    </div>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        Recorded on {format(new Date(payment.date), 'MMMM dd, yyyy')}
                    </p>
                </div>

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="h-10 rounded-xl px-4 font-bold bg-destructive/90 hover:bg-destructive shadow-lg shadow-destructive/20"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Record
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Amount Summary Card */}
                <Card className="md:col-span-2 border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden group">
                    <CardHeader className="border-b border-border/20 bg-muted/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <IndianRupee className="h-5 w-5 text-success" />
                            Transaction Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-8 text-center bg-gradient-to-br from-success/5 to-transparent">
                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">Total Amount Paid</div>
                            <div className="text-5xl font-black text-foreground tabular-nums">
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-border/20 border-t border-border/20">
                            <div className="p-6 text-center">
                                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Interest Portion</div>
                                <div className="text-xl font-bold text-amber-600">
                                    ₹{payment.interestAmount.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Principal Portion</div>
                                <div className="text-xl font-bold text-success">
                                    ₹{payment.principalAmount.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Meta Info */}
                <div className="space-y-6">
                    {/* Method & Loan Info */}
                    <Card className="border-border/40 bg-card/40 shadow-lg">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Method</div>
                                        <div className="font-bold capitalize">{payment.paymentMethod.replace(/_/g, ' ')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Landmark className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Loan Account</div>
                                        {(() => {
                                            const loanId = typeof payment.loanAccountId === 'object'
                                                ? (payment.loanAccountId as any)._id?.toString()
                                                : payment.loanAccountId?.toString();

                                            return (
                                                <Link href={`/loan-accounts/${loanId}`} className="font-bold text-primary hover:underline flex items-center gap-1">
                                                    View Account <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Integrated Links */}
                    <Card className="border-border/40 bg-card/40 shadow-lg">
                        <CardContent className="p-6 space-y-4">
                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2 border-b border-border/10 pb-2">Financial Records</div>
                            <div className="space-y-3">
                                {(() => {
                                    const expenseRecordId = typeof payment.expenseId === 'object'
                                        ? (payment.expenseId as any)._id?.toString()
                                        : payment.expenseId?.toString();

                                    return (
                                        <Link
                                            href={`/expenses/${expenseRecordId}`}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted font-medium transition-colors"
                                        >
                                            <span className="flex items-center gap-2 text-sm"><Receipt className="h-4 w-4" /> Expense Link</span>
                                            <ExternalLink className="h-4 w-4 opacity-40" />
                                        </Link>
                                    );
                                })()}
                                {(() => {
                                    const paymentRecordId = typeof payment.paymentId === 'object'
                                        ? (payment.paymentId as any)._id?.toString()
                                        : payment.paymentId?.toString();

                                    return (
                                        <Link
                                            href={`/payments/${paymentRecordId}`}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted font-medium transition-colors"
                                        >
                                            <span className="flex items-center gap-2 text-sm"><Wallet className="h-4 w-4" /> Payment Link</span>
                                            <ExternalLink className="h-4 w-4 opacity-40" />
                                        </Link>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Notes Section */}
            {payment.notes && (
                <Card className="border-border/40 bg-card/40 shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/10 pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-[0.1em]">
                            <FileText className="h-4 w-4 opacity-60" /> Notes & References
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 italic text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        "{payment.notes}"
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
