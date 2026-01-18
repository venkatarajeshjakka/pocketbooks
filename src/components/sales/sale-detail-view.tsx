
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Edit, Calendar, ShoppingCart,
    IndianRupee, Package, Receipt,
    LayoutDashboard, User, Percent
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { SalePaymentHistory } from '@/components/sales/sale-payment-history';
import { SaleDeleteButton } from '@/components/sales/sale-delete-button';
import { AddSalePaymentDialog } from '@/components/sales/add-sale-payment-dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SaleStatus, ISale, InventoryItemType } from '@/types';
import { fadeInUp, staggerContainer } from '@/lib/utils/animation-variants';

interface SaleDetailViewProps {
    sale: ISale;
}

function StatusBadge({ status }: { status: SaleStatus }) {
    const styles: Record<SaleStatus, string> = {
        [SaleStatus.PENDING]: 'bg-warning/10 text-warning border-warning/20',
        [SaleStatus.PARTIALLY_PAID]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        [SaleStatus.COMPLETED]: 'bg-success/10 text-success border-success/20',
        [SaleStatus.CANCELLED]: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
        <Badge variant="outline" className={cn("capitalize px-3 py-1 font-bold", styles[status])}>
            {status?.replace('_', ' ') || 'Unknown'}
        </Badge>
    );
}

export function SaleDetailView({ sale }: SaleDetailViewProps) {
    const listPath = '/sales';
    const editPath = `/sales/${sale._id.toString()}/edit`;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-1 flex-col gap-8 pb-20 max-w-7xl mx-auto w-full"
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
                    Back to Sales
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                            <ShoppingCart className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                                    {sale.invoiceNumber || 'INV-DRAFT'}
                                </h1>
                                <StatusBadge status={sale.status} />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground/80 flex items-center gap-2">
                                <span className="text-primary/60"><User className="h-4 w-4 inline mr-1" />Client:</span>
                                {(sale.clientId as any)?.name || 'Unknown Client'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="lg" className="h-12 gap-2 rounded-xl px-6 border-border/60 hover:bg-accent/50">
                            <Link href={editPath}>
                                <Edit className="h-4 w-4 text-primary" />
                                <span className="font-bold">Edit Sale</span>
                            </Link>
                        </Button>
                        <SaleDeleteButton saleId={sale._id.toString()} />
                    </div>
                </div>
            </motion.div>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="h-14 p-1.5 bg-muted/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-inner mb-8 px-1.5 gap-1.5 w-full sm:w-auto">
                    <TabsTrigger
                        value="overview"
                        className="h-full px-8 rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="payment_history"
                        className="h-full px-8 rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        Payment History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 ring-offset-background focus-visible:outline-none">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-8 lg:grid-cols-3"
                    >
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Sale Details Card */}
                            <motion.div variants={fadeInUp}>
                                <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-sm rounded-2xl">
                                    <div className="p-6 grid sm:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" /> Date
                                            </span>
                                            <p className="text-base font-bold text-foreground">
                                                {format(new Date(sale.saleDate), 'dd MMM yyyy')}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" /> Delivery
                                            </span>
                                            {sale.expectedDeliveryDate ? (
                                                <p className="text-base font-bold text-foreground">
                                                    {format(new Date(sale.expectedDeliveryDate), 'dd MMM yyyy')}
                                                </p>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">--</span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Payment Terms</span>
                                            <p className="text-base font-medium text-foreground">
                                                {sale.paymentTerms || 'Immediate'}
                                            </p>
                                        </div>
                                    </div>

                                    {sale.notes && (
                                        <div className="px-6 pb-6 pt-0">
                                            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 block">Notes</span>
                                            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/5">
                                                {sale.notes}
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>

                            {/* Line Items Table */}
                            <motion.div variants={fadeInUp}>
                                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-card/40">
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 p-6 py-4">
                                        <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2 uppercase text-muted-foreground/70">
                                            <Package className="h-4 w-4" />
                                            Items
                                        </CardTitle>
                                        <Badge variant="outline" className="font-mono text-xs text-foreground bg-background/50">
                                            {sale.items?.length || 0} Lines
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-muted/10">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="py-3 pl-6 uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Item</TableHead>
                                                    <TableHead className="text-right uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Qty</TableHead>
                                                    <TableHead className="text-right uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Price</TableHead>
                                                    <TableHead className="text-right pr-6 uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sale.items.map((item: any, idx: number) => (
                                                    <TableRow key={idx} className="border-border/5 hover:bg-muted/5 transition-colors">
                                                        <TableCell className="py-4 pl-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm text-foreground">
                                                                    {item.itemId?.name || item.name || 'Unknown Item'}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                                    {item.itemType === InventoryItemType.FINISHED_GOOD ? 'FG' : 'TG'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right text-sm font-medium">
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell className="text-right text-sm font-medium text-muted-foreground">
                                                            {item.unitPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6 font-bold text-sm text-foreground">
                                                            {item.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Totals Summary Area */}
                                        <div className="bg-muted/5 p-6 flex flex-col items-end border-t border-border/10">
                                            <div className="w-full max-w-[280px] space-y-3">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span className="text-foreground font-mono">{sale.subtotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-muted-foreground">Discount</span>
                                                    <span className="text-foreground font-mono text-destructive">- {sale.discount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                                        GST <span className="text-[9px] bg-muted px-1 rounded text-muted-foreground">{sale.gstPercentage || 0}%</span>
                                                    </span>
                                                    <span className="text-foreground font-mono">{sale.gstAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                                </div>
                                                <Separator className="bg-border/40" />
                                                <div className="flex justify-between items-end pt-1">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</span>
                                                    <span className="text-2xl font-black text-foreground tracking-tighter tabular-nums">
                                                        {sale.grandTotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
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
                                <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-sm rounded-2xl">
                                    <div className="absolute top-0 right-0 p-3 opacity-[0.03] rotate-12">
                                        <Receipt className="h-32 w-32" />
                                    </div>

                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-extrabold flex items-center gap-2 uppercase tracking-tight text-foreground/80">
                                                <IndianRupee className="h-4 w-4" />
                                                Settlement
                                            </CardTitle>
                                            <Badge variant="outline" className={cn(
                                                "capitalize font-bold shadow-sm border",
                                                sale.paymentStatus === 'fully_paid' && "bg-success/10 text-success border-success/20",
                                                sale.paymentStatus === 'partially_paid' && "bg-warning/10 text-warning border-warning/20",
                                                (!sale.paymentStatus || sale.paymentStatus === 'unpaid') && "bg-destructive/10 text-destructive border-destructive/20",
                                            )}>
                                                {sale.paymentStatus?.replace('_', ' ') || 'Unpaid'}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <div className="px-6 pb-6 space-y-6">
                                        {/* Main Number */}
                                        <div className="space-y-1 text-center py-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                {(sale.remainingAmount || 0) > 0 ? 'Outstanding Amount' : 'Payment Complete'}
                                            </span>
                                            <div className={cn(
                                                "text-4xl font-black tracking-tighter tabular-nums flex items-center justify-center gap-1",
                                                (sale.remainingAmount || 0) > 0 ? "text-destructive" : "text-success"
                                            )}>
                                                <span className="text-2xl opacity-50">₹</span>
                                                {((sale.remainingAmount || 0) > 0 ? sale.remainingAmount : sale.grandTotal)?.toLocaleString('en-IN')}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                                <span>Received</span>
                                                <span>{Math.round(((sale.totalPaid || 0) / (sale.grandTotal || 1)) * 100)}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full transition-all duration-1000 ease-out rounded-full",
                                                        (sale.remainingAmount || 0) > 0 ? "bg-destructive" : "bg-success"
                                                    )}
                                                    style={{ width: `${Math.min(100, ((sale.totalPaid || 0) / (sale.grandTotal || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-px bg-border/20 rounded-lg overflow-hidden">
                                            <div className="bg-card/50 p-3 flex flex-col items-center justify-center gap-0.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</span>
                                                <span className="font-bold text-sm">
                                                    {(sale.grandTotal || 0) >= 100000
                                                        ? `${((sale.grandTotal || 0) / 1000).toFixed(1)}k`
                                                        : sale.grandTotal?.toLocaleString('en-IN')
                                                    }
                                                </span>
                                            </div>
                                            <div className="bg-card/50 p-3 flex flex-col items-center justify-center gap-0.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paid</span>
                                                <span className="font-bold text-sm text-success">
                                                    {(sale.totalPaid || 0) >= 100000
                                                        ? `${((sale.totalPaid || 0) / 1000).toFixed(1)}k`
                                                        : sale.totalPaid?.toLocaleString('en-IN')
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {(sale.remainingAmount || 0) > 0 && (
                                            <div className="pt-2">
                                                <AddSalePaymentDialog
                                                    saleId={sale._id.toString()}
                                                    remainingAmount={sale.remainingAmount || 0}
                                                    currentTranche={0} // Ideally we count payments
                                                    trigger={
                                                        <Button className="w-full font-bold shadow-lg shadow-primary/20" size="lg">
                                                            Record Payment
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        </div>
                    </motion.div>
                </TabsContent>

                <TabsContent value="payment_history" className="mt-0 ring-offset-background focus-visible:outline-none">
                    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                        <Card className="border-border/50 bg-card/20 rounded-2xl shadow-xl overflow-hidden">
                            <CardHeader className="py-6 border-b border-border/10 bg-muted/20">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 text-foreground">
                                    <Receipt className="h-5 w-5 text-primary" />
                                    Payment History
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Track all payments received for this sale</p>
                            </CardHeader>
                            <CardContent className="p-0">
                                <SalePaymentHistory saleId={sale._id.toString()} />
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
