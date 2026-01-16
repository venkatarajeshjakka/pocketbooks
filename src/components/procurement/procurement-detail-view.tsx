'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Edit, Calendar, FileText, ShoppingCart,
    IndianRupee, Package, CreditCard, Clock, Receipt,
    Info, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
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
import { fadeInUp, staggerContainer } from '@/lib/utils/animation-variants';

interface ProcurementDetailViewProps {
    procurement: any;
    type: 'raw_material' | 'trading_good';
}

function StatusBadge({ status }: { status: ProcurementStatus }) {
    const styles: Record<ProcurementStatus, string> = {
        [ProcurementStatus.ORDERED]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        [ProcurementStatus.RECEIVED]: 'bg-success/10 text-success border-success/20',
        [ProcurementStatus.PARTIALLY_RECEIVED]: 'bg-warning/10 text-warning border-warning/20',
        [ProcurementStatus.CANCELLED]: 'bg-destructive/10 text-destructive border-destructive/20',
        [ProcurementStatus.RETURNED]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        [ProcurementStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    return (
        <Badge variant="outline" className={cn("capitalize px-3 py-1 font-bold", styles[status])}>
            {status.replace('_', ' ')}
        </Badge>
    );
}

export function ProcurementDetailView({ procurement, type }: ProcurementDetailViewProps) {
    const endpointType = type === 'raw_material' ? 'raw-materials' : 'trading-goods';
    const listPath = `/procurement/${endpointType}`;
    const editPath = `/procurement/${endpointType}/${procurement._id}/edit`;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-1 flex-col gap-8 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-6">
                <Link
                    href={listPath}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    Back to Procurement
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                            <ShoppingCart className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                                    {procurement.invoiceNumber || 'PO-DRAFT'}
                                </h1>
                                <StatusBadge status={procurement.status} />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground/80 flex items-center gap-2">
                                <span className="text-primary/60">Vendor:</span>
                                {procurement.vendorId?.name || 'Unknown Vendor'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="lg" className="h-12 gap-2 rounded-xl px-6 border-border/60 hover:bg-accent/50">
                            <Link href={editPath}>
                                <Edit className="h-4 w-4 text-primary" />
                                <span className="font-bold">Edit Order</span>
                            </Link>
                        </Button>
                        <ProcurementDeleteButton procurementId={procurement._id} type={type} />
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Details Card */}
                    <motion.div variants={fadeInUp}>
                        <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-xl shadow-xl rounded-2xl">
                            <CardHeader className="bg-muted/30 border-b border-border/10 py-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    Order Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-8 p-8">
                                <div className="space-y-1.5 p-4 rounded-xl bg-accent/5 border border-border/5">
                                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" /> Ordered Date
                                    </span>
                                    <p className="text-lg font-black text-foreground">
                                        {format(new Date(procurement.procurementDate), 'MMMM d, yyyy')}
                                    </p>
                                </div>

                                {procurement.expectedDeliveryDate && (
                                    <div className="space-y-1.5 p-4 rounded-xl bg-accent/5 border border-border/5">
                                        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5" /> Expected Arrival
                                        </span>
                                        <p className="text-lg font-black text-foreground">
                                            {format(new Date(procurement.expectedDeliveryDate), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Payment Terms</span>
                                    <Badge variant="secondary" className="text-sm px-3 py-0.5 rounded-lg">
                                        {procurement.paymentTerms || 'Not Specified'}
                                    </Badge>
                                </div>

                                {procurement.notes && (
                                    <div className="sm:col-span-2 space-y-2">
                                        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Internal Notes</span>
                                        <div className="relative p-4 rounded-xl bg-muted/30 border border-border/20 italic text-muted-foreground text-sm">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-l-xl" />
                                            {procurement.notes}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Line Items Table */}
                    <motion.div variants={fadeInUp}>
                        <Card className="border-border/50 shadow-xl rounded-2xl overflow-hidden bg-card/40">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 p-6">
                                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    Procured Items
                                </CardTitle>
                                <Badge variant="secondary" className="font-mono">
                                    {procurement.items?.length || 0} Total Lines
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="py-4 pl-6 uppercase text-[10px] font-bold tracking-widest">Description</TableHead>
                                            <TableHead className="text-right uppercase text-[10px] font-bold tracking-widest">Qty</TableHead>
                                            <TableHead className="text-right uppercase text-[10px] font-bold tracking-widest">Unit Cost</TableHead>
                                            <TableHead className="text-right pr-6 uppercase text-[10px] font-bold tracking-widest">Taxable Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {procurement.items.map((item: any, idx: number) => (
                                            <TableRow key={idx} className="border-border/5 hover:bg-accent/5 transition-colors">
                                                <TableCell className="py-5 pl-6">
                                                    <span className="font-black text-foreground">
                                                        {item.rawMaterialId?.name || item.tradingGoodId?.name || 'Unknown Item'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {item.quantity} <span className="text-[10px] text-muted-foreground uppercase">{item.unit}</span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-muted-foreground">
                                                    {item.unitPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </TableCell>
                                                <TableCell className="text-right pr-6 font-black text-foreground">
                                                    {item.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Totals Summary Area */}
                                <div className="bg-muted/20 p-8 flex flex-col items-end border-t border-border/10">
                                    <div className="w-full max-w-[320px] space-y-4">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-muted-foreground">Subtotal (Taxable)</span>
                                            <span className="text-foreground">{procurement.originalPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                GST Content <Badge variant="outline" className="text-[9px] h-4 px-1">{procurement.gstPercentage}%</Badge>
                                            </span>
                                            <span className="text-foreground">{procurement.gstAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                        </div>
                                        <Separator className="bg-border/20" />
                                        <div className="flex justify-between items-center py-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grand Total</span>
                                                <span className="text-[9px] text-muted-foreground font-medium">Inclusive of all taxes</span>
                                            </div>
                                            <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">
                                                {procurement.gstBillPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Sidebar Navigation/Summary */}
                <div className="space-y-8">
                    {/* Settlement Summary Card */}
                    <motion.div variants={fadeInUp}>
                        <Card className="relative overflow-hidden border-primary/20 bg-primary/[0.02] shadow-2xl rounded-2xl">
                            <div className="absolute top-0 right-0 p-3 opacity-[0.03] rotate-12">
                                <Receipt className="h-32 w-32" />
                            </div>
                            <CardHeader className="pb-3 border-b border-primary/10">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-black flex items-center gap-2">
                                        <IndianRupee className="h-5 w-5 text-primary" />
                                        Settlement
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
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-success/10 text-success">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Successful</span>
                                    </div>
                                    <span className="text-lg font-black text-success tabular-nums">
                                        {procurement.totalPaid?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            (procurement.remainingAmount || 0) > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground/40"
                                        )}>
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Outstanding</span>
                                    </div>
                                    <span className={cn(
                                        "text-lg font-black tabular-nums transition-all",
                                        (procurement.remainingAmount || 0) > 0
                                            ? "text-destructive scale-110 drop-shadow-sm"
                                            : "text-muted-foreground/30 font-medium scale-90"
                                    )}>
                                        {procurement.remainingAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                </div>

                                <Separator className="bg-primary/10" />

                                <div className="flex flex-col gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Payment Status</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "h-9 w-full justify-center text-sm font-black tracking-tight rounded-xl",
                                            procurement.paymentStatus === 'fully_paid'
                                                ? "bg-success text-white border-none shadow-lg shadow-success/20"
                                                : procurement.paymentStatus === 'partially_paid'
                                                    ? "bg-warning/20 text-warning border-warning/30"
                                                    : "bg-muted text-muted-foreground border-border/50"
                                        )}
                                    >
                                        {procurement.paymentStatus?.replace('_', ' ') || 'Unpaid'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Payment Timeline */}
                    <motion.div variants={fadeInUp}>
                        <Card className="border-border/50 bg-card/20 rounded-2xl shadow-xl overflow-hidden">
                            <CardHeader className="py-4 border-b border-border/10">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Payment Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Suspense fallback={
                                    <div className="p-6 space-y-4">
                                        <Skeleton className="h-12 w-full rounded-xl" />
                                        <Skeleton className="h-12 w-full rounded-xl" />
                                    </div>
                                }>
                                    <ProcurementPaymentHistory procurementId={procurement._id} />
                                </Suspense>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
