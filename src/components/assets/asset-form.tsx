/**
 * AssetForm Component
 *
 * Form for creating and editing assets
 * with modern UI, payment recording, and consistent styling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, MapPin, DollarSign, Monitor, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { IAsset, IAssetInput, AssetCategory, AssetStatus, PaymentMethod } from '@/types';
import { useCreateAsset, useUpdateAsset } from '@/lib/hooks/use-assets';
import { useVendors } from '@/lib/hooks/use-vendors';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetFormProps {
  mode: 'create' | 'edit';
  assetId?: string;
  initialData?: IAsset;
}

interface AssetFormData {
  name: string;
  description: string;
  category: AssetCategory;
  serialNumber: string;
  purchaseDate: Date | undefined;
  purchasePrice: number;
  currentValue: number;
  location: string;
  vendorId: string;
  status: AssetStatus;
}

interface PaymentFormData {
  recordPayment: boolean;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date | undefined;
  notes: string;
}

type FormErrors = Partial<Record<string, string>>;

const ASSET_CATEGORIES = [
  { value: AssetCategory.ELECTRONICS, label: 'Electronics' },
  { value: AssetCategory.FURNITURE, label: 'Furniture' },
  { value: AssetCategory.MACHINERY, label: 'Machinery' },
  { value: AssetCategory.VEHICLE, label: 'Vehicle' },
  { value: AssetCategory.OFFICE_EQUIPMENT, label: 'Office Equipment' },
  { value: AssetCategory.OTHER, label: 'Other' },
];

const ASSET_STATUSES = [
  { value: AssetStatus.ACTIVE, label: 'Active', color: 'bg-success' },
  { value: AssetStatus.REPAIR, label: 'Under Repair', color: 'bg-warning' },
  { value: AssetStatus.RETIRED, label: 'Retired', color: 'bg-muted-foreground/40' },
  { value: AssetStatus.DISPOSED, label: 'Disposed', color: 'bg-destructive' },
];

const PAYMENT_METHODS = [
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.UPI, label: 'UPI' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PaymentMethod.CHEQUE, label: 'Cheque' },
  { value: PaymentMethod.CARD, label: 'Card' },
];

export function AssetForm({ mode, assetId, initialData }: AssetFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset(assetId || '');
  const isSubmitting = createAssetMutation.isPending || updateAssetMutation.isPending;

  const { data: vendorsData, isLoading: vendorsLoading } = useVendors({ limit: 100 });

  const [formData, setFormData] = useState<AssetFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || AssetCategory.ELECTRONICS,
    serialNumber: initialData?.serialNumber || '',
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate)
      : new Date(),
    purchasePrice: initialData?.purchasePrice || 0,
    currentValue: initialData?.currentValue || 0,
    location: initialData?.location || '',
    vendorId: initialData?.vendorId ? String(initialData.vendorId) : '',
    status: initialData?.status || AssetStatus.ACTIVE,
  });

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    recordPayment: false,
    amount: 0,
    paymentMethod: PaymentMethod.UPI,
    paymentDate: new Date(),
    notes: '',
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || AssetCategory.ELECTRONICS,
        serialNumber: initialData.serialNumber || '',
        purchaseDate: initialData.purchaseDate
          ? new Date(initialData.purchaseDate)
          : new Date(),
        purchasePrice: initialData.purchasePrice || 0,
        currentValue: initialData.currentValue || 0,
        location: initialData.location || '',
        vendorId: initialData.vendorId ? String(initialData.vendorId) : '',
        status: initialData.status || AssetStatus.ACTIVE,
      });
    }
  }, [initialData]);

  // Set currentValue to purchasePrice when creating
  useEffect(() => {
    if (mode === 'create' && formData.currentValue === 0 && formData.purchasePrice > 0) {
      setFormData(prev => ({ ...prev, currentValue: prev.purchasePrice }));
    }
  }, [mode, formData.purchasePrice, formData.currentValue]);

  // Update payment amount when purchase price changes
  useEffect(() => {
    if (mode === 'create' && paymentData.recordPayment) {
      setPaymentData(prev => ({ ...prev, amount: formData.purchasePrice }));
    }
  }, [mode, formData.purchasePrice, paymentData.recordPayment]);

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

    if (!formData.name?.trim()) {
      newErrors.name = 'Asset name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (formData.currentValue < 0) {
      newErrors.currentValue = 'Current value cannot be negative';
    }

    if (paymentData.recordPayment && !formData.vendorId) {
      newErrors.vendorId = 'Vendor is required to record payment';
    }

    if (paymentData.recordPayment && paymentData.amount <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than 0';
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
      const input: IAssetInput = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        category: formData.category,
        serialNumber: formData.serialNumber?.trim() || undefined,
        purchaseDate: formData.purchaseDate || new Date(),
        purchasePrice: Number(formData.purchasePrice),
        currentValue: Number(formData.currentValue),
        location: formData.location?.trim() || undefined,
        vendorId: formData.vendorId || undefined,
        status: formData.status,
      };

      // Add payment details if recording payment
      if (mode === 'create' && paymentData.recordPayment && formData.vendorId) {
        input.paymentDetails = {
          amount: Number(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          paymentDate: paymentData.paymentDate || new Date(),
          notes: paymentData.notes?.trim() || undefined,
        };
      }

      if (mode === 'create') {
        const response = await createAssetMutation.mutateAsync(input);
        toast.success(paymentData.recordPayment ? 'Asset created with payment recorded' : 'Asset created successfully');
        if (response.data?._id) {
          router.push(`/assets/${response.data._id}`);
        } else {
          router.push('/assets');
        }
      } else if (mode === 'edit' && assetId) {
        await updateAssetMutation.mutateAsync(input);
        toast.success('Asset updated successfully');
        router.push(`/assets/${assetId}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${mode} asset`;
      toast.error(message);
      setErrors({ submit: message });
    }
  };

  const updateFormField = <K extends keyof AssetFormData>(field: K, value: AssetFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updatePaymentField = <K extends keyof PaymentFormData>(field: K, value: PaymentFormData[K]) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePaymentRecording = (checked: boolean) => {
    setPaymentData(prev => ({
      ...prev,
      recordPayment: checked,
      amount: checked ? formData.purchasePrice : 0,
    }));
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-50" />
                  <Monitor className="h-6 w-6 text-indigo-500 relative z-10" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                    Asset Information
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/70">
                    Basic details about this asset
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Asset Name */}
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                      Asset Name
                      <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                        <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                      </span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormField('name', e.target.value)}
                      placeholder="e.g., Dell Laptop, Office Chair"
                      required
                      disabled={isSubmitting}
                      className={cn(
                        'h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl',
                        errors.name && 'border-destructive/50 focus:border-destructive shadow-destructive/5'
                      )}
                    />
                    {errors.name && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.name}
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
                      onValueChange={(value) => updateFormField('category', value as AssetCategory)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="category" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                        {ASSET_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="focus:bg-primary/10 transition-colors">
                            <span className="font-medium">{cat.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.category}
                      </motion.p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2.5 md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-semibold tracking-tight text-foreground/80">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormField('description', e.target.value)}
                      placeholder="Brief description of the asset..."
                      disabled={isSubmitting}
                      rows={3}
                      className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="space-y-2.5">
                    <Label htmlFor="serialNumber" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                      Serial Number
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover/90 backdrop-blur-md border-border/30">
                          <p className="text-xs">Unique identifier for tracking</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => updateFormField('serialNumber', e.target.value)}
                      placeholder="e.g., SN-2024-001"
                      disabled={isSubmitting}
                      className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-mono"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2.5">
                    <Label htmlFor="status" className="text-sm font-semibold tracking-tight text-foreground/80">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateFormField('status', value as AssetStatus)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="status" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                        {ASSET_STATUSES.map((status) => (
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

          {/* Financial Information Section */}
          <motion.div
            key="financial-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                  <DollarSign className="h-6 w-6 text-primary relative z-10" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                    Financial Details
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/70">
                    Purchase and valuation information
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Purchase Date */}
                  <div className="space-y-2.5">
                    <Label htmlFor="purchaseDate" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                      Purchase Date
                      <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                        <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                      </span>
                    </Label>
                    <DatePicker
                      id="purchaseDate"
                      date={formData.purchaseDate}
                      onDateChange={(date) => updateFormField('purchaseDate', date)}
                      placeholder="Select purchase date"
                      disabled={isSubmitting}
                      className={cn(
                        errors.purchaseDate && 'border-destructive/50 hover:border-destructive'
                      )}
                    />
                    {errors.purchaseDate && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.purchaseDate}
                      </motion.p>
                    )}
                  </div>

                  {/* Vendor */}
                  <div className="space-y-2.5">
                    <Label htmlFor="vendorId" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                      Purchased From (Vendor)
                      {paymentData.recordPayment && (
                        <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                          <div className="h-1 w-1 rounded-full bg-destructive" /> Required for payment
                        </span>
                      )}
                    </Label>
                    <Select
                      value={formData.vendorId || '_none'}
                      onValueChange={(value) => updateFormField('vendorId', value === '_none' ? '' : value)}
                      disabled={isSubmitting || vendorsLoading}
                    >
                      <SelectTrigger id="vendorId" className={cn(
                        "h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4",
                        errors.vendorId && 'border-destructive/50'
                      )}>
                        <SelectValue placeholder={vendorsLoading ? 'Loading vendors...' : 'Select vendor (optional)'} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                        <SelectItem value="_none" className="focus:bg-muted/50 transition-colors">
                          <span className="text-muted-foreground">No vendor selected</span>
                        </SelectItem>
                        {vendorsData?.data.map((vendor) => (
                          <SelectItem key={String(vendor._id)} value={String(vendor._id)} className="focus:bg-primary/10 transition-colors">
                            <span className="font-medium">{vendor.name}</span>
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

                  {/* Purchase Price */}
                  <div className="space-y-2.5">
                    <Label htmlFor="purchasePrice" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                      Purchase Price
                      <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest">
                        <div className="h-1 w-1 rounded-full bg-destructive" /> Required
                      </span>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                        {'\u20B9'}
                      </div>
                      <Input
                        id="purchasePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) => updateFormField('purchasePrice', parseFloat(e.target.value) || 0)}
                        required
                        disabled={isSubmitting}
                        className={cn(
                          'h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl',
                          errors.purchasePrice && 'border-destructive/50 focus:border-destructive'
                        )}
                      />
                    </div>
                    {errors.purchasePrice && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.purchasePrice}
                      </motion.p>
                    )}
                  </div>

                  {/* Current Value */}
                  <div className="space-y-2.5">
                    <Label htmlFor="currentValue" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                      Current Value
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover/90 backdrop-blur-md border-border/30">
                          <p className="text-xs">Estimated current market value</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                        {'\u20B9'}
                      </div>
                      <Input
                        id="currentValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.currentValue}
                        onChange={(e) => updateFormField('currentValue', parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                        className={cn(
                          'h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl',
                          errors.currentValue && 'border-destructive/50 focus:border-destructive'
                        )}
                      />
                    </div>
                    {errors.currentValue && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.currentValue}
                      </motion.p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location Section */}
          <motion.div
            key="location-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                  <MapPin className="h-6 w-6 text-primary relative z-10" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                    Location
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/70">
                    Where is this asset located?
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6">
                <div className="space-y-2.5">
                  <Label htmlFor="location" className="text-sm font-semibold tracking-tight text-foreground/80">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormField('location', e.target.value)}
                    placeholder="e.g., Main Office, Warehouse A, Production Floor"
                    disabled={isSubmitting}
                    className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Recording Section - Only show in create mode */}
          {mode === 'create' && (
            <motion.div
              key="payment-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className={cn(
                "border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group transition-all duration-500",
                paymentData.recordPayment ? "border-primary/30 hover:border-primary/50" : "hover:border-primary/20"
              )}>
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500",
                      paymentData.recordPayment ? "bg-primary/20" : "bg-primary/10"
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                      <IndianRupee className="h-6 w-6 text-primary relative z-10" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">
                        Record Payment
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-muted-foreground/70">
                        Record payment for this asset purchase
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={paymentData.recordPayment}
                    onCheckedChange={togglePaymentRecording}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-primary"
                  />
                </CardHeader>

                <AnimatePresence>
                  {paymentData.recordPayment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="px-6 py-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Payment Amount */}
                          <div className="space-y-2.5">
                            <Label htmlFor="paymentAmount" className="text-sm font-semibold tracking-tight text-foreground/80">
                              Payment Amount
                            </Label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                                {'\u20B9'}
                              </div>
                              <Input
                                id="paymentAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={paymentData.amount}
                                onChange={(e) => updatePaymentField('amount', parseFloat(e.target.value) || 0)}
                                disabled={isSubmitting}
                                className={cn(
                                  'h-12 pl-10 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-bold',
                                  errors.paymentAmount && 'border-destructive/50'
                                )}
                              />
                            </div>
                            {errors.paymentAmount && (
                              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                                <Info className="h-3 w-3" /> {errors.paymentAmount}
                              </motion.p>
                            )}
                          </div>

                          {/* Payment Method */}
                          <div className="space-y-2.5">
                            <Label htmlFor="paymentMethod" className="text-sm font-semibold tracking-tight text-foreground/80">
                              Payment Method
                            </Label>
                            <Select
                              value={paymentData.paymentMethod}
                              onValueChange={(value) => updatePaymentField('paymentMethod', value as PaymentMethod)}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger id="paymentMethod" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                                <SelectValue />
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

                          {/* Payment Date */}
                          <div className="space-y-2.5">
                            <Label htmlFor="paymentDate" className="text-sm font-semibold tracking-tight text-foreground/80">
                              Payment Date
                            </Label>
                            <DatePicker
                              id="paymentDate"
                              date={paymentData.paymentDate}
                              onDateChange={(date) => updatePaymentField('paymentDate', date)}
                              placeholder="Select payment date"
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* Payment Notes */}
                          <div className="space-y-2.5">
                            <Label htmlFor="paymentNotes" className="text-sm font-semibold tracking-tight text-foreground/80">
                              Notes (Optional)
                            </Label>
                            <Input
                              id="paymentNotes"
                              value={paymentData.notes}
                              onChange={(e) => updatePaymentField('notes', e.target.value)}
                              placeholder="e.g., Invoice #12345"
                              disabled={isSubmitting}
                              className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
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
                  <span className="tracking-tight uppercase text-xs">{mode === 'create' ? 'Creating...' : 'Updating...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="tracking-tight uppercase text-xs">{mode === 'create' ? 'Create Asset' : 'Save Changes'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}
