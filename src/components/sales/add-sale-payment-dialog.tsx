
'use client';

import { useState } from 'react';
import { Plus, Loader2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PaymentMethod } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCreateSalePayment } from '@/lib/hooks/use-sales';

interface AddSalePaymentDialogProps {
    saleId: string;
    remainingAmount: number;
    currentTranche?: number;
    trigger?: React.ReactNode;
}

export function AddSalePaymentDialog({
    saleId,
    remainingAmount,
    currentTranche = 0,
    trigger,
}: AddSalePaymentDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        amount: remainingAmount,
        paymentMethod: PaymentMethod.UPI,
        paymentDate: new Date(),
        notes: '',
        referenceNumber: '',
        trancheNumber: currentTranche + 1,
        totalTranches: currentTranche + 1, // Assumption: user might pay in 1 more tranche
    });

    const createPaymentMutation = useCreateSalePayment();
    const isSubmitting = createPaymentMutation.isPending;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }
        if (formData.amount > remainingAmount) {
            // Allow overpayment? Likely not for now.
            newErrors.amount = `Amount cannot exceed remaining balance of ₹${remainingAmount.toLocaleString('en-IN')}`;
        }
        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }
        if (formData.trancheNumber < 1) {
            newErrors.trancheNumber = 'Tranche number must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix form errors');
            return;
        }

        try {
            await createPaymentMutation.mutateAsync({
                id: saleId,
                data: formData
            });

            setOpen(false);
            // Reset form
            setFormData({
                amount: 0,
                paymentMethod: PaymentMethod.UPI,
                paymentDate: new Date(),
                notes: '',
                referenceNumber: '',
                trancheNumber: currentTranche + 2,
                totalTranches: currentTranche + 2,
            });
        } catch (error) {
            // handled by hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Payment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IndianRupee className="h-5 w-5 text-primary" />
                            Record Sale Payment
                        </DialogTitle>
                        <DialogDescription>
                            Record a payment received for this sale. Remaining balance: ₹
                            {remainingAmount.toLocaleString('en-IN')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">
                                    Amount <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            amount: parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    className={cn(errors.amount && 'border-destructive')}
                                />
                                {errors.amount && (
                                    <span className="text-xs text-destructive">{errors.amount}</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentDate">
                                    Payment Date <span className="text-destructive">*</span>
                                </Label>
                                <DatePicker
                                    date={formData.paymentDate}
                                    onDateChange={(d) =>
                                        d && setFormData((prev) => ({ ...prev, paymentDate: d }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={(v) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        paymentMethod: v as PaymentMethod,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PaymentMethod).map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {method.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="trancheNumber">Tranche Number</Label>
                                <Input
                                    id="trancheNumber"
                                    type="number"
                                    min="1"
                                    value={formData.trancheNumber}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            trancheNumber: parseInt(e.target.value) || 1,
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalTranches">Total Tranches</Label>
                                <Input
                                    id="totalTranches"
                                    type="number"
                                    min="1"
                                    value={formData.totalTranches}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            totalTranches: parseInt(e.target.value) || 1,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="referenceNumber">Reference Number</Label>
                            <Input
                                id="referenceNumber"
                                placeholder="UPI Ref / Check No / Transaction ID"
                                value={formData.referenceNumber}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        referenceNumber: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Additional payment notes..."
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                                }
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <IndianRupee className="h-4 w-4 mr-2" />
                                    Record Payment
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
