/**
 * PaymentForm Component
 *
 * Form for creating and editing payments
 * with modern UI and consistent styling matching asset form
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, CreditCard, User, Building, Package } from 'lucide-react';
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
import { PaymentMethod, TransactionType, AccountType, PartyType, IPayment } from '@/types';
import { useCreatePayment, useUpdatePayment } from '@/lib/hooks/use-payments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EditPreviewDialog } from '@/components/shared/entity/edit-preview-dialog';

interface PaymentFormProps {
    mode: 'create' | 'edit';
    paymentId?: string;
    initialData?: IPayment;
}

interface PaymentFormData {
    paymentDate: Date | undefined;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionType: TransactionType;
    accountType: AccountType;
    partyType: PartyType;
    partyId: string;
    transactionId: string;
    assetId: string;
    notes: string;
}

type FormErrors = Partial<Record<string, string>>;

const TRANSACTION_TYPES = [
    { value: TransactionType.SALE, label: 'Sale', color: 'bg-success' },
    { value: TransactionType.PURCHASE, label: 'Purchase', color: 'bg-blue-500' },
    { value: TransactionType.EXPENSE, label: 'Expense', color: 'bg-orange-500' },
];

const PAYMENT_METHODS = [
    { value: PaymentMethod.CASH, label: 'Cash' },
    { value: PaymentMethod.UPI, label: 'UPI' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
    { value: PaymentMethod.CHEQUE, label: 'Cheque' },
    { value: PaymentMethod.CARD, label: 'Card' },
];

export function PaymentForm({ mode, paymentId, initialData }: PaymentFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [changes, setChanges] = useState<any[]>([]);

    const createPaymentMutation = useCreatePayment();
    const updatePaymentMutation = useUpdatePayment();
    const isSubmitting = createPaymentMutation.isPending || updatePaymentMutation.isPending;

    // Party data
    const [parties, setParties] = useState<{ _id: string; name: string }[]>([]);
    const [partiesLoading, setPartiesLoading] = useState(false);

    // Assets data (for purchase transactions)
    const [assets, setAssets] = useState<{ _id: string; name: string; remainingAmount?: number }[]>([]);
    const [assetsLoading, setAssetsLoading] = useState(false);

    const [formData, setFormData] = useState<PaymentFormData>({
        paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate) : new Date(),
        amount: initialData?.amount || 0,
        paymentMethod: initialData?.paymentMethod || PaymentMethod.CASH,
        transactionType: initialData?.transactionType || TransactionType.PURCHASE,
        accountType: initialData?.accountType || AccountType.PAYABLE,
        partyType: initialData?.partyType || PartyType.VENDOR,
        partyId: typeof initialData?.partyId === 'string' ? initialData.partyId : initialData?.partyId?.toString() || '',
        transactionId: initialData?.transactionId || '',
        assetId: typeof initialData?.assetId === 'string' ? initialData.assetId : initialData?.assetId?.toString() || '',
        notes: initialData?.notes || '',
    });

    // Fetch parties based on selected type
    useEffect(() => {
        const fetchParties = async () => {
            setPartiesLoading(true);
            try {
                const endpoint = formData.partyType === PartyType.VENDOR ? '/api/vendors' : '/api/clients';
                const response = await fetch(endpoint);
                const data = await response.json();
                if (data.success) {
                    setParties(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch parties:', error);
            } finally {
                setPartiesLoading(false);
            }
        };
        fetchParties();
    }, [formData.partyType]);

    // Fetch assets for purchase transactions
    useEffect(() => {
        const fetchAssets = async () => {
            if (formData.transactionType === TransactionType.PURCHASE) {
                setAssetsLoading(true);
                try {
                    const response = await fetch('/api/assets');
                    const data = await response.json();
                    if (data.success) {
                        setAssets(data.data || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch assets:', error);
                } finally {
                    setAssetsLoading(false);
                }
            }
        };
        fetchAssets();
    }, [formData.transactionType]);

    // Update account type and party type based on transaction type
    useEffect(() => {
        if (formData.transactionType === TransactionType.SALE) {
            setFormData(prev => ({
                ...prev,
                accountType: AccountType.RECEIVABLE,
                partyType: PartyType.CLIENT,
            }));
        } else if (formData.transactionType === TransactionType.PURCHASE) {
            setFormData(prev => ({
                ...prev,
                accountType: AccountType.PAYABLE,
                partyType: PartyType.VENDOR,
            }));
        }
    }, [formData.transactionType]);

    // Handle Ctrl+S keyboard shortcut for quick save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (!isSubmitting) {
                    formRef.current?.requestSubmit();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitting]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }

        if (formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.partyId) {
            newErrors.partyId = `${formData.partyType === PartyType.VENDOR ? 'Vendor' : 'Client'} is required`;
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
            paymentDate: 'Payment Date',
            amount: 'Amount',
            paymentMethod: 'Payment Method',
            transactionType: 'Transaction Type',
            partyId: formData.partyType === PartyType.VENDOR ? 'Vendor' : 'Client',
            transactionId: 'Transaction ID',
            notes: 'Notes'
        };

        const fieldTypes: Record<string, 'text' | 'price' | 'date' | 'status' | 'list'> = {
            amount: 'price',
            paymentDate: 'date',
            transactionType: 'status'
        };

        Object.keys(labels).forEach(key => {
            let oldValue = (initialData as any)?.[key];
            let newValue = (formData as any)[key];

            if (key === 'paymentDate' && oldValue) {
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
                paymentDate: formData.paymentDate || new Date(),
                amount: Number(formData.amount),
                paymentMethod: formData.paymentMethod,
                transactionType: formData.transactionType,
                accountType: formData.accountType,
                partyType: formData.partyType,
                partyId: formData.partyId,
                transactionId: formData.transactionId?.trim() || undefined,
                assetId: formData.assetId || undefined,
                notes: formData.notes?.trim() || undefined,
            };

            if (mode === 'create') {
                await createPaymentMutation.mutateAsync(input);
                toast.success('Payment recorded successfully');
                router.push('/payments');
            } else if (mode === 'edit' && paymentId) {
                await updatePaymentMutation.mutateAsync({ id: paymentId, data: input });
                toast.success('Payment updated successfully');
                router.push(`/payments/${paymentId}`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : `Failed to ${mode} payment`;
            toast.error(message);
            setErrors({ submit: message });
        }
    };

    const updateFormField = <K extends keyof PaymentFormData>(field: K, value: PaymentFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <TooltipProvider>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-12 pb-32">
                <AnimatePresence mode="popLayout">
                    {/* Payment Details Section */}
                    <motion.div
                        key="payment-details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="relative"
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-50" />
                                    <CreditCard className="h-6 w-6 text-indigo-500 relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Payment Details
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Enter the payment information
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Payment Date */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="paymentDate" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Payment Date
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <DatePicker
                                            id="paymentDate"
                                            date={formData.paymentDate}
                                            onDateChange={(date) => updateFormField('paymentDate', date)}
                                            placeholder="Select payment date"
                                            disabled={isSubmitting}
                                            className={cn(
                                                errors.paymentDate && 'border-destructive/50 hover:border-destructive'
                                            )}
                                        />
                                        {errors.paymentDate && (
                                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                                <Info className="h-3 w-3" /> {errors.paymentDate}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Amount */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="amount" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Amount
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                                                {'\u20B9'}
                                            </div>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => updateFormField('amount', parseFloat(e.target.value) || 0)}
                                                required
                                                disabled={isSubmitting}
                                                className={cn(
                                                    'h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-bold',
                                                    errors.amount && 'border-destructive/50 focus:border-destructive'
                                                )}
                                            />
                                        </div>
                                        {errors.amount && (
                                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                                <Info className="h-3 w-3" /> {errors.amount}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Transaction Type */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="transactionType" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Transaction Type
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.transactionType}
                                            onValueChange={(value) => updateFormField('transactionType', value as TransactionType)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="transactionType" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                {TRANSACTION_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value} className="focus:bg-primary/10 transition-colors">
                                                        <div className="flex items-center gap-2.5 py-1">
                                                            <div className={cn('h-2.5 w-2.5 rounded-full', type.color)} />
                                                            <span className="font-medium">{type.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                {PAYMENT_METHODS.map((method) => (
                                                    <SelectItem key={method.value} value={method.value} className="focus:bg-primary/10 transition-colors">
                                                        <span className="font-medium">{method.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Transaction ID */}
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label htmlFor="transactionId" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                                            Transaction ID / Reference
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="bg-popover/90 backdrop-blur-md border-border/30">
                                                    <p className="text-xs">Bank reference or transaction ID</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input
                                            id="transactionId"
                                            value={formData.transactionId}
                                            onChange={(e) => updateFormField('transactionId', e.target.value)}
                                            placeholder="e.g., UTR123456789"
                                            disabled={isSubmitting}
                                            className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-mono"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Party Selection Section */}
                    <motion.div
                        key="party-selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                    {formData.partyType === PartyType.VENDOR ? (
                                        <Building className="h-6 w-6 text-primary relative z-10" />
                                    ) : (
                                        <User className="h-6 w-6 text-primary relative z-10" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        {formData.partyType === PartyType.VENDOR ? 'Vendor' : 'Client'} Details
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Select the {formData.partyType === PartyType.VENDOR ? 'vendor' : 'client'} for this payment
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Party Type */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="partyType" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Party Type
                                        </Label>
                                        <Select
                                            value={formData.partyType}
                                            onValueChange={(value) => {
                                                updateFormField('partyType', value as PartyType);
                                                updateFormField('partyId', '');
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="partyType" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                <SelectItem value={PartyType.VENDOR} className="focus:bg-primary/10 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4" />
                                                        <span className="font-medium">Vendor</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={PartyType.CLIENT} className="focus:bg-primary/10 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span className="font-medium">Client</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Party Selection */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="partyId" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            {formData.partyType === PartyType.VENDOR ? 'Vendor' : 'Client'}
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.partyId || '_none'}
                                            onValueChange={(value) => updateFormField('partyId', value === '_none' ? '' : value)}
                                            disabled={isSubmitting || partiesLoading}
                                        >
                                            <SelectTrigger id="partyId" className={cn(
                                                "h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4",
                                                errors.partyId && 'border-destructive/50'
                                            )}>
                                                <SelectValue placeholder={partiesLoading ? 'Loading...' : `Select ${formData.partyType}`} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                <SelectItem value="_none" className="focus:bg-muted/50 transition-colors">
                                                    <span className="text-muted-foreground">Select {formData.partyType}</span>
                                                </SelectItem>
                                                {parties.map((party) => (
                                                    <SelectItem key={party._id} value={party._id} className="focus:bg-primary/10 transition-colors">
                                                        <span className="font-medium">{party.name}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.partyId && (
                                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                                <Info className="h-3 w-3" /> {errors.partyId}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Asset Selection (for purchase transactions) */}
                                    {formData.transactionType === TransactionType.PURCHASE && (
                                        <div className="space-y-2.5 md:col-span-2">
                                            <Label htmlFor="assetId" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                Link to Asset (Optional)
                                            </Label>
                                            <Select
                                                value={formData.assetId || '_none'}
                                                onValueChange={(value) => updateFormField('assetId', value === '_none' ? '' : value)}
                                                disabled={isSubmitting || assetsLoading}
                                            >
                                                <SelectTrigger id="assetId" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                    <SelectValue placeholder={assetsLoading ? 'Loading assets...' : 'Select asset (optional)'} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                    <SelectItem value="_none" className="focus:bg-muted/50 transition-colors">
                                                        <span className="text-muted-foreground">No asset linked</span>
                                                    </SelectItem>
                                                    {assets.map((asset) => (
                                                        <SelectItem key={asset._id} value={asset._id} className="focus:bg-primary/10 transition-colors">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="font-medium">{asset.name}</span>
                                                                {asset.remainingAmount !== undefined && asset.remainingAmount > 0 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Due: ₹{asset.remainingAmount.toLocaleString('en-IN')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notes Section */}
                    <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                    <Info className="h-6 w-6 text-primary relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Additional Notes
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Any additional information about this payment
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="notes" className="text-sm font-semibold tracking-tight text-foreground/80">
                                        Notes (Optional)
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => updateFormField('notes', e.target.value)}
                                        placeholder="Add any notes about this payment..."
                                        disabled={isSubmitting}
                                        rows={3}
                                        className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Submit Error */}
                {errors.submit && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 backdrop-blur-sm flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                            <Info className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-destructive underline decoration-destructive/30 underline-offset-4">Submission Failed</p>
                            <p className="text-sm text-destructive/80 font-medium leading-relaxed">{errors.submit}</p>
                        </div>
                    </motion.div>
                )}

                {/* Form Actions Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/40 backdrop-blur-2xl border-t border-border/30 z-50 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 md:px-12 shadow-[0_-12px_40px_rgba(0,0,0,0.1)]">
                    <div className="hidden sm:flex items-center gap-6 group">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/20 group-hover:bg-muted transition-colors">
                            <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground border border-border/40">Ctrl</kbd>
                            <span className="text-muted-foreground/40">+</span>
                            <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground border border-border/40">S</kbd>
                            <span className="text-[11px] font-bold text-muted-foreground/70 tracking-widest uppercase ml-1">Quick Save</span>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="h-12 px-8 font-bold border-border/40 hover:bg-muted bg-background/50 backdrop-blur-sm rounded-2xl transition-all w-full sm:w-auto hover:border-border"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 px-10 font-bold bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xl shadow-primary/20 w-full sm:w-auto relative group overflow-hidden active:scale-95"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="tracking-tight uppercase text-xs">{mode === 'create' ? 'Recording...' : 'Updating...'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    <span className="tracking-tight uppercase text-xs">{mode === 'create' ? 'Record Payment' : 'Save Changes'}</span>
                                </div>
                            )}
                        </Button>
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
