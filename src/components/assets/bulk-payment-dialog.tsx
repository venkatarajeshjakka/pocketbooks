/**
 * BulkPaymentDialog Component
 * Allows recording payments for multiple assets at once
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PaymentMethod, IAsset, TransactionType, AccountType, PartyType } from '@/types';
import { useCreatePayment } from '@/lib/hooks/use-payments';
import { toast } from 'sonner';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AssetPayment {
    assetId: string;
    amount: number;
    selected: boolean;
    hasVendor: boolean;
}

interface SkippedPayment {
    assetName: string;
    reason: string;
}

interface BulkPaymentDialogProps {
    assets: IAsset[];
    trigger?: React.ReactNode;
}

export function BulkPaymentDialog({ assets, trigger }: BulkPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createPayment = useCreatePayment();

    const unpaidAssets = assets.filter(asset => 
        asset.paymentStatus !== 'fully_paid' && asset.remainingAmount > 0
    );

    // Form state
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');
    const [assetPayments, setAssetPayments] = useState<AssetPayment[]>(
        unpaidAssets.map(asset => ({
            assetId: asset._id.toString(),
            amount: asset.remainingAmount || 0,
            selected: false,
            hasVendor: !!asset.vendorId
        }))
    );
    const [skippedPayments, setSkippedPayments] = useState<SkippedPayment[]>([]);

    const selectedAssets = assetPayments.filter(asset => asset.selected);
    const totalAmount = selectedAssets.reduce((sum, asset) => sum + asset.amount, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedAssets.length === 0) {
            toast.error('Please select at least one asset');
            return;
        }

        if (!paymentDate) {
            toast.error('Please select a payment date');
            return;
        }

        setIsSubmitting(true);

        try {
            // Reset skipped payments
            const skipped: SkippedPayment[] = [];
            const validPayments: Promise<any>[] = [];

            // Create individual payment records for each selected asset
            for (const assetPayment of selectedAssets) {
                const asset = unpaidAssets.find(a => a._id.toString() === assetPayment.assetId);
                if (!asset) continue;

                // Validate vendor exists
                if (!asset.vendorId) {
                    skipped.push({
                        assetName: asset.name,
                        reason: 'No vendor assigned'
                    });
                    continue;
                }

                if (assetPayment.amount <= 0) {
                    skipped.push({
                        assetName: asset.name,
                        reason: 'Invalid amount (must be greater than 0)'
                    });
                    continue;
                }

                if (assetPayment.amount > asset.remainingAmount) {
                    skipped.push({
                        assetName: asset.name,
                        reason: 'Amount exceeds remaining balance'
                    });
                    continue;
                }

                validPayments.push(createPayment.mutateAsync({
                    paymentDate: new Date(paymentDate),
                    amount: assetPayment.amount,
                    paymentMethod: paymentMethod,
                    transactionType: TransactionType.PURCHASE,
                    accountType: AccountType.PAYABLE,
                    partyId: asset.vendorId.toString(),
                    partyType: PartyType.VENDOR,
                    assetId: asset._id.toString(),
                    transactionId: transactionId || undefined,
                    notes: notes || `Bulk payment for asset: ${asset.name}`
                }));
            }

            // Update skipped payments state
            setSkippedPayments(skipped);

            if (validPayments.length === 0 && skipped.length > 0) {
                toast.error('All selected assets were skipped due to validation errors');
                setIsSubmitting(false);
                return;
            }

            await Promise.all(validPayments);

            if (skipped.length > 0) {
                toast.warning(`Recorded ${validPayments.length} payment(s). ${skipped.length} skipped.`);
            } else {
                toast.success(`Successfully recorded ${validPayments.length} payments`);
            }
            
            // Reset form
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setPaymentMethod(PaymentMethod.CASH);
            setTransactionId('');
            setNotes('');
            setAssetPayments(unpaidAssets.map(asset => ({
                assetId: asset._id.toString(),
                amount: asset.remainingAmount || 0,
                selected: false,
                hasVendor: !!asset.vendorId
            })));
            setSkippedPayments([]);

            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to record bulk payments');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAssetSelection = (index: number, checked: boolean) => {
        setAssetPayments(prev => 
            prev.map((asset, i) => 
                i === index ? { ...asset, selected: checked } : asset
            )
        );
    };

    const updateAssetAmount = (index: number, amount: number) => {
        setAssetPayments(prev => 
            prev.map((asset, i) => 
                i === index ? { ...asset, amount } : asset
            )
        );
    };

    if (unpaidAssets.length === 0) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Bulk Payment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Bulk Payment</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Payment Details */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="paymentDate">Payment Date</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PaymentMethod).map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {method.replace('_', ' ').toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                            <Input
                                id="transactionId"
                                placeholder="Enter transaction ID"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Total Amount: </span>
                                <span className="font-bold text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Enter payment notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Asset Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Select Assets</h3>
                            <Badge variant="outline">
                                {selectedAssets.length} of {unpaidAssets.length} selected
                            </Badge>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                            {unpaidAssets.map((asset, index) => {
                                const hasVendor = !!asset.vendorId;
                                return (
                                    <div
                                        key={asset._id.toString()}
                                        className={`flex items-center gap-4 p-3 border rounded-lg ${!hasVendor ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}
                                    >
                                        <Checkbox
                                            checked={assetPayments[index]?.selected || false}
                                            onCheckedChange={(checked) => toggleAssetSelection(index, !!checked)}
                                            disabled={!hasVendor}
                                            aria-label={`Select ${asset.name} for bulk payment`}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{asset.name}</span>
                                                {!hasVendor && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        No vendor
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Remaining: ₹{asset.remainingAmount.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={asset.remainingAmount}
                                                value={assetPayments[index]?.amount || 0}
                                                onChange={(e) => updateAssetAmount(index, parseFloat(e.target.value) || 0)}
                                                disabled={!assetPayments[index]?.selected || !hasVendor}
                                                placeholder="Amount"
                                                aria-label={`Payment amount for ${asset.name}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Warning for assets without vendors */}
                        {unpaidAssets.some(a => !a.vendorId) && (
                            <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                                    Some assets don&apos;t have a vendor assigned and cannot be included in bulk payments.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Show skipped payments after submission attempt */}
                        {skippedPayments.length > 0 && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="font-medium mb-1">{skippedPayments.length} payment(s) were skipped:</div>
                                    <ul className="list-disc list-inside text-sm">
                                        {skippedPayments.map((sp, idx) => (
                                            <li key={idx}>{sp.assetName}: {sp.reason}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || selectedAssets.length === 0}
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Record {selectedAssets.length} Payment{selectedAssets.length !== 1 ? 's' : ''}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}