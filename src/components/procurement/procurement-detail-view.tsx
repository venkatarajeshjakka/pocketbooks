'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, FileText, ShoppingCart, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ProcurementPaymentHistory } from '@/components/procurement/procurement-payment-history';
import { ProcurementDeleteButton } from '@/components/procurement/procurement-delete-button';
import { AddPaymentDialog } from '@/components/procurement/add-payment-dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProcurementStatus } from '@/types';

interface ProcurementDetailViewProps {
    procurement: any;
    type: 'raw_material' | 'trading_good';
}

function StatusBadge({ status }: { status: ProcurementStatus }) {
    const styles: Record<ProcurementStatus, string> = {
        [ProcurementStatus.ORDERED]: 'bg-blue-100 text-blue-800 border-blue-200',
        [ProcurementStatus.RECEIVED]: 'bg-green-100 text-green-800 border-green-200',
        [ProcurementStatus.PARTIALLY_RECEIVED]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        [ProcurementStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
        [ProcurementStatus.RETURNED]: 'bg-orange-100 text-orange-800 border-orange-200',
        [ProcurementStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
        <Badge variant="outline" className={cn("capitalize px-3 py-1", styles[status] || 'bg-gray-100 text-gray-800 border-gray-200')}>
            {status.replace('_', ' ')}
        </Badge>
    );
}

export function ProcurementDetailView({ procurement, type }: ProcurementDetailViewProps) {
    const endpointType = type === 'raw_material' ? 'raw-material' : 'trading-good';
    const listPath = `/procurement/${endpointType}s`;
    const editPath = `/procurement/${endpointType}/${procurement._id}/edit`;

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={listPath}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{procurement.invoiceNumber || 'No Invoice #'}</h1>
                                <StatusBadge status={procurement.status} />
                            </div>
                            <p className="text-muted-foreground text-sm">
                                {procurement.vendorId?.name || 'Unknown Vendor'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={editPath}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" /> Edit
                        </Button>
                    </Link>
                    <ProcurementDeleteButton procurementId={procurement._id} type={type} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Ordered Date
                                </span>
                                <p className="font-medium">
                                    {format(new Date(procurement.procurementDate), 'PPP')}
                                </p>
                            </div>
                            {procurement.expectedDeliveryDate && (
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">Expected Delivery</span>
                                    <p className="font-medium">
                                        {format(new Date(procurement.expectedDeliveryDate), 'PPP')}
                                    </p>
                                </div>
                            )}
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Payment Terms</span>
                                <p className="font-medium">{procurement.paymentTerms || '-'}</p>
                            </div>
                            {procurement.notes && (
                                <div className="sm:col-span-2 space-y-1">
                                    <span className="text-sm text-muted-foreground">Notes</span>
                                    <p className="text-sm bg-muted/50 p-3 rounded-md">{procurement.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {procurement.items.map((item: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">
                                                {item.rawMaterialId?.name || item.tradingGoodId?.name || 'Unknown Item'}
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                                            <TableCell className="text-right">
                                                {item.unitPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {item.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6 flex justify-end">
                                <div className="w-[300px] space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{procurement.originalPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">GST ({procurement.gstPercentage}%)</span>
                                        <span>{procurement.gstAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-primary">{procurement.gstBillPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                                    Financials
                                </CardTitle>
                                {procurement.remainingAmount > 0 && (
                                    <AddPaymentDialog
                                        procurementId={procurement._id}
                                        procurementType={type}
                                        vendorId={procurement.vendorId?._id || procurement.vendorId}
                                        remainingAmount={procurement.remainingAmount || 0}
                                        currentTranche={procurement.payments?.length || 0}
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Paid</span>
                                <span className="font-bold text-success">
                                    {procurement.totalPaid?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Remaining</span>
                                <span className={cn("font-bold", (procurement.remainingAmount || 0) > 0 ? "text-destructive" : "text-muted-foreground")}>
                                    {procurement.remainingAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Payment Status</span>
                                <Badge variant={procurement.paymentStatus === 'fully_paid' ? 'default' : 'secondary'} className={cn(
                                    "capitalize",
                                    procurement.paymentStatus === 'fully_paid' ? "bg-success hover:bg-success/90" :
                                        procurement.paymentStatus === 'partially_paid' ? "bg-yellow-500 hover:bg-yellow-600" : ""
                                )}>
                                    {procurement.paymentStatus?.replace('_', ' ') || 'Unpaid'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                        <ProcurementPaymentHistory procurementId={procurement._id} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
