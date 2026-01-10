/**
 * ExpenseForm Component
 *
 * Form for creating and editing expenses
 * with modern UI and consistent styling matching payment form
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, Receipt, FileText } from 'lucide-react';
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
import { PaymentMethod, ExpenseCategory, IExpense } from '@/types';
import { useCreateExpense, useUpdateExpense } from '@/lib/hooks/use-expenses';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseFormProps {
    mode: 'create' | 'edit';
    expenseId?: string;
    initialData?: IExpense;
}

interface ExpenseFormData {
    date: Date | undefined;
    category: ExpenseCategory;
    description: string;
    amount: number;
    paymentMethod: PaymentMethod;
    receiptNumber: string;
    notes: string;
}

type FormErrors = Partial<Record<string, string>>;

const EXPENSE_CATEGORIES = [
    { value: ExpenseCategory.RENT, label: 'Rent', color: 'bg-blue-500' },
    { value: ExpenseCategory.UTILITIES, label: 'Utilities', color: 'bg-yellow-500' },
    { value: ExpenseCategory.SALARIES, label: 'Salaries', color: 'bg-green-500' },
    { value: ExpenseCategory.TRANSPORTATION, label: 'Transportation', color: 'bg-purple-500' },
    { value: ExpenseCategory.OFFICE_SUPPLIES, label: 'Office Supplies', color: 'bg-pink-500' },
    { value: ExpenseCategory.MARKETING, label: 'Marketing', color: 'bg-indigo-500' },
    { value: ExpenseCategory.MAINTENANCE, label: 'Maintenance', color: 'bg-orange-500' },
    { value: ExpenseCategory.PROFESSIONAL_FEES, label: 'Professional Fees', color: 'bg-cyan-500' },
    { value: ExpenseCategory.INSURANCE, label: 'Insurance', color: 'bg-teal-500' },
    { value: ExpenseCategory.TAXES, label: 'Taxes', color: 'bg-red-500' },
    { value: ExpenseCategory.INTEREST, label: 'Interest', color: 'bg-amber-500' },
    { value: ExpenseCategory.MISCELLANEOUS, label: 'Miscellaneous', color: 'bg-gray-500' },
];

const PAYMENT_METHODS = [
    { value: PaymentMethod.CASH, label: 'Cash' },
    { value: PaymentMethod.UPI, label: 'UPI' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
    { value: PaymentMethod.CHEQUE, label: 'Cheque' },
    { value: PaymentMethod.CARD, label: 'Card' },
];

export function ExpenseForm({ mode, expenseId, initialData }: ExpenseFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const createExpenseMutation = useCreateExpense();
    const updateExpenseMutation = useUpdateExpense();
    const isSubmitting = createExpenseMutation.isPending || updateExpenseMutation.isPending;

    const [formData, setFormData] = useState<ExpenseFormData>({
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        category: initialData?.category || ExpenseCategory.MISCELLANEOUS,
        description: initialData?.description || '',
        amount: initialData?.amount || 0,
        paymentMethod: initialData?.paymentMethod || PaymentMethod.CASH,
        receiptNumber: initialData?.receiptNumber || '',
        notes: initialData?.notes || '',
    });

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

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
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

        setErrors({});

        try {
            const input = {
                date: formData.date || new Date(),
                category: formData.category,
                description: formData.description.trim(),
                amount: Number(formData.amount),
                paymentMethod: formData.paymentMethod,
                receiptNumber: formData.receiptNumber?.trim() || undefined,
                notes: formData.notes?.trim() || undefined,
            };

            if (mode === 'create') {
                await createExpenseMutation.mutateAsync(input);
                toast.success('Expense recorded successfully');
                router.push('/expenses');
            } else if (mode === 'edit' && expenseId) {
                await updateExpenseMutation.mutateAsync({ id: expenseId, data: input });
                toast.success('Expense updated successfully');
                router.push(`/expenses/${expenseId}`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : `Failed to ${mode} expense`;
            toast.error(message);
            setErrors({ submit: message });
        }
    };

    const updateFormField = <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <TooltipProvider>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-12 pb-32">
                <AnimatePresence mode="popLayout">
                    {/* Expense Details Section */}
                    <motion.div
                        key="expense-details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="relative"
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-500/10 transition-colors" />

                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-50" />
                                    <Receipt className="h-6 w-6 text-orange-500 relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Expense Details
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Enter the expense information
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Date */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="date" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Date
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <DatePicker
                                            id="date"
                                            date={formData.date}
                                            onDateChange={(date) => updateFormField('date', date)}
                                            placeholder="Select expense date"
                                            disabled={isSubmitting}
                                            className={cn(
                                                errors.date && 'border-destructive/50 hover:border-destructive'
                                            )}
                                        />
                                        {errors.date && (
                                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                                <Info className="h-3 w-3" /> {errors.date}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="category" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Category
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => updateFormField('category', value as ExpenseCategory)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="category" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden max-h-[300px]">
                                                {EXPENSE_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value} className="focus:bg-primary/10 transition-colors">
                                                        <div className="flex items-center gap-2.5 py-1">
                                                            <div className={cn('h-2.5 w-2.5 rounded-full', cat.color)} />
                                                            <span className="font-medium">{cat.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label htmlFor="description" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Description
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => updateFormField('description', e.target.value)}
                                            placeholder="e.g., Monthly electricity bill"
                                            required
                                            disabled={isSubmitting}
                                            maxLength={200}
                                            className={cn(
                                                'h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl',
                                                errors.description && 'border-destructive/50 focus:border-destructive'
                                            )}
                                        />
                                        {errors.description && (
                                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                                <Info className="h-3 w-3" /> {errors.description}
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

                                    {/* Receipt Number */}
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label htmlFor="receiptNumber" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                                            Receipt Number
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="bg-popover/90 backdrop-blur-md border-border/30">
                                                    <p className="text-xs">Optional receipt or invoice number for reference</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input
                                            id="receiptNumber"
                                            value={formData.receiptNumber}
                                            onChange={(e) => updateFormField('receiptNumber', e.target.value)}
                                            placeholder="e.g., INV-2024-001"
                                            disabled={isSubmitting}
                                            className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-mono"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notes Section */}
                    <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                    <FileText className="h-6 w-6 text-primary relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Additional Notes
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Any additional information about this expense
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
                                        placeholder="Add any notes about this expense..."
                                        disabled={isSubmitting}
                                        rows={3}
                                        maxLength={500}
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
                                    <span className="tracking-tight uppercase text-xs">{mode === 'create' ? 'Record Expense' : 'Save Changes'}</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </TooltipProvider>
    );
}
