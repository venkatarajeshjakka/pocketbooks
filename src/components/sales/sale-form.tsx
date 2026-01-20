
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, Plus, Trash2, ShoppingCart, Calendar as CalendarIcon, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SaleStatus, PaymentMethod, InventoryItemType, ISale, ISaleItem } from '@/types';
import { Switch } from '@/components/ui/switch';
import { useClients } from '@/lib/hooks/use-clients';
import { useTradingGoods, useFinishedGoods } from '@/lib/hooks/use-inventory-items';
import { useCreateSale, useUpdateSale, useSale } from '@/lib/hooks/use-sales';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EditPreviewDialog } from '@/components/shared/entity/edit-preview-dialog';

interface SaleItem {
    itemId: string; // The ID of the item
    itemType: InventoryItemType; // 'trading_good' | 'finished_good'
    name: string;
    quantity: number | string;
    unitPrice: number | string;
    amount: number;
}

interface SaleFormData {
    clientId: string;
    saleDate: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    invoiceNumber: string; // usually auto-generated but might be needed for Edit pre-fill
    paymentTerms: string;
    notes: string;
    items: SaleItem[];
    gstPercentage: number;
    // Calculated fields
    subtotal: number;
    discount: number | string;
    gstAmount: number;
    grandTotal: number;
    status: SaleStatus;
}

interface PaymentFormData {
    recordPayment: boolean;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    notes: string;
}

interface SaleFormProps {
    mode: 'create' | 'edit';
    initialData?: ISale;
    saleId?: string;
}

export function SaleForm({ mode, initialData, saleId }: SaleFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [changes, setChanges] = useState<any[]>([]);

    // Data Fetching
    const { data: clientsData, isLoading: clientsLoading } = useClients({ limit: 100 });
    const { data: tradingGoodsData, isLoading: tgLoading } = useTradingGoods({ limit: 100 });
    const { data: finishedGoodsData, isLoading: fgLoading } = useFinishedGoods({ limit: 100 });
    const { data: saleDataResponse, isLoading: saleLoading } = useSale(mode === 'edit' ? (saleId || '') : '');
    const saleData = saleDataResponse?.data;

    const [formData, setFormData] = useState<SaleFormData>({
        clientId: '',
        saleDate: new Date(),
        expectedDeliveryDate: undefined,
        actualDeliveryDate: undefined,
        invoiceNumber: '',
        paymentTerms: '',
        notes: '',
        items: [],
        gstPercentage: 18,
        discount: 0,
        subtotal: 0,
        gstAmount: 0,
        grandTotal: 0,
        status: SaleStatus.PENDING,
    });

    // Sync form data in edit mode
    useEffect(() => {
        const data = saleData || initialData;
        if (data) {
            setFormData({
                clientId: typeof data.clientId === 'object' ? String((data.clientId as any)?._id || '') : String(data.clientId || ''),
                saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
                expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
                actualDeliveryDate: data.actualDeliveryDate ? new Date(data.actualDeliveryDate) : undefined,
                invoiceNumber: data.invoiceNumber || '',
                paymentTerms: data.paymentTerms || '',
                notes: data.notes || '',
                items: data.items?.map((item: ISaleItem) => {
                    // Normalize item type to handle legacy data
                    let normalizedType = item.itemType;
                    const typeStr = String(item.itemType).toLowerCase();

                    if (typeStr === 'raw_material' || typeStr === 'rawmaterial') {
                        normalizedType = InventoryItemType.RAW_MATERIAL;
                    } else if (typeStr === 'trading_good' || typeStr === 'tradinggood') {
                        normalizedType = InventoryItemType.TRADING_GOOD;
                    } else if (typeStr === 'finished_good' || typeStr === 'finishedgood') {
                        normalizedType = InventoryItemType.FINISHED_GOOD;
                    }

                    return {
                        itemId: typeof item.itemId === 'object' ? (item.itemId as any)?._id : (item.itemId || ''),
                        itemType: normalizedType,
                        name: (item.itemId as any)?.name || (item as any).name || 'Unknown Item',
                        quantity: item.quantity || 1,
                        unitPrice: item.unitPrice || 0,
                        amount: item.amount || 0
                    };
                }) || [],
                gstPercentage: data.gstPercentage || 18,
                discount: data.discount || 0,
                subtotal: data.subtotal || 0,
                gstAmount: data.gstAmount || 0,
                grandTotal: data.grandTotal || 0,
                status: data.status || SaleStatus.PENDING,
            });
        }
    }, [saleData, initialData]);

    const [paymentData, setPaymentData] = useState<PaymentFormData>({
        recordPayment: false,
        amount: 0,
        paymentMethod: PaymentMethod.UPI,
        paymentDate: new Date(),
        notes: '',
    });

    // Helper to get item name if not present (for edit mode primarily if backend didn't populate items fully)
    // usually we populate items name in API. If not, we rely on loaded inventory data.

    // State to hold currently selected item type for the "Add Item" dropdown
    const [selectedItemType, setSelectedItemType] = useState<InventoryItemType>(InventoryItemType.FINISHED_GOOD);

    // Calculate totals
    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => {
            const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity;
            const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice;
            return sum + (qty * price);
        }, 0);
        const disc = typeof formData.discount === 'string' ? parseFloat(formData.discount) || 0 : formData.discount;
        const afterDiscount = Math.max(0, subtotal - disc);
        const gstAmount = (afterDiscount * formData.gstPercentage) / 100;
        const grandTotal = afterDiscount + gstAmount;

        setFormData(prev => ({
            ...prev,
            subtotal,
            gstAmount,
            grandTotal
        }));

        if (paymentData.recordPayment && mode === 'create' && paymentData.amount === 0) {
            setPaymentData(prev => ({ ...prev, amount: grandTotal }));
        }
    }, [formData.items, formData.gstPercentage, formData.discount, mode, paymentData.recordPayment]);

    const updateFormField = <K extends keyof SaleFormData>(field: K, value: SaleFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleAddItem = (itemId: string, itemType: InventoryItemType, name: string, price: number) => {
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
                    itemType,
                    name,
                    quantity: 1,
                    unitPrice: price,
                    amount: price // 1 * price
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

    const handleItemChange = (index: number, field: keyof SaleItem, value: number | string) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index], [field]: value };

            // Recalculate generic amount for display row if possible, but real total is in useEffect
            const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity;
            const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice;

            item.amount = qty * price;
            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.clientId) newErrors.clientId = 'Client is required';
        if (!formData.saleDate) newErrors.saleDate = 'Date is required';
        if (formData.items.length === 0) newErrors.items = 'At least one item is required';

        formData.items.forEach((item, index) => {
            const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity;
            const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice;

            if (qty <= 0) newErrors[`item_${index}_qty`] = 'Quantity > 0';
            if (price < 0) newErrors[`item_${index}_price`] = 'Price >= 0';
        });

        if (paymentData.recordPayment) {
            if (paymentData.amount <= 0) newErrors.paymentAmount = 'Amount > 0';
            if (paymentData.amount > formData.grandTotal) newErrors.paymentAmount = 'Cannot exceed total';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createMutation = useCreateSale();
    const updateMutation = useUpdateSale();

    const getDetectedChanges = () => {
        const changes: any[] = [];
        const labels: Record<string, string> = {
            clientId: 'Client',
            saleDate: 'Sale Date',
            grandTotal: 'Grand Total',
            status: 'Status',
            discount: 'Discount',
        };

        const fieldTypes: Record<string, 'text' | 'price' | 'date' | 'status'> = {
            saleDate: 'date',
            grandTotal: 'price',
            discount: 'price',
            status: 'status',
        };

        Object.keys(labels).forEach(key => {
            let oldValue = (saleData as any)?.[key];
            let newValue = (formData as any)[key];

            if (key === 'clientId') {
                oldValue = typeof oldValue === 'object' ? String(oldValue?._id || '') : String(oldValue || '');
                newValue = String(newValue || '');
            }

            if (key === 'discount') {
                oldValue = Number(oldValue || 0);
                newValue = typeof newValue === 'string' ? parseFloat(newValue) || 0 : newValue;
            }

            if (oldValue !== newValue && newValue !== undefined) {
                changes.push({
                    field: key,
                    label: labels[key],
                    oldValue: oldValue || 'Empty',
                    newValue: newValue || 'Empty',
                    type: fieldTypes[key] || 'text'
                });
            }
        });

        // Item changes summary
        if (JSON.stringify(saleData?.items?.map((i: any) => i.itemId)) !== JSON.stringify(formData.items.map(i => i.itemId))) {
            changes.push({
                field: 'items',
                label: 'Items List',
                oldValue: `${saleData?.items?.length || 0} items`,
                newValue: `${formData.items.length} items`,
                type: 'text'
            });
        }

        return changes;
    };

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

    const actualSubmit = async () => {
        setIsPreviewOpen(false);
        setIsSubmitting(true);
        try {
            const payload = {
                clientId: formData.clientId,
                saleDate: formData.saleDate,
                invoiceNumber: formData.invoiceNumber || undefined,
                discount: typeof formData.discount === 'string' ? parseFloat(formData.discount) || 0 : formData.discount,
                gstPercentage: formData.gstPercentage,
                paymentTerms: formData.paymentTerms || undefined,
                expectedDeliveryDate: formData.expectedDeliveryDate,
                actualDeliveryDate: formData.actualDeliveryDate,
                notes: formData.notes || undefined,
                items: formData.items.map(item => {
                    const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity;
                    const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice;
                    return {
                        itemId: item.itemId,
                        itemType: item.itemType,
                        quantity: qty,
                        unitPrice: price
                    };
                }),
                // Include initialPayment in the payload for atomic transaction
                // This ensures sale and payment are created in a single database transaction
                initialPayment: (mode === 'create' && paymentData.recordPayment && paymentData.amount > 0) ? {
                    amount: paymentData.amount,
                    paymentMethod: paymentData.paymentMethod,
                    paymentDate: paymentData.paymentDate,
                    notes: paymentData.notes || `Initial payment for sale`
                } : undefined
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(payload);
                toast.success('Sale created successfully');
            } else {
                await updateMutation.mutateAsync({ id: saleId!, data: payload });
                toast.success('Sale updated successfully');
            }

            router.push('/sales');
            router.refresh();
        } catch (error: unknown) {
            console.error('Submission error:', error);
            const message = error instanceof Error ? error.message : 'Failed to save sale';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Inventory Items Options
    const currentInventoryItems = selectedItemType === InventoryItemType.FINISHED_GOOD ? finishedGoodsData?.data : tradingGoodsData?.data;
    const isInventoryLoading = selectedItemType === InventoryItemType.FINISHED_GOOD ? fgLoading : tgLoading;

    if (mode === 'edit' && saleLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <TooltipProvider>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-12 pb-32">
                <AnimatePresence mode="popLayout">
                    {/* Basic Info */}
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
                                    <User className="h-6 w-6 text-primary relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">Client & Details</CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">Basic information about the sale</CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Client */}
                                    <div className="space-y-2.5">
                                        <Label className="flex justify-between font-semibold text-sm">Client
                                            <span className="text-destructive text-[10px] uppercase font-bold flex items-center gap-1"><div className="h-1 w-1 bg-destructive rounded-full" /> Required</span>
                                        </Label>
                                        <Select
                                            value={formData.clientId}
                                            onValueChange={v => updateFormField('clientId', v)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger className={cn(
                                                "h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4",
                                                errors.clientId && "border-destructive/50"
                                            )}>
                                                <SelectValue placeholder="Select Client" />
                                            </SelectTrigger>
                                            <SelectContent className="backdrop-blur-xl bg-popover/95 rounded-xl">
                                                {clientsData?.data.map((c) => (
                                                    <SelectItem key={String(c._id)} value={String(c._id)}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.clientId && (
                                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                                <Info className="h-3 w-3" /> {errors.clientId}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="space-y-2.5">
                                        <Label className="flex justify-between font-semibold text-sm">Sale Date
                                            <span className="text-destructive text-[10px] uppercase font-bold flex items-center gap-1"><div className="h-1 w-1 bg-destructive rounded-full" /> Required</span>
                                        </Label>
                                        <DatePicker date={formData.saleDate} onDateChange={d => d && updateFormField('saleDate', d)} />
                                    </div>

                                    {/* Payment Terms */}
                                    <div className="space-y-2.5">
                                        <Label className="font-semibold text-sm">Payment Terms</Label>
                                        <Input
                                            value={formData.paymentTerms}
                                            onChange={e => updateFormField('paymentTerms', e.target.value)}
                                            className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                            placeholder="e.g. Immediate, Net 15"
                                        />
                                    </div>

                                    {/* Expected Delivery */}
                                    <div className="space-y-2.5">
                                        <Label className="font-semibold text-sm">Expected Delivery</Label>
                                        <DatePicker date={formData.expectedDeliveryDate} onDateChange={d => updateFormField('expectedDeliveryDate', d)} />
                                    </div>

                                    {/* Notes */}
                                    <div className="md:col-span-2 space-y-2.5">
                                        <Label className="font-semibold text-sm">Notes</Label>
                                        <Textarea
                                            value={formData.notes}
                                            onChange={e => updateFormField('notes', e.target.value)}
                                            className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Items & Pricing */}
                    <motion.div
                        key="items-pricing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="relative"
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-indigo-500/5 overflow-hidden group hover:border-indigo-500/20 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20 bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                                        <ShoppingCart className="h-6 w-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">Items & Pricing</CardTitle>
                                        <CardDescription className="text-sm font-medium text-muted-foreground/70">Select products and manage quantity</CardDescription>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Select value={selectedItemType} onValueChange={(v) => setSelectedItemType(v as InventoryItemType)}>
                                        <SelectTrigger className="w-[140px] h-10 bg-background/50 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="backdrop-blur-xl bg-popover/95 rounded-xl">
                                            <SelectItem value={InventoryItemType.FINISHED_GOOD}>Finished Good</SelectItem>
                                            <SelectItem value={InventoryItemType.TRADING_GOOD}>Trading Good</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value="" onValueChange={(val) => {
                                        const item = currentInventoryItems?.find((i) => String(i._id) === val);
                                        if (item) handleAddItem(String(item._id), selectedItemType, (item as any).name, (item as any).sellingPrice);
                                    }} disabled={isInventoryLoading}>
                                        <SelectTrigger className="w-[200px] h-10 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary font-semibold rounded-xl transition-colors disabled:opacity-50">
                                            <div className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Item</div>
                                        </SelectTrigger>
                                        <SelectContent className="backdrop-blur-xl bg-popover/95 rounded-xl">
                                            {isInventoryLoading ? <div className="p-2 text-center text-xs">Loading...</div> :
                                                currentInventoryItems?.map((i) => (
                                                    <SelectItem key={String(i._id)} value={String(i._id)}>
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">{(i as any).name}</span>
                                                            <span className="text-[10px] text-muted-foreground">Price: ₹{(i as any).sellingPrice} | Stock: {(i as any).currentStock}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6 space-y-6">
                                <div className="rounded-xl border border-border/40 overflow-hidden shadow-inner bg-muted/10">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent border-border/20">
                                                <TableHead className="font-bold text-foreground/70">Item</TableHead>
                                                <TableHead className="text-right font-bold text-foreground/70">Qty</TableHead>
                                                <TableHead className="text-right font-bold text-foreground/70">Price</TableHead>
                                                <TableHead className="text-right font-bold text-foreground/70">Total</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {formData.items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No items added</TableCell>
                                                </TableRow>
                                            ) : (
                                                formData.items.map((item, idx) => (
                                                    <TableRow key={idx} className="hover:bg-muted/20">
                                                        <TableCell className="font-medium">{item.name} <span className="text-[10px] text-muted-foreground px-2 bg-muted rounded">{item.itemType === InventoryItemType.FINISHED_GOOD ? 'FG' : 'TG'}</span></TableCell>
                                                        <TableCell className="w-[120px]">
                                                            <Input type="number" min="0" step="any" className="text-right h-10 bg-background/50 border-border/30 focus:border-indigo-500/50 rounded-lg shadow-sm" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
                                                        </TableCell>
                                                        <TableCell className="w-[120px]">
                                                            <Input type="number" min="0" step="any" className="text-right h-10 bg-background/50 border-border/30 focus:border-indigo-500/50 rounded-lg shadow-sm" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} />
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-indigo-500">₹{item.amount.toLocaleString('en-IN')}</TableCell>
                                                        <TableCell>
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleRemoveItem(idx)}>
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
                                    <div className="w-full max-w-md space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/20">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Subtotal</span>
                                            <span className="font-mono font-bold">₹{formData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-muted-foreground font-medium">Discount</span>
                                            <Input type="number" min="0" step="any" className="w-24 text-right h-8 text-xs bg-background/50 border-border/30 focus:border-primary/50 rounded-lg shadow-sm" value={formData.discount} onChange={e => updateFormField('discount', e.target.value)} />
                                        </div>
                                        <div className="flex justify-between text-sm items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground font-medium">GST</span>
                                                <Select value={formData.gstPercentage.toString()} onValueChange={v => updateFormField('gstPercentage', parseFloat(v))}>
                                                    <SelectTrigger className="h-8 w-[70px] text-xs bg-background/50 border-border/30 rounded-lg shadow-sm"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="backdrop-blur-xl bg-popover/95 rounded-lg">
                                                        {[0, 5, 12, 18, 28].map(p => <SelectItem key={p} value={p.toString()}>{p}%</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <span className="font-mono font-bold">₹{formData.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="h-px bg-border/40" />
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-base font-bold">Grand Total</span>
                                            <span className="text-2xl font-black text-primary font-mono">₹{formData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Payment Section (Create Mode Only) */}
                    {mode === 'create' && (
                        <motion.div
                            key="payment"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <Card className={cn("border-border/40 bg-card/60 backdrop-blur-md shadow-xl transition-all duration-500 overflow-hidden", paymentData.recordPayment ? "ring-2 ring-primary/30" : "hover:border-primary/20")}>
                                <CardHeader
                                    className="flex flex-row items-center justify-between cursor-pointer bg-muted/20 border-b border-border/20"
                                    onClick={() => setPaymentData(prev => ({ ...prev, recordPayment: !prev.recordPayment }))}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", paymentData.recordPayment ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground")}>
                                            <Wallet className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight">Payment Details</CardTitle>
                                            <CardDescription className="text-sm font-medium">{paymentData.recordPayment ? 'Recording payment with sale' : 'Click to record initial payment'}</CardDescription>
                                        </div>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            checked={paymentData.recordPayment}
                                            onCheckedChange={(checked) => setPaymentData(prev => ({ ...prev, recordPayment: checked }))}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </CardHeader>

                                <AnimatePresence>
                                    {paymentData.recordPayment && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                            <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2.5">
                                                    <Label className="font-semibold text-sm">Amount</Label>
                                                    <Input type="number" value={paymentData.amount} onChange={e => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-mono" />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="font-semibold text-sm">Payment Method</Label>
                                                    <Select value={paymentData.paymentMethod} onValueChange={v => setPaymentData(prev => ({ ...prev, paymentMethod: v as PaymentMethod }))}>
                                                        <SelectTrigger className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="backdrop-blur-xl bg-popover/95 rounded-xl">
                                                            {Object.values(PaymentMethod).map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_', ' ')}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="font-semibold text-sm">Received Date</Label>
                                                    <DatePicker date={paymentData.paymentDate} onDateChange={d => d && setPaymentData(prev => ({ ...prev, paymentDate: d }))} />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="font-semibold text-sm">Payment Notes</Label>
                                                    <Input value={paymentData.notes} onChange={e => setPaymentData(prev => ({ ...prev, notes: e.target.value }))} className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl" placeholder="Ref no, transaction ID..." />
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fixed Footer Actions */}
                <div className="fixed bottom-0 md:left-64 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/40 flex justify-end gap-4 z-50">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="h-11 rounded-xl px-8">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="h-11 rounded-xl px-8 shadow-lg shadow-primary/20">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Sale</>}
                    </Button>
                </div>
            </form>

            <EditPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                onConfirm={actualSubmit}
                changes={changes}
                isSubmitting={isSubmitting}
            />
        </TooltipProvider>
    );
}
