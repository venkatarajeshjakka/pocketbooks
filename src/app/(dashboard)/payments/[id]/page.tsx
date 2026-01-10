/**
 * Payment Detail Page
 * Shows detailed payment information
 */

import { notFound } from 'next/navigation';
import { CreditCard, ArrowLeft, Edit, Trash2, Calendar, Hash, FileText, User, Building, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Payment, Client, Vendor, Asset, Sale } from '@/models';
import { connectToDatabase } from '@/lib/api-helpers';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PaymentDeleteButton } from '@/components/payments/payment-delete-button';

interface PaymentDetailPageProps {
    params: Promise<{ id: string }>;
}

function getTransactionTypeBadgeStyles(type: string) {
    switch (type?.toLowerCase()) {
        case 'sale':
            return 'bg-success/10 text-success border-success/20';
        case 'purchase':
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'expense':
            return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

function getPaymentMethodBadgeStyles(method: string) {
    switch (method?.toLowerCase()) {
        case 'cash':
            return 'bg-green-500/10 text-green-600 border-green-500/20';
        case 'bank_transfer':
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        case 'upi':
            return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        case 'cheque':
            return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        case 'credit_card':
            return 'bg-red-500/10 text-red-600 border-red-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
    const { id } = await params;

    let payment: any;
    try {
        await connectToDatabase();
        payment = await Payment.findById(id)
            .populate('assetId')
            .populate('saleId')
            .lean();

        if (!payment) {
            notFound();
        }

        // Manually populate partyId based on partyType
        if (payment.partyId && payment.partyType) {
            if (payment.partyType === 'client') {
                const client = await Client.findById(payment.partyId).lean();
                payment.party = client;
            } else if (payment.partyType === 'vendor') {
                const vendor = await Vendor.findById(payment.partyId).lean();
                payment.party = vendor;
            }
        }
    } catch (error) {
        console.error('Failed to fetch payment:', error);
        notFound();
    }

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/payments">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Payments
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
                            <CreditCard className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Payment Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {payment.transactionId || `Payment on ${format(new Date(payment.paymentDate), 'dd MMM yyyy')}`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/payments/${id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <PaymentDeleteButton
                        paymentId={id}
                        paymentDescription={payment.transactionId || `Payment of ₹${payment.amount.toLocaleString('en-IN')}`}
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Payment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                <p className="mt-1 text-2xl font-bold text-primary">
                                    ₹{payment.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                                <p className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(payment.paymentDate), 'dd MMMM yyyy')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Transaction Type</label>
                                <div className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={cn('capitalize', getTransactionTypeBadgeStyles(payment.transactionType))}
                                    >
                                        {payment.transactionType}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                <div className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={cn('capitalize', getPaymentMethodBadgeStyles(payment.paymentMethod))}
                                    >
                                        {payment.paymentMethod?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                                <p className="mt-1 capitalize">{payment.accountType}</p>
                            </div>
                            {payment.transactionId && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                                    <p className="mt-1 flex items-center gap-2 font-mono text-sm">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        {payment.transactionId}
                                    </p>
                                </div>
                            )}
                        </div>
                        {payment.notes && (
                            <div className="pt-4 border-t border-border/50">
                                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                <p className="mt-1 text-sm flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    {payment.notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Party & Related Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Related Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Party Information */}
                        {payment.party && (
                            <div className="p-4 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        {payment.partyType === 'vendor' ? (
                                            <Building className="h-5 w-5 text-primary" />
                                        ) : (
                                            <User className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            {payment.partyType === 'vendor' ? 'Vendor' : 'Client'}
                                        </p>
                                        <Link
                                            href={`/${payment.partyType === 'vendor' ? 'vendors' : 'clients'}/${payment.party._id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {payment.party.name}
                                        </Link>
                                        {payment.party.email && (
                                            <p className="text-sm text-muted-foreground">{payment.party.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Asset Information */}
                        {payment.assetId && (
                            <div className="p-4 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                        <Package className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Asset</p>
                                        <Link
                                            href={`/assets/${payment.assetId._id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {payment.assetId.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">
                                            ₹{payment.assetId.purchasePrice?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sale Information */}
                        {payment.saleId && (
                            <div className="p-4 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                        <CreditCard className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Sale</p>
                                        <Link
                                            href={`/sales/${payment.saleId._id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {payment.saleId.saleNumber || 'View Sale'}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">
                                            ₹{payment.saleId.totalAmount?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="pt-4 border-t border-border/50 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p className="mt-1 text-sm">
                                    {format(new Date(payment.createdAt), 'dd MMM yyyy, hh:mm a')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="mt-1 text-sm">
                                    {format(new Date(payment.updatedAt), 'dd MMM yyyy, hh:mm a')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: PaymentDetailPageProps) {
    const { id } = await params;

    try {
        await connectToDatabase();
        const payment = await Payment.findById(id).lean();

        if (payment) {
            return {
                title: `Payment - ₹${payment.amount.toLocaleString('en-IN')} | PocketBooks`,
                description: `View payment details`,
            };
        }
    } catch (error) {
        console.error('Failed to fetch payment for metadata:', error);
    }

    return {
        title: 'Payment Details | PocketBooks',
        description: 'View payment details',
    };
}
