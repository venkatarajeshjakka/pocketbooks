/**
 * AssetProcurementForm Component
 *
 * Form for recording asset purchases and payments
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Trash2,
    IndianRupee,
    Calendar,
    FileText,
    User,
    CheckCircle,
    AlertCircle,
    Loader2,
    Save,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useVendors } from '@/lib/hooks/use-vendors';
import { useCreateAssetProcurement } from '@/lib/hooks/use-asset-procurements';
import { AssetCategory, PaymentMethod } from '@/types';

export function AssetProcurementForm() {
    const router = useRouter();
    const createProcurement = useCreateAssetProcurement();
    const { data: vendorsData, isLoading: vendorsLoading } = useVendors({ limit: 100 });

    const [formData, setFormData] = useState({
        vendorId: '',
        procurementDate: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        notes: '',
        items: [
            { assetName: '', description: '', category: AssetCategory.ELECTRONICS, quantity: 1, unitPrice: 0 }
        ],
        gstAmount: 0,
        paymentRecorded: false,
        paymentDetails: {
            amount: 0,
            paymentMethod: PaymentMethod.UPI,
            notes: '',
            paymentDate: new Date().toISOString().split('T')[0],
        }
    });

    const subtotal = useMemo(() => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }, [formData.items]);

    const grandTotal = subtotal + (formData.gstAmount || 0);

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { assetName: '', description: '', category: AssetCategory.ELECTRONICS, quantity: 1, unitPrice: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.vendorId) {
            toast.error('Please select a vendor');
            return;
        }
        if (formData.items.some(item => !item.assetName)) {
            toast.error('Please provide names for all assets');
            return;
        }

        try {
            await createProcurement.mutateAsync({
                ...formData,
                procurementDate: new Date(formData.procurementDate),
                gstAmount: Number(formData.gstAmount),
                items: formData.items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice)
                })),
                paymentDetails: formData.paymentRecorded ? {
                    ...formData.paymentDetails,
                    amount: Number(formData.paymentDetails.amount),
                    paymentDate: new Date(formData.paymentDetails.paymentDate)
                } : undefined
            });
            toast.success('Asset purchase recorded successfully');
            router.push('/assets');
        } catch (error: any) {
            toast.error(error.message || 'Failed to record purchase');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-32 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Assets</h1>
                    <p className="text-muted-foreground">Record new industrial assets and equipment procurement</p>
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={createProcurement.isPending} className="gap-2">
                        {createProcurement.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Record Purchase
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Purchase Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-border/40 bg-card/60 backdrop-blur-md">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" /> Vendor & Invoice
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Vendor</Label>
                                <Select value={formData.vendorId} onValueChange={(val) => setFormData(p => ({ ...p, vendorId: val }))}>
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendorsData?.data.map(v => (
                                            <SelectItem key={v._id as string} value={v._id as string}>{v.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Purchase Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        value={formData.procurementDate}
                                        onChange={e => setFormData(p => ({ ...p, procurementDate: e.target.value }))}
                                        className="pl-10 bg-muted/30"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Invoice Number</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="INV-2024-001"
                                        value={formData.invoiceNumber}
                                        onChange={e => setFormData(p => ({ ...p, invoiceNumber: e.target.value }))}
                                        className="pl-10 bg-muted/30"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input
                                    placeholder="Optional internal notes"
                                    value={formData.notes}
                                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                                    className="bg-muted/30"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-card/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Asset Items</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2 border-primary/20 hover:bg-primary/10 text-primary">
                                <Plus className="h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {formData.items.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="group relative p-4 rounded-xl border border-border/40 bg-muted/20 space-y-4"
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Asset Name</Label>
                                                    <Input
                                                        placeholder="e.g. Ceiling Fan, Laptop"
                                                        value={item.assetName}
                                                        onChange={e => updateItem(index, 'assetName', e.target.value)}
                                                        className="bg-background/50 border-border/40 focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="w-40 space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Category</Label>
                                                    <Select value={item.category} onValueChange={val => updateItem(index, 'category', val)}>
                                                        <SelectTrigger className="bg-background/50 border-border/40">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.values(AssetCategory).map(cat => (
                                                                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="bg-background/50 border-border/40"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Unit Price</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={item.unitPrice}
                                                        onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="bg-background/50 border-border/40"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Amount</Label>
                                                    <div className="h-10 flex items-center px-3 bg-muted/40 rounded-md font-bold text-foreground">
                                                        ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            </div>
                                            {formData.items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                    className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Calculations & Payment */}
                <div className="space-y-8">
                    <Card className="border-border/40 bg-card/60 backdrop-blur-md sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <Label className="text-muted-foreground font-medium">GST Amount</Label>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.gstAmount}
                                            onChange={e => setFormData(p => ({ ...p, gstAmount: parseFloat(e.target.value) || 0 }))}
                                            className="h-8 text-right bg-muted/30 border-border/40"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Separator className="bg-border/20" />
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold">Grand Total</span>
                                <span className="text-xl font-black text-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="pt-4 mt-4 border-t border-border/20">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <IndianRupee className="h-4 w-4" /> Record Payment?
                                    </Label>
                                    <Button
                                        type="button"
                                        variant={formData.paymentRecorded ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFormData(p => ({
                                            ...p,
                                            paymentRecorded: !p.paymentRecorded,
                                            paymentDetails: { ...p.paymentDetails, amount: !p.paymentRecorded ? grandTotal : 0 }
                                        }))}
                                        className="rounded-full h-8"
                                    >
                                        {formData.paymentRecorded ? 'Yes' : 'No'}
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {formData.paymentRecorded && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4 bg-muted/40 p-4 rounded-xl border border-primary/20"
                                        >
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">Amount Paid</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.paymentDetails.amount}
                                                    onChange={e => setFormData(p => ({
                                                        ...p,
                                                        paymentDetails: { ...p.paymentDetails, amount: parseFloat(e.target.value) || 0 }
                                                    }))}
                                                    className="h-10 bg-background/60 font-bold border-primary/30"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">Payment Method</Label>
                                                <Select
                                                    value={formData.paymentDetails.paymentMethod}
                                                    onValueChange={val => setFormData(p => ({ ...p, paymentDetails: { ...p.paymentDetails, paymentMethod: val as PaymentMethod } }))}
                                                >
                                                    <SelectTrigger className="h-10 bg-background/60">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(PaymentMethod).map(method => (
                                                            <SelectItem key={method} value={method}>{method.toUpperCase().replace('_', ' ')}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
