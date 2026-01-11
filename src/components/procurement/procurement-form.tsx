'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, Plus, Trash2, Calculator, IndianRupee, Calendar as CalendarIcon, FileText } from 'lucide-react';
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
import { useCreateProcurement, useUpdateProcurement } from '@/lib/hooks/use-procurements';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios'; // Removed axios

interface ProcurementItem {
    itemId: string;
    name: string; // For display
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

    // Financials
    gstPercentage: number;
    // Calculated fields (not directly edited, but stored for reference/display)
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
    initialData?: any; // strict typing can be added later if needed
    procurementId?: string;
}

export function ProcurementForm({ type, mode, initialData, procurementId }: ProcurementFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const { data: vendorsData, isLoading: vendorsLoading } = useVendors({ limit: 100 });

    // Dynamic inventory hook based on type
    const inventoryHook = type === 'raw_material' ? useRawMaterials : useTradingGoods;
    const { data: inventoryData, isLoading: inventoryLoading } = inventoryHook({ limit: 100 });

    const [formData, setFormData] = useState<ProcurementFormData>({
        vendorId: initialData?.vendorId || '',
        procurementDate: initialData?.procurementDate ? new Date(initialData.procurementDate) : new Date(),
        expectedDeliveryDate: initialData?.expectedDeliveryDate ? new Date(initialData.expectedDeliveryDate) : undefined,
        invoiceNumber: initialData?.invoiceNumber || '',
        paymentTerms: initialData?.paymentTerms || '',
        notes: initialData?.notes || '',
        items: initialData?.items?.map((item: any) => ({
            itemId: type === 'raw_material' ? item.rawMaterialId : item.tradingGoodId,
            name: item.name || 'Unknown Item', // We might need to fetch names if not populated
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            amount: item.amount || 0
        })) || [],
        gstPercentage: initialData?.gstPercentage || 18,
        totalAmount: initialData?.originalPrice || 0,
        gstAmount: initialData?.gstAmount || 0,
        grandTotal: initialData?.gstBillPrice || 0,
        status: initialData?.status || ProcurementStatus.ORDERED,
    });

    const [paymentData, setPaymentData] = useState<PaymentFormData>({
        recordPayment: false,
        amount: 0,
        paymentMethod: PaymentMethod.UPI,
        paymentDate: new Date(),
        notes: '',
        tranches: 1,
    });

    // Calculate totals whenever items or GST % changes
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

        // Auto-update payment amount if recording payment and currently covers full amount
        if (paymentData.recordPayment && mode === 'create') {
            // Default to full amount? Or maybe keep user input? 
            // Let's set it to Grand Total initially, but let user edit.
            // Actually, better to only set it if it was 0 or matches previous total.
            // For simplicity, let's just default it to grandTotal if it's 0.
            if (paymentData.amount === 0) {
                setPaymentData(prev => ({ ...prev, amount: grandTotal }));
            }
        }
    }, [formData.items, formData.gstPercentage, mode, paymentData.recordPayment]);

    const handleAddItem = (itemId: string, name: string) => {
        // Check if item already exists
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix form errors');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                items: formData.items.map(item => ({
                    [type === 'raw_material' ? 'rawMaterialId' : 'tradingGoodId']: item.itemId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    amount: item.amount
                })),
                originalPrice: formData.totalAmount,
                gstBillPrice: formData.grandTotal,
                gstAmount: formData.gstAmount,

                // Payment info
                initialPayment: paymentData.recordPayment ? {
                    amount: paymentData.amount,
                    paymentMethod: paymentData.paymentMethod,
                    paymentDate: paymentData.paymentDate,
                    notes: paymentData.notes,
                    totalTranches: paymentData.tranches
                } : undefined
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
                // Hook handles toast
            } else {
                await updateMutation.mutateAsync({ id: procurementId!, input: payload });
                // Hook handles toast
            }

            const endpointType = type === 'raw_material' ? 'raw-materials' : 'trading-goods';
            router.push(`/procurement/${endpointType}`);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            // Hook handles error toast, but maybe we want to keep it simple here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <TooltipProvider>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 pb-32">
                {/* Basic Info */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
                    <CardHeader className="pb-4 border-b border-border/10">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Basic Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
                        <div className="space-y-2">
                            <Label>Vendor *</Label>
                            <Select
                                value={formData.vendorId}
                                onValueChange={v => setFormData(prev => ({ ...prev, vendorId: v }))}
                                disabled={mode === 'edit'}
                            >
                                <SelectTrigger className={cn(errors.vendorId && "border-destructive")}>
                                    <SelectValue placeholder="Select Vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendorsData?.data.map((v: any) => (
                                        <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.vendorId && <span className="text-xs text-destructive">{errors.vendorId}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Procurement Date *</Label>
                            <DatePicker
                                date={formData.procurementDate}
                                onDateChange={d => d && setFormData(prev => ({ ...prev, procurementDate: d }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Invoice Number</Label>
                            <Input
                                value={formData.invoiceNumber}
                                onChange={e => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                placeholder="e.g. INV-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={s => setFormData(prev => ({ ...prev, status: s as ProcurementStatus }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(ProcurementStatus).map(s => (
                                        <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Items Section */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
                    <CardHeader className="pb-4 border-b border-border/10 flex flex-row justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            Items & Pricing
                        </CardTitle>

                        <Select
                            value=""
                            onValueChange={(val) => {
                                const item = inventoryData?.data.find((i: any) => i._id === val);
                                if (item) handleAddItem(item._id, item.name);
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Add Item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {inventoryData?.data.map((item: any) => (
                                    <SelectItem key={item._id} value={item._id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="rounded-md border border-border/40 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[40%]">Item</TableHead>
                                        <TableHead className="w-[20%] text-right">Qty</TableHead>
                                        <TableHead className="w-[20%] text-right">Unit Price</TableHead>
                                        <TableHead className="w-[15%] text-right">Total</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No items added. Add items to calculate costs.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        formData.items.map((item, index) => (
                                            <TableRow key={item.itemId}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        className="text-right h-8"
                                                        value={item.quantity}
                                                        onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="text-right h-8"
                                                        value={item.unitPrice}
                                                        onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {item.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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

                        <div className="flex justify-end">
                            <div className="w-[300px] space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-mono font-medium">
                                        {formData.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">GST (%):</span>
                                        <Select
                                            value={formData.gstPercentage.toString()}
                                            onValueChange={v => setFormData(prev => ({ ...prev, gstPercentage: parseFloat(v) }))}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[0, 5, 12, 18, 28].map(p => (
                                                    <SelectItem key={p} value={p.toString()}>{p}%</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <span className="font-mono font-medium">
                                        {formData.gstAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                </div>
                                <div className="border-t border-border/40 pt-4 flex justify-between items-center font-bold text-lg text-primary">
                                    <span>Grand Total:</span>
                                    <span>
                                        {formData.grandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Section (only create mode) */}
                {mode === 'create' && (
                    <Card className={cn(
                        "border-border/40 bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300",
                        paymentData.recordPayment ? "ring-2 ring-primary/20" : ""
                    )}>
                        <CardHeader className="pb-4 border-b border-border/10 cursor-pointer" onClick={() => setPaymentData(prev => ({ ...prev, recordPayment: !prev.recordPayment }))}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <IndianRupee className="h-5 w-5 text-primary" />
                                    Payment Details
                                </CardTitle>
                                <div className={cn(
                                    "h-6 w-12 rounded-full p-1 transition-colors",
                                    paymentData.recordPayment ? "bg-primary" : "bg-muted"
                                )}>
                                    <div className={cn(
                                        "h-4 w-4 rounded-full bg-white transition-transform",
                                        paymentData.recordPayment ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </div>
                            </div>
                        </CardHeader>
                        <AnimatePresence>
                            {paymentData.recordPayment && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
                                        <div className="space-y-2">
                                            <Label>Paid Amount</Label>
                                            <Input
                                                type="number"
                                                value={paymentData.amount}
                                                onChange={e => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Method</Label>
                                            <Select
                                                value={paymentData.paymentMethod}
                                                onValueChange={m => setPaymentData(prev => ({ ...prev, paymentMethod: m as PaymentMethod }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(PaymentMethod).map(m => (
                                                        <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Date</Label>
                                            <DatePicker
                                                date={paymentData.paymentDate}
                                                onDateChange={d => d && setPaymentData(prev => ({ ...prev, paymentDate: d }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tranches (Installments)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={paymentData.tranches}
                                                onChange={e => setPaymentData(prev => ({ ...prev, tranches: parseInt(e.target.value) || 1 }))}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Notes</Label>
                                            <Textarea
                                                value={paymentData.notes}
                                                onChange={e => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Payment reference (e.g. UPI Ref, Check No.)"
                                            />
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                )}

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-border/30 z-50 flex items-center justify-end gap-4 shadow-2xl">
                    <Button variant="outline" type="button" onClick={() => router.back()} className="rounded-xl px-8">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl px-10 shadow-lg shadow-primary/20">
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {mode === 'create' ? 'Create Procurement' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </TooltipProvider>
    );
}
