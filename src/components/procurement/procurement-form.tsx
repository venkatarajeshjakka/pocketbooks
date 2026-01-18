'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, Plus, Trash2, Calculator, IndianRupee, Calendar as CalendarIcon, FileText, ShoppingCart, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ProcurementStatus, PaymentStatus, PaymentMethod } from '@/types';
import { useVendors } from '@/lib/hooks/use-vendors';
import { useRawMaterials, useTradingGoods } from '@/lib/hooks/use-inventory-items';
import { useCreateProcurement, useUpdateProcurement, useProcurement } from '@/lib/hooks/use-procurements';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EditPreviewDialog } from '@/components/shared/entity/edit-preview-dialog';

interface ProcurementItem {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

interface ProcurementFormData {
    vendorId: string;
    procurementDate: Date;
    expectedDeliveryDate?: Date;
    invoiceNumber: string;
    paymentTerms: string;
    notes: string;
    items: ProcurementItem[];
    gstPercentage: number;
    totalAmount: number;
    gstAmount: number;
    grandTotal: number;
    status: ProcurementStatus;
}

interface PaymentFormData {
    recordPayment: boolean;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    notes: string;
    tranches: number;
}

interface ProcurementFormProps {
    type: 'raw_material' | 'trading_good';
    mode: 'create' | 'edit';
    initialData?: any;
    procurementId?: string;
}

export function ProcurementForm({ type, mode, initialData, procurementId }: ProcurementFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [changes, setChanges] = useState<any[]>([]);

    const { data: vendorsData, isLoading: vendorsLoading } = useVendors({ limit: 100 });
    const inventoryHook = type === 'raw_material' ? useRawMaterials : useTradingGoods;
    const { data: inventoryData, isLoading: inventoryLoading } = inventoryHook({ limit: 100 });

    const { data: procurementDataResponse, isLoading: procurementLoading } = useProcurement(type, mode === 'edit' ? (procurementId || '') : '', {
        enabled: mode === 'edit' && !!procurementId && !initialData,
    });
    const procurementData = initialData || procurementDataResponse;

    const [formData, setFormData] = useState<ProcurementFormData>({
        vendorId: '',
        procurementDate: new Date(),
        invoiceNumber: '',
        paymentTerms: '',
        notes: '',
        items: [],
        gstPercentage: 18,
        totalAmount: 0,
        gstAmount: 0,
        grandTotal: 0,
        status: ProcurementStatus.ORDERED,
    });

    // Initialize/Sync form data
    useEffect(() => {
        if (procurementData) {
            setFormData({
                vendorId: typeof procurementData.vendorId === 'object' ? procurementData.vendorId?._id : (procurementData.vendorId || ''),
                procurementDate: procurementData.procurementDate ? new Date(procurementData.procurementDate) : new Date(),
                expectedDeliveryDate: procurementData.expectedDeliveryDate ? new Date(procurementData.expectedDeliveryDate) : undefined,
                invoiceNumber: procurementData.invoiceNumber || '',
                paymentTerms: procurementData.paymentTerms || '',
                notes: procurementData.notes || '',
                items: procurementData.items?.map((item: any) => ({
                    itemId: type === 'raw_material' ? (item.rawMaterialId?._id || item.rawMaterialId) : (item.tradingGoodId?._id || item.tradingGoodId),
                    name: item.name || item.rawMaterialId?.name || item.tradingGoodId?.name || 'Unknown Item',
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    amount: item.amount || 0
                })) || [],
                gstPercentage: procurementData.gstPercentage || 18,
                totalAmount: procurementData.originalPrice || 0,
                gstAmount: procurementData.gstAmount || 0,
                grandTotal: procurementData.gstBillPrice || 0,
                status: procurementData.status || ProcurementStatus.ORDERED,
            });
        }
    }, [procurementData, type]);

    const [paymentData, setPaymentData] = useState<PaymentFormData>({
        recordPayment: false,
        amount: 0,
        paymentMethod: PaymentMethod.UPI,
        paymentDate: new Date(),
        notes: '',
        tranches: 1,
    });

    // Calculate totals
    useEffect(() => {
        const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const gstAmount = (totalAmount * formData.gstPercentage) / 100;
        const grandTotal = totalAmount + gstAmount;

        setFormData(prev => ({
            ...prev,
            totalAmount,
            gstAmount,
            grandTotal
        }));

        if (paymentData.recordPayment && mode === 'create' && paymentData.amount === 0) {
            setPaymentData(prev => ({ ...prev, amount: grandTotal }));
        }
    }, [formData.items, formData.gstPercentage, mode, paymentData.recordPayment]);

    const updateFormField = <K extends keyof ProcurementFormData>(field: K, value: ProcurementFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleAddItem = (itemId: string, name: string) => {
        if (formData.items.some(i => i.itemId === itemId)) {
            toast.error('Item already added');
            return;
        }

        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    itemId,
                    name,
                    quantity: 1,
                    unitPrice: 0,
                    amount: 0
                }
            ]
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index: number, field: keyof ProcurementItem, value: number) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index], [field]: value };
            item.amount = item.quantity * item.unitPrice;
            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.vendorId) newErrors.vendorId = 'Vendor is required';
        if (!formData.procurementDate) newErrors.procurementDate = 'Date is required';
        if (formData.items.length === 0) newErrors.items = 'At least one item is required';

        formData.items.forEach((item, index) => {
            if (item.quantity <= 0) newErrors[`item_${index}_qty`] = 'Quantity > 0';
            if (item.unitPrice < 0) newErrors[`item_${index}_price`] = 'Price >= 0';
        });

        if (paymentData.recordPayment) {
            if (paymentData.amount <= 0) newErrors.paymentAmount = 'Amount > 0';
            if (paymentData.amount > formData.grandTotal) newErrors.paymentAmount = 'Cannot exceed total';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createMutation = useCreateProcurement(type);
    const updateMutation = useUpdateProcurement(type);

    if (mode === 'edit' && procurementLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading procurement details...</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix form errors before submitting');
            return;
        }

        if (mode === 'edit') {
            const detectedChanges = getDetectedChanges();
            if (detectedChanges.length > 0) {
                setChanges(detectedChanges);
                setIsPreviewOpen(true);
                return;
            }
        }

        await actualSubmit();
    };

    const getDetectedChanges = () => {
        const changes: any[] = [];
        const labels: Record<string, string> = {
            vendorId: 'Vendor',
            procurementDate: 'Procurement Date',
            expectedDeliveryDate: 'Expected Delivery',
            invoiceNumber: 'Invoice Number',
            paymentTerms: 'Payment Terms',
            status: 'Status',
            gstPercentage: 'GST %',
            grandTotal: 'Grand Total',
            items: 'Items'
        };

        const fieldTypes: Record<string, 'text' | 'price' | 'date' | 'status' | 'list'> = {
            procurementDate: 'date',
            expectedDeliveryDate: 'date',
            grandTotal: 'price',
            status: 'status',
            items: 'list'
        };

        Object.keys(labels).forEach(key => {
            let oldValue = procurementData[key];
            let newValue = (formData as any)[key];

            if (key === 'vendorId') {
                const oldId = typeof oldValue === 'object' ? oldValue?._id : oldValue;
                const newId = newValue;

                if (oldId !== newId) {
                    const oldVendorName = typeof oldValue === 'object' ? oldValue?.name : vendorsData?.data.find((v: any) => v._id === oldId)?.name || oldId;
                    const newVendorName = vendorsData?.data.find((v: any) => v._id === newId)?.name || newId;

                    changes.push({
                        field: key,
                        label: labels[key],
                        oldValue: oldVendorName,
                        newValue: newVendorName,
                        type: 'text'
                    });
                }
            } else if (key === 'items') {
                const normalize = (items: any[]) => items?.map(i => ({
                    id: i.rawMaterialId || i.tradingGoodId || i.itemId,
                    name: i.name || 'Unknown Item',
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice)
                })).sort((a, b) => (a.id || '').localeCompare(b.id || '')) || [];

                const normalizedOld = normalize(oldValue);
                const normalizedNew = normalize(newValue);

                if (JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew)) {
                    // Generate a more descriptive summary for items
                    const itemChanges: string[] = [];

                    if (normalizedOld.length !== normalizedNew.length) {
                        itemChanges.push(`${normalizedOld.length} -> ${normalizedNew.length} items`);
                    } else {
                        normalizedNew.forEach((newItem, idx) => {
                            const oldItem = normalizedOld[idx];
                            if (JSON.stringify(newItem) !== JSON.stringify(oldItem)) {
                                if (newItem.quantity !== oldItem.quantity) {
                                    itemChanges.push(`${newItem.name}: Qty ${oldItem.quantity} -> ${newItem.quantity}`);
                                } else if (newItem.unitPrice !== oldItem.unitPrice) {
                                    itemChanges.push(`${newItem.name}: Price ₹${oldItem.unitPrice} -> ₹${newItem.unitPrice}`);
                                } else {
                                    itemChanges.push(`${newItem.name} modified`);
                                }
                            }
                        });
                    }

                    changes.push({
                        field: key,
                        label: labels[key],
                        oldValue: normalizedOld.length === 1 ? '1 item' : `${normalizedOld.length} items`,
                        newValue: itemChanges.length > 0 ? itemChanges.join(', ') : (normalizedNew.length === 1 ? '1 item' : `${normalizedNew.length} items`),
                        type: 'list'
                    });
                }
            } else if (key === 'procurementDate' || key === 'expectedDeliveryDate') {
                const oldDate = oldValue ? new Date(oldValue).toDateString() : null;
                const newDate = newValue ? new Date(newValue).toDateString() : null;
                if (oldDate !== newDate) {
                    changes.push({
                        field: key,
                        label: labels[key],
                        oldValue: oldValue,
                        newValue: newValue,
                        type: 'date'
                    });
                }
            } else if (oldValue !== newValue && newValue !== undefined) {
                changes.push({
                    field: key,
                    label: labels[key],
                    oldValue,
                    newValue,
                    type: fieldTypes[key] || 'text'
                });
            }
        });

        return changes;
    };

    const actualSubmit = async () => {
        setIsSubmitting(true);
        setIsPreviewOpen(false);
        try {
            const payload = {
                ...formData,
                items: formData.items.map(item => ({
                    [type === 'raw_material' ? 'rawMaterialId' : 'tradingGoodId']: item.itemId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    amount: item.amount
                })),
                vendorId: formData.vendorId, // Explicitly send vendor ID
                initialPayment: paymentData.recordPayment ? {
                    amount: paymentData.amount,
                    paymentMethod: paymentData.paymentMethod,
                    paymentDate: paymentData.paymentDate,
                    notes: paymentData.notes
                } : undefined
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
                toast.success('Procurement created successfully');
            } else {
                await updateMutation.mutateAsync({ id: procurementId!, input: payload });
                toast.success('Procurement updated successfully');
            }

            const endpointType = type === 'raw_material' ? 'raw-materials' : 'trading-goods';
            router.push(`/procurement/${endpointType}`);
            router.refresh();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save procurement');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <TooltipProvider>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-12 pb-32">
                <AnimatePresence mode="popLayout">
                    {/* Basic Information Section */}
                    <motion.div
                        key="basic-info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="relative"
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                    <FileText className="h-6 w-6 text-primary relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Basic Details
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Essential procurement information
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Vendor */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="vendor" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Vendor
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.vendorId}
                                            onValueChange={v => updateFormField('vendorId', v)}
                                            disabled={mode === 'edit' || isSubmitting}
                                        >
                                            <SelectTrigger id="vendor" className={cn(
                                                "h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4",
                                                errors.vendorId && "border-destructive/50"
                                            )}>
                                                <SelectValue placeholder="Select vendor" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                {vendorsData?.data.map((v: any) => (
                                                    <SelectItem key={v._id} value={v._id} className="focus:bg-primary/10 transition-colors">
                                                        <span className="font-medium">{v.name}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.vendorId && (
                                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                                <Info className="h-3 w-3" /> {errors.vendorId}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Procurement Date */}
                                    <div className="space-y-2.5">
                                        <Label className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Procurement Date
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <DatePicker
                                            date={formData.procurementDate}
                                            onDateChange={d => d && updateFormField('procurementDate', d)}
                                        />
                                    </div>

                                    {/* Invoice Number */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="invoiceNumber" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Invoice Number
                                        </Label>
                                        <Input
                                            id="invoiceNumber"
                                            value={formData.invoiceNumber}
                                            onChange={e => updateFormField('invoiceNumber', e.target.value)}
                                            placeholder="e.g., INV-001"
                                            disabled={isSubmitting}
                                            className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="status" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Status
                                        </Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={s => updateFormField('status', s as ProcurementStatus)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="status" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                {Object.values(ProcurementStatus).map(s => (
                                                    <SelectItem key={s} value={s} className="focus:bg-primary/10 transition-colors">
                                                        <span className="capitalize font-medium">{s.replace('_', ' ')}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {(formData.status === ProcurementStatus.RECEIVED || formData.status === ProcurementStatus.COMPLETED) ? (
                                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                                <p className="text-[10px] text-success font-bold uppercase tracking-wider">
                                                    Inventory will be updated
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-70">
                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                                    No inventory impact in this status
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expected Delivery Date */}
                                    <div className="space-y-2.5">
                                        <Label className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Expected Delivery Date
                                        </Label>
                                        <DatePicker
                                            date={formData.expectedDeliveryDate}
                                            onDateChange={d => updateFormField('expectedDeliveryDate', d)}
                                        />
                                    </div>

                                    {/* Payment Terms */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="paymentTerms" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Payment Terms
                                        </Label>
                                        <Input
                                            id="paymentTerms"
                                            value={formData.paymentTerms}
                                            onChange={e => updateFormField('paymentTerms', e.target.value)}
                                            placeholder="e.g., Net 30"
                                            disabled={isSubmitting}
                                            className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label htmlFor="notes" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Notes
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={e => updateFormField('notes', e.target.value)}
                                            placeholder="Additional notes about this procurement..."
                                            rows={3}
                                            disabled={isSubmitting}
                                            className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Items & Pricing Section */}
                    <motion.div
                        key="items-pricing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="relative"
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-success/5 overflow-hidden group hover:border-success/20 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-success/10 transition-colors" />

                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20 bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-transparent opacity-50" />
                                        <ShoppingCart className="h-6 w-6 text-success relative z-10" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                            Items & Pricing
                                        </CardTitle>
                                        <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                            Add items and calculate costs
                                        </CardDescription>
                                    </div>
                                </div>

                                <Select
                                    value=""
                                    onValueChange={(val) => {
                                        const item = inventoryData?.data.find((i: any) => i._id === val);
                                        if (item) handleAddItem(item._id.toString(), item.name);
                                    }}
                                    disabled={inventoryLoading || !inventoryData?.data || inventoryData.data.length === 0}
                                >
                                    <SelectTrigger className="w-[220px] h-10 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors rounded-xl disabled:opacity-50">
                                        <div className="flex items-center gap-2">
                                            {inventoryLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                                    <span className="text-sm font-semibold">Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-semibold">Add Item</span>
                                                </>
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl">
                                        {inventoryLoading ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                                Loading items...
                                            </div>
                                        ) : !inventoryData?.data || inventoryData.data.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                <p className="mb-2">No items available</p>
                                                <p className="text-xs">
                                                    Create {type === 'raw_material' ? 'raw materials' : 'trading goods'} first
                                                </p>
                                            </div>
                                        ) : (
                                            inventoryData.data.map((item: any) => (
                                                <SelectItem key={item._id} value={item._id} className="focus:bg-primary/10 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.name}</span>
                                                        {item.sku && <span className="text-xs text-muted-foreground">SKU: {item.sku}</span>}
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </CardHeader>

                            <CardContent className="px-6 py-6 space-y-6">
                                {/* Items Table */}
                                <div className="rounded-xl border border-border/40 overflow-hidden shadow-inner bg-muted/10">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent border-border/20">
                                                <TableHead className="font-bold text-foreground/70">Item</TableHead>
                                                <TableHead className="text-right font-bold text-foreground/70">Quantity</TableHead>
                                                <TableHead className="text-right font-bold text-foreground/70">Unit Price</TableHead>
                                                <TableHead className="text-right font-bold text-foreground/70">Total</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {formData.items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                                                            <p className="font-medium">No items added yet</p>
                                                            <p className="text-xs">Click "Add Item" to start building your procurement</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                formData.items.map((item, index) => (
                                                    <TableRow key={item.itemId} className="hover:bg-muted/20 transition-colors">
                                                        <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                                                        <TableCell className="w-[120px]">
                                                            <Input
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                className="text-right h-10 bg-background/50 border-border/30 focus:border-primary/50 rounded-lg"
                                                                value={item.quantity}
                                                                onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-[120px]">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="text-right h-10 bg-background/50 border-border/30 focus:border-primary/50 rounded-lg"
                                                                value={item.unitPrice}
                                                                onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-success font-mono">
                                                            ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                                onClick={() => handleRemoveItem(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Financial Summary */}
                                <div className="flex justify-end">
                                    <div className="w-full max-w-md space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/20">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground font-medium">Subtotal</span>
                                            <span className="font-mono font-bold text-foreground">
                                                ₹{formData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground font-medium">GST</span>
                                                <Select
                                                    value={formData.gstPercentage.toString()}
                                                    onValueChange={v => updateFormField('gstPercentage', parseFloat(v))}
                                                >
                                                    <SelectTrigger className="h-8 w-[80px] text-xs bg-background/50 border-border/30 rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-lg">
                                                        {[0, 5, 12, 18, 28].map(p => (
                                                            <SelectItem key={p} value={p.toString()} className="text-xs focus:bg-primary/10">
                                                                {p}%
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <span className="font-mono font-bold text-foreground">
                                                ₹{formData.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <div className="h-px bg-border/40" />

                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-base font-bold text-foreground">Grand Total</span>
                                            <span className="text-2xl font-black text-primary font-mono">
                                                ₹{formData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Payment Section */}
                    {mode === 'create' && (
                        <motion.div
                            key="payment-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="relative"
                        >
                            <Card className={cn(
                                "border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden group transition-all duration-500",
                                paymentData.recordPayment ? "ring-2 ring-primary/30 shadow-primary/10" : "hover:border-warning/20 shadow-warning/5"
                            )}>
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl transition-colors",
                                    paymentData.recordPayment ? "bg-primary/10" : "bg-warning/5 group-hover:bg-warning/10"
                                )} />

                                <CardHeader
                                    className="flex flex-row items-center justify-between pb-4 border-b border-border/20 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => setPaymentData(prev => ({ ...prev, recordPayment: !prev.recordPayment }))}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500",
                                            paymentData.recordPayment ? "bg-primary/10" : "bg-warning/10"
                                        )}>
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-br to-transparent opacity-50",
                                                paymentData.recordPayment ? "from-primary/20" : "from-warning/20"
                                            )} />
                                            <Wallet className={cn(
                                                "h-6 w-6 relative z-10",
                                                paymentData.recordPayment ? "text-primary" : "text-warning"
                                            )} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                                Payment Details
                                            </CardTitle>
                                            <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                                {paymentData.recordPayment ? 'Recording initial payment' : 'Click to record initial payment'}
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "h-7 w-14 rounded-full p-1 transition-all duration-300",
                                        paymentData.recordPayment ? "bg-primary shadow-inner shadow-primary/20" : "bg-muted"
                                    )}>
                                        <div className={cn(
                                            "h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300",
                                            paymentData.recordPayment ? "translate-x-7" : "translate-x-0"
                                        )} />
                                    </div>
                                </CardHeader>

                                <AnimatePresence>
                                    {paymentData.recordPayment && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <CardContent className="px-6 py-6">
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <div className="space-y-2.5">
                                                        <Label htmlFor="paymentAmount" className="text-sm font-semibold tracking-tight text-foreground/80">
                                                            Paid Amount
                                                        </Label>
                                                        <Input
                                                            id="paymentAmount"
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={paymentData.amount}
                                                            onChange={e => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                                            className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                                        />
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        <Label htmlFor="paymentMethod" className="text-sm font-semibold tracking-tight text-foreground/80">
                                                            Payment Method
                                                        </Label>
                                                        <Select
                                                            value={paymentData.paymentMethod}
                                                            onValueChange={m => setPaymentData(prev => ({ ...prev, paymentMethod: m as PaymentMethod }))}
                                                        >
                                                            <SelectTrigger id="paymentMethod" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl">
                                                                {Object.values(PaymentMethod).map(m => (
                                                                    <SelectItem key={m} value={m} className="focus:bg-primary/10 transition-colors">
                                                                        <span className="capitalize font-medium">{m.replace('_', ' ')}</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        <Label className="text-sm font-semibold tracking-tight text-foreground/80">
                                                            Payment Date
                                                        </Label>
                                                        <DatePicker
                                                            date={paymentData.paymentDate}
                                                            onDateChange={d => d && setPaymentData(prev => ({ ...prev, paymentDate: d }))}
                                                        />
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        <Label htmlFor="tranches" className="text-sm font-semibold tracking-tight text-foreground/80">
                                                            Total Tranches
                                                        </Label>
                                                        <Input
                                                            id="tranches"
                                                            type="number"
                                                            min="1"
                                                            value={paymentData.tranches}
                                                            onChange={e => setPaymentData(prev => ({ ...prev, tranches: parseInt(e.target.value) || 1 }))}
                                                            className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                                        />
                                                    </div>

                                                    <div className="space-y-2.5 md:col-span-2">
                                                        <Label htmlFor="paymentNotes" className="text-sm font-semibold tracking-tight text-foreground/80">
                                                            Payment Notes
                                                        </Label>
                                                        <Textarea
                                                            id="paymentNotes"
                                                            value={paymentData.notes}
                                                            onChange={e => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                                            placeholder="UPI reference, check number, or other payment details..."
                                                            rows={3}
                                                            className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fixed Footer with Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-background/40 backdrop-blur-2xl border-t border-border/30 z-50 shadow-[0_-12px_40px_rgba(0,0,0,0.1)]">
                    <div className="mx-auto max-w-4xl px-8 md:px-12">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                                <kbd className="px-2 py-1 bg-background rounded border border-border/40 font-mono">Ctrl</kbd>
                                <span>+</span>
                                <kbd className="px-2 py-1 bg-background rounded border border-border/40 font-mono">S</kbd>
                                <span className="ml-2">to save</span>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                    className="h-12 px-8 font-bold rounded-2xl w-full sm:w-auto border-border/40 hover:bg-muted/50 transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-12 px-10 font-bold rounded-2xl w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2.5">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="tracking-tight uppercase text-xs">
                                                {mode === 'create' ? 'Creating...' : 'Updating...'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2.5">
                                            <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            <span className="tracking-tight uppercase text-xs">
                                                {mode === 'create' ? 'Create Procurement' : 'Save Changes'}
                                            </span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <EditPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                changes={changes}
                onConfirm={actualSubmit}
                isSubmitting={isSubmitting}
            />
        </TooltipProvider>
    );
}
