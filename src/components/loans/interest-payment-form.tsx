/**
 * InterestPaymentForm Component
 *
 * Form for recording interest payments against loan accounts
 * with modern UI and integrated payment method selection
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, Wallet, IndianRupee, Calendar as CalendarIcon, FileText, Landmark } from 'lucide-react';
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
    TooltipProvider,
} from '@/components/ui/tooltip';
import { IInterestPayment, IInterestPaymentInput, PaymentMethod } from '@/types';
import { useCreateInterestPayment, useUpdateInterestPayment, useInterestPayment } from '@/lib/hooks/use-interest-payments';
import { useLoanAccounts } from '@/lib/hooks/use-loan-accounts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EditPreviewDialog } from '@/components/shared/entity/edit-preview-dialog';

const PAYMENT_METHODS = [
    { value: PaymentMethod.CASH, label: 'Cash' },
    { value: PaymentMethod.UPI, label: 'UPI' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
    { value: PaymentMethod.CHEQUE, label: 'Cheque' },
    { value: PaymentMethod.CARD, label: 'Card' },
];

type FormErrors = Partial<Record<string, string>>;

interface InterestPaymentFormProps {
    mode?: 'create' | 'edit';
    id?: string;
    initialData?: IInterestPayment;
}

export function InterestPaymentForm({ mode = 'create', id, initialData: propsInitialData }: InterestPaymentFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [changes, setChanges] = useState<any[]>([]);

    const { data: loansData, isLoading: loansLoading } = useLoanAccounts({ limit: 100, status: 'active' });
    const createPaymentMutation = useCreateInterestPayment();
    const updatePaymentMutation = useUpdateInterestPayment();

    // Fetch data if editing
    const { data: fetchedData, isLoading: isLoadingInitial } = useInterestPayment(mode === 'edit' ? id || '' : '');
    const initialData = propsInitialData || fetchedData?.data;

    const isSubmitting = createPaymentMutation.isPending || updatePaymentMutation.isPending;
    const isLoading = isLoadingInitial && mode === 'edit';

    const [formData, setFormData] = useState<IInterestPaymentInput>({
        loanAccountId: initialData?.loanAccountId
            ? (typeof initialData.loanAccountId === 'object' ? (initialData.loanAccountId as any)._id?.toString() : initialData.loanAccountId.toString())
            : '',
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        interestAmount: initialData?.interestAmount || 0,
        principalAmount: initialData?.principalAmount || 0,
        paymentMethod: initialData?.paymentMethod || PaymentMethod.BANK_TRANSFER,
        notes: initialData?.notes || '',
    });

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                loanAccountId: typeof initialData.loanAccountId === 'object'
                    ? (initialData.loanAccountId as any)._id?.toString()
                    : initialData.loanAccountId.toString(),
                date: new Date(initialData.date),
                interestAmount: initialData.interestAmount,
                principalAmount: initialData.principalAmount,
                paymentMethod: initialData.paymentMethod,
                notes: initialData.notes || '',
            });
        }
    }, [initialData]);

    // Auto-select loan if provided in query params (only for create)
    useEffect(() => {
        if (mode === 'create' && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const loanId = params.get('loanAccountId');
            if (loanId) {
                updateFormField('loanAccountId', loanId);
            }
        }
    }, [mode]);

    // Calculate total whenever amounts change
    const totalAmount = (Number(formData.interestAmount) || 0) + (Number(formData.principalAmount) || 0);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.loanAccountId) {
            newErrors.loanAccountId = 'Please select a loan account';
        }

        if (!formData.date) {
            newErrors.date = 'Payment date is required';
        }

        if (formData.interestAmount <= 0 && formData.principalAmount <= 0) {
            newErrors.amounts = 'Either interest or principal amount must be greater than 0';
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Payment method is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
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
            date: 'Payment Date',
            interestAmount: 'Interest Amount',
            principalAmount: 'Principal Amount',
            paymentMethod: 'Payment Method',
            notes: 'Notes'
        };

        const fieldTypes: Record<string, 'text' | 'price' | 'date' | 'status' | 'list'> = {
            interestAmount: 'price',
            principalAmount: 'price',
            date: 'date'
        };

        Object.keys(labels).forEach(key => {
            let oldValue = (initialData as any)?.[key];
            let newValue = (formData as any)[key];

            if (key === 'date' && oldValue) {
                oldValue = new Date(oldValue).toISOString().split('T')[0];
                newValue = newValue ? new Date(newValue).toISOString().split('T')[0] : '';
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

        return changes;
    };

    const actualSubmit = async () => {
        setIsPreviewOpen(false);
        setErrors({});

        try {
            const input = {
                loanAccountId: formData.loanAccountId,
                date: formData.date || new Date(),
                interestAmount: Number(formData.interestAmount),
                principalAmount: Number(formData.principalAmount),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes?.trim() || undefined,
            };

            if (mode === 'create') {
                await createPaymentMutation.mutateAsync(input as IInterestPaymentInput);
                toast.success('Interest payment recorded successfully');
                router.push('/loan-accounts');
            } else if (mode === 'edit' && id) {
                await updatePaymentMutation.mutateAsync({ id: id, data: input as Partial<IInterestPaymentInput> });
                toast.success('Interest payment updated successfully');
                router.push('/loan-accounts');
            }
        } catch (error) {
            // Handled by hook
        }
    };

    const updateFormField = <K extends keyof IInterestPaymentInput>(field: K, value: IInterestPaymentInput[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field] || (field === 'interestAmount' || field === 'principalAmount') && errors.amounts) {
            setErrors((prev) => ({ ...prev, [field]: undefined, amounts: undefined }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
                <p className="text-muted-foreground font-medium animate-pulse">Loading payment details...</p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-12 pb-32">
                <AnimatePresence mode="popLayout">
                    {/* Target Account Section */}
                    <motion.div
                        key="account-info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <Landmark className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Loan Account
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Select the loan account for this payment
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6 font-semibold">
                                <div className="space-y-2.5">
                                    <Label htmlFor="loanAccountId" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                        Select Loan Account
                                        <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                            <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                        </span>
                                    </Label>
                                    <Select
                                        value={String(formData.loanAccountId)}
                                        onValueChange={(value) => updateFormField('loanAccountId', value)}
                                        disabled={isSubmitting || loansLoading}
                                    >
                                        <SelectTrigger id="loanAccountId" className={cn(
                                            "h-14 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4",
                                            errors.loanAccountId && "border-destructive/50"
                                        )}>
                                            <SelectValue placeholder={loansLoading ? 'Loading accounts...' : 'Choose an active loan account'} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                            {loansData?.data.map((loan) => (
                                                <SelectItem key={String(loan._id)} value={String(loan._id)} className="focus:bg-primary/10 transition-colors py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{loan.bankName}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{loan.loanType} • {loan.accountNumber}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Payment Details Section */}
                    <motion.div
                        key="payment-info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <IndianRupee className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Payment Details
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Amount and payment method details
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Payment Date */}
                                    <div className="space-y-2.5">
                                        <Label className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Payment Date
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <DatePicker
                                            date={formData.date}
                                            onDateChange={(date) => updateFormField('date', date || new Date())}
                                            placeholder="Select payment date"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="paymentMethod" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Payment Method
                                        </Label>
                                        <Select
                                            value={formData.paymentMethod}
                                            onValueChange={(value) => updateFormField('paymentMethod', value as PaymentMethod)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="paymentMethod" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                {PAYMENT_METHODS.map((method) => (
                                                    <SelectItem key={method.value} value={method.value} className="focus:bg-primary/10 transition-colors">
                                                        <div className="flex items-center gap-2.5 py-1">
                                                            <span className="font-medium">{method.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Interest Amount */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="interestAmount" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between text-indigo-600">
                                            Interest Portion
                                            <span className="text-xs normal-case opacity-70">Optional</span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm font-mono">₹</div>
                                            <Input
                                                id="interestAmount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.interestAmount}
                                                onChange={(e) => updateFormField('interestAmount', parseFloat(e.target.value) || 0)}
                                                disabled={isSubmitting}
                                                className="h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Principal Amount */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="principalAmount" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between text-success">
                                            Principal Portion
                                            <span className="text-xs normal-case opacity-70">Optional</span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm font-mono">₹</div>
                                            <Input
                                                id="principalAmount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.principalAmount}
                                                onChange={(e) => updateFormField('principalAmount', parseFloat(e.target.value) || 0)}
                                                disabled={isSubmitting}
                                                className="h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Total Summary */}
                                    <div className="md:col-span-2 p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-inner">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Payment Amount</span>
                                            <Wallet className="h-5 w-5 text-primary opacity-50" />
                                        </div>
                                        <div className="text-4xl font-black text-primary">
                                            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                        {errors.amounts && (
                                            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-2">
                                                <Info className="h-4 w-4" />
                                                {errors.amounts}
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label htmlFor="notes" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                                            <FileText className="h-4 w-4 opacity-50" />
                                            Payment Notes
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => updateFormField('notes', e.target.value)}
                                            placeholder="Enter any additional details about this payment (e.g., month covered, reference number)..."
                                            disabled={isSubmitting}
                                            className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Form Actions Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/40 backdrop-blur-2xl border-t border-border/30 z-50 flex items-center justify-end gap-4 px-8 md:px-12">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="h-12 px-8 font-bold rounded-2xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 px-10 font-bold bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xl shadow-primary/20 group overflow-hidden"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2.5">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="tracking-tight uppercase text-xs">Processing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="tracking-tight uppercase text-xs">{mode === 'create' ? 'Record Payment' : 'Save Changes'}</span>
                            </div>
                        )}
                    </Button>
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
