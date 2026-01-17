'use client';

import { useProcurements } from '@/lib/hooks/use-procurements';
import { motion } from 'framer-motion';
import {
    ShoppingCart, Calendar, User, IndianRupee,
    ArrowRight, Loader2, AlertCircle, ShoppingBag
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerContainer } from '@/lib/utils/animation-variants';
import { ProcurementStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ProcurementHistoryProps {
    itemId: string;
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
        <Badge variant="outline" className={cn("capitalize font-bold text-[10px] px-2 py-0", styles[status])}>
            {status.replace('_', ' ')}
        </Badge>
    );
}

export function ProcurementHistory({ itemId, type }: ProcurementHistoryProps) {
    const { data: procurementsData, isLoading, error } = useProcurements({
        type,
        itemId,
        limit: 10
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-muted/5">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40 mb-3" />
                <p className="text-sm text-muted-foreground animate-pulse">Fetching procurement history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-3 p-6 rounded-2xl bg-destructive/5 border border-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive font-medium">Failed to load procurement history.</p>
            </div>
        );
    }

    const procurements = procurementsData?.data || [];

    if (procurements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-muted/5">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <h4 className="text-sm font-bold text-foreground/70">No Procurement History</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">
                    This item hasn't been part of any procurement records yet.
                </p>
            </div>
        );
    }

    const routeSegment = type === 'raw_material' ? 'raw-materials' : 'trading-goods';

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex items-center gap-3 px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                    <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold tracking-tight">Procurement History</h3>
                    <p className="text-xs text-muted-foreground">Recent orders including this item</p>
                </div>
            </div>

            <div className="grid gap-4">
                {procurements.map((procurement: any) => {
                    // Find the specific item in the procurement to get the price/quantity at that time
                    const itemData = procurement.items.find((i: any) =>
                        (type === 'raw_material' ? i.rawMaterialId : i.tradingGoodId) === itemId
                    );

                    return (
                        <motion.div
                            key={procurement._id}
                            variants={fadeInUp}
                            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-5 transition-all hover:border-primary/20 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-background border border-border/50 group-hover:scale-110 transition-transform duration-500">
                                        <Calendar className="h-5 w-5 text-primary/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-foreground">
                                                {procurement.invoiceNumber || 'PO-DRAFT'}
                                            </span>
                                            <StatusBadge status={procurement.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-3 w-3 text-primary/40" />
                                                <span>{procurement.vendorId?.name || 'Unknown Vendor'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3 text-primary/40" />
                                                <span>{format(new Date(procurement.procurementDate), 'dd MMM yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border/20">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Quantity</span>
                                        <div className="text-base font-black text-foreground">
                                            {itemData?.quantity?.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Price</span>
                                        <div className="text-base font-black text-primary flex items-center">
                                            <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                                            {itemData?.unitPrice?.toLocaleString('en-IN')}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/procurement/${routeSegment}/${procurement._id}`}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-110 hover:shadow-primary/30 active:scale-95"
                                    >
                                        <ArrowRight className="h-5 w-5 text-primary-foreground" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
