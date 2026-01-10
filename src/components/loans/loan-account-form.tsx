/**
 * LoanAccountForm Component
 *
 * Form for creating and editing loan accounts
 * with modern UI and consistent styling
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, Landmark, IndianRupee, Calendar as CalendarIcon, FileText } from 'lucide-react';
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
import { ILoanAccount, ILoanAccountInput, LoanAccountStatus } from '@/types';
import { useCreateLoanAccount, useUpdateLoanAccount, useLoanAccount } from '@/lib/hooks/use-loan-accounts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LoanAccountFormProps {
    mode: 'create' | 'edit';
    id?: string;
    initialData?: ILoanAccount;
}

type FormErrors = Partial<Record<string, string>>;

const LOAN_STATUSES = [
    { value: LoanAccountStatus.ACTIVE, label: 'Active', color: 'bg-primary' },
    { value: LoanAccountStatus.CLOSED, label: 'Closed', color: 'bg-muted-foreground/40' },
    { value: LoanAccountStatus.DEFAULTED, label: 'Defaulted', color: 'bg-destructive' },
];

export function LoanAccountForm({ mode, id, initialData: propsInitialData }: LoanAccountFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const createLoanMutation = useCreateLoanAccount();
    const updateLoanMutation = useUpdateLoanAccount();

    // Fetch data if editing
    const { data: fetchedData, isLoading: isLoadingInitial } = useLoanAccount(mode === 'edit' ? id || '' : '');
    const initialData = propsInitialData || fetchedData?.data;

    const isSubmitting = createLoanMutation.isPending || updateLoanMutation.isPending;
    const isLoading = isLoadingInitial && mode === 'edit';

    const [formData, setFormData] = useState<ILoanAccountInput>({
        bankName: initialData?.bankName || '',
        accountNumber: initialData?.accountNumber || '',
        loanType: initialData?.loanType || '',
        principalAmount: initialData?.principalAmount || 0,
        interestRate: initialData?.interestRate || 0,
        startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
        endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
        emiAmount: initialData?.emiAmount || 0,
        status: initialData?.status || LoanAccountStatus.ACTIVE,
        notes: initialData?.notes || '',
    });

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                bankName: initialData.bankName || '',
                accountNumber: initialData.accountNumber || '',
                loanType: initialData.loanType || '',
                principalAmount: initialData.principalAmount || 0,
                interestRate: initialData.interestRate || 0,
                startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
                endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
                emiAmount: initialData.emiAmount || 0,
                status: initialData.status || LoanAccountStatus.ACTIVE,
                notes: initialData.notes || '',
            });
        }
    }, [initialData]);

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

        if (!formData.bankName?.trim()) {
            newErrors.bankName = 'Bank name is required';
        }

        if (!formData.accountNumber?.trim()) {
            newErrors.accountNumber = 'Account number is required';
        }

        if (!formData.loanType?.trim()) {
            newErrors.loanType = 'Loan type is required';
        }

        if (formData.principalAmount <= 0) {
            newErrors.principalAmount = 'Principal amount must be greater than 0';
        }

        if (formData.interestRate < 0 || formData.interestRate > 100) {
            newErrors.interestRate = 'Interest rate must be between 0 and 100';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
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
                ...formData,
                bankName: formData.bankName.trim(),
                accountNumber: formData.accountNumber.trim(),
                loanType: formData.loanType.trim(),
                principalAmount: Number(formData.principalAmount),
                interestRate: Number(formData.interestRate),
                emiAmount: formData.emiAmount ? Number(formData.emiAmount) : undefined,
                notes: formData.notes?.trim() || undefined,
            };

            if (mode === 'create') {
                await createLoanMutation.mutateAsync(input as ILoanAccountInput);
                router.push('/loan-accounts');
            } else if (mode === 'edit' && id) {
                await updateLoanMutation.mutateAsync({ id, data: input as Partial<ILoanAccountInput> });
                router.push('/loan-accounts');
            }
        } catch (error) {
            // toast.error is handled in the hook
        }
    };

    const updateFormField = <K extends keyof ILoanAccountInput>(field: K, value: ILoanAccountInput[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
                <p className="text-muted-foreground font-medium animate-pulse">Loading account details...</p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-12 pb-32">
                <AnimatePresence mode="popLayout">
                    {/* Main Account Details */}
                    <motion.div
                        key="account-info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <Landmark className="h-6 w-6 text-primary relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Loan Account Details
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Specify the bank and loan account parameters
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Bank Name */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="bankName" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Bank Name
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Input
                                            id="bankName"
                                            value={formData.bankName}
                                            onChange={(e) => updateFormField('bankName', e.target.value)}
                                            placeholder="e.g., HDFC Bank, SBI"
                                            required
                                            disabled={isSubmitting}
                                            className={cn(
                                                'h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl',
                                                errors.bankName && 'border-destructive/50 focus:border-destructive'
                                            )}
                                        />
                                        {errors.bankName && (
                                            <p className="text-xs font-semibold text-destructive mt-1 px-1">
                                                {errors.bankName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Account Number */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="accountNumber" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Account Number / Loan ID
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Input
                                            id="accountNumber"
                                            value={formData.accountNumber}
                                            onChange={(e) => updateFormField('accountNumber', e.target.value)}
                                            placeholder="Enter loan account number"
                                            required
                                            disabled={isSubmitting}
                                            className={cn(
                                                'h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-mono',
                                                errors.accountNumber && 'border-destructive/50 focus:border-destructive'
                                            )}
                                        />
                                    </div>

                                    {/* Loan Type */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="loanType" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Loan Type
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <Input
                                            id="loanType"
                                            value={formData.loanType}
                                            onChange={(e) => updateFormField('loanType', e.target.value)}
                                            placeholder="e.g., Business Loan, Working Capital"
                                            required
                                            disabled={isSubmitting}
                                            className={cn(
                                                'h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl',
                                                errors.loanType && 'border-destructive/50 focus:border-destructive'
                                            )}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="status" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Status
                                        </Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => updateFormField('status', value as LoanAccountStatus)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="status" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                                                {LOAN_STATUSES.map((status) => (
                                                    <SelectItem key={status.value} value={status.value} className="focus:bg-primary/10 transition-colors">
                                                        <div className="flex items-center gap-2.5 py-1">
                                                            <div className={cn('h-2.5 w-2.5 rounded-full', status.color)} />
                                                            <span className="font-medium">{status.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Financial Parameters */}
                    <motion.div
                        key="financial-info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <IndianRupee className="h-6 w-6 text-amber-600 relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Financial Parameters
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        Loan amount, interest rates and EMI details
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Principal Amount */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="principalAmount" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Loan Principal Amount
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</div>
                                            <Input
                                                id="principalAmount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.principalAmount}
                                                onChange={(e) => updateFormField('principalAmount', parseFloat(e.target.value) || 0)}
                                                required
                                                disabled={isSubmitting}
                                                className={cn(
                                                    'h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl',
                                                    errors.principalAmount && 'border-destructive/50 focus:border-destructive'
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Interest Rate */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="interestRate" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Annual Interest Rate (%)
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">%</div>
                                            <Input
                                                id="interestRate"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={formData.interestRate}
                                                onChange={(e) => updateFormField('interestRate', parseFloat(e.target.value) || 0)}
                                                required
                                                disabled={isSubmitting}
                                                className={cn(
                                                    'h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl pr-10',
                                                    errors.interestRate && 'border-destructive/50 focus:border-destructive'
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* EMI Amount */}
                                    <div className="space-y-2.5">
                                        <Label htmlFor="emiAmount" className="text-sm font-semibold tracking-tight text-foreground/80">
                                            Monthly EMI Amount
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</div>
                                            <Input
                                                id="emiAmount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.emiAmount}
                                                onChange={(e) => updateFormField('emiAmount', parseFloat(e.target.value) || 0)}
                                                disabled={isSubmitting}
                                                className="h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label htmlFor="notes" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                                            <FileText className="h-4 w-4 opacity-50" />
                                            Additional Notes
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => updateFormField('notes', e.target.value)}
                                            placeholder="Enter any additional details about the loan agreement..."
                                            disabled={isSubmitting}
                                            className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Timeline Section */}
                    <motion.div
                        key="timeline-info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <CalendarIcon className="h-6 w-6 text-indigo-500 relative z-10" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                                        Loan Timeline
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-muted-foreground/70">
                                        When did the loan start and when is it expected to end?
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2.5">
                                        <Label className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                                            Start Date
                                            <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                                                <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                                            </span>
                                        </Label>
                                        <DatePicker
                                            date={formData.startDate}
                                            onDateChange={(date) => updateFormField('startDate', date || new Date())}
                                            placeholder="Select start date"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label className="text-sm font-semibold tracking-tight text-foreground/80">
                                            End Date (Optional)
                                        </Label>
                                        <DatePicker
                                            date={formData.endDate}
                                            onDateChange={(date) => updateFormField('endDate', date)}
                                            placeholder="Select end date"
                                            disabled={isSubmitting}
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
                        className="h-12 px-8 font-bold rounded-2xl transition-all"
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
                                <span className="tracking-tight uppercase text-xs">{mode === 'create' ? 'Create Account' : 'Save Changes'}</span>
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </TooltipProvider>
    );
}
