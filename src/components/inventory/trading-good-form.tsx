'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Package, Hash, Layers, AlertCircle, Save, ArrowLeft, TrendingUp, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditPreviewDialog } from '@/components/shared/entity/edit-preview-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCreateTradingGood, useUpdateTradingGood } from '@/lib/hooks/use-inventory-items';
import type { ITradingGood } from '@/types';

const UNITS = [
  'kg',
  'g',
  'L',
  'mL',
  'piece',
  'box',
  'bag',
  'meter',
  'feet',
  'inch',
  'ton',
  'dozen',
] as const;

interface TradingGoodFormProps {
  initialData?: ITradingGood;
  isEdit?: boolean;
}

export function TradingGoodForm({ initialData, isEdit = false }: TradingGoodFormProps) {
  const router = useRouter();


  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    unit: initialData?.unit || '',
    currentStock: initialData?.currentStock?.toString() || '0',
    reorderLevel: initialData?.reorderLevel?.toString() || '0',
    costPrice: initialData?.costPrice?.toString() || '0',
    sellingPrice: initialData?.sellingPrice?.toString() || '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [changes, setChanges] = useState<any[]>([]);

  const createMutation = useCreateTradingGood();
  const updateMutation = useUpdateTradingGood();

  // Calculate profit margin
  const costPrice = parseFloat(formData.costPrice) || 0;
  const sellingPrice = parseFloat(formData.sellingPrice) || 0;
  const profitMargin = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    const currentStock = parseFloat(formData.currentStock);
    if (isNaN(currentStock) || currentStock < 0) {
      newErrors.currentStock = 'Current stock must be a positive number';
    }

    const reorderLevel = parseFloat(formData.reorderLevel);
    if (isNaN(reorderLevel) || reorderLevel < 0) {
      newErrors.reorderLevel = 'Reorder level must be a positive number';
    }

    if (isNaN(costPrice) || costPrice < 0) {
      newErrors.costPrice = 'Cost price must be a positive number';
    }

    if (isNaN(sellingPrice) || sellingPrice < 0) {
      newErrors.sellingPrice = 'Selling price must be a positive number';
    }

    if (sellingPrice < costPrice) {
      newErrors.sellingPrice = 'Selling price should not be less than cost price';
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

    if (isEdit) {
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
      name: 'Product Name',
      sku: 'SKU',
      unit: 'Unit',
      currentStock: 'Current Stock',
      reorderLevel: 'Reorder Level',
      costPrice: 'Cost Price',
      sellingPrice: 'Selling Price'
    };

    const fieldTypes: Record<string, 'text' | 'price' | 'date' | 'status' | 'list'> = {
      costPrice: 'price',
      sellingPrice: 'price'
    };

    Object.keys(labels).forEach(key => {
      const oldValue = (initialData as any)?.[key]?.toString();
      const newValue = (formData as any)[key]?.toString();

      if (oldValue !== newValue && newValue !== undefined) {
        changes.push({
          field: key,
          label: labels[key],
          oldValue: oldValue || '0',
          newValue: newValue || '0',
          type: fieldTypes[key] || 'text'
        });
      }
    });

    return changes;
  };

  const actualSubmit = async () => {
    setIsPreviewOpen(false);
    const data = {
      name: formData.name.trim(),
      sku: formData.sku.trim() || undefined,
      unit: formData.unit,
      currentStock: parseFloat(formData.currentStock),
      reorderLevel: parseFloat(formData.reorderLevel),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
    };

    try {
      if (isEdit && initialData?._id) {
        await updateMutation.mutateAsync({
          id: initialData._id.toString(),
          data,
        });
        toast.success('Trading good updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Trading good created successfully');
      }
      router.push('/inventory/trading-goods');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save trading good');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Enter the basic details of the trading good
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                Product Name
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Laptop Stand, Office Chair"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`h-12 rounded-xl border-2 bg-background/50 shadow-inner transition-all focus:border-primary/50 focus:shadow-lg ${errors.name ? 'border-destructive' : ''
                  }`}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="flex items-center gap-2 text-sm font-medium">
                SKU (Optional)
              </Label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sku"
                  placeholder="e.g., LS-001, OC-100"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="h-12 rounded-xl border-2 bg-background/50 pl-10 shadow-inner transition-all focus:border-primary/50 focus:shadow-lg"
                />
              </div>
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="flex items-center gap-2 text-sm font-medium">
                Unit of Measurement
                <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                <SelectTrigger
                  className={`h-12 rounded-xl border-2 bg-background/50 shadow-inner transition-all focus:border-primary/50 focus:shadow-lg ${errors.unit ? 'border-destructive' : ''
                    }`}
                >
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.unit}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stock Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-success/5 via-card/50 to-card/30 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-success/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Stock Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage inventory levels and reorder points
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Stock */}
            <div className="space-y-2">
              <Label htmlFor="currentStock" className="flex items-center gap-2 text-sm font-medium">
                Current Stock
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentStock"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.currentStock}
                  onChange={(e) => handleChange('currentStock', e.target.value)}
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-10 shadow-inner transition-all focus:border-success/50 focus:shadow-lg ${errors.currentStock ? 'border-destructive' : ''
                    }`}
                />
              </div>
              {errors.currentStock && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currentStock}
                </p>
              )}
            </div>

            {/* Reorder Level */}
            <div className="space-y-2">
              <Label htmlFor="reorderLevel" className="flex items-center gap-2 text-sm font-medium">
                Reorder Level
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reorderLevel"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange('reorderLevel', e.target.value)}
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-10 shadow-inner transition-all focus:border-success/50 focus:shadow-lg ${errors.reorderLevel ? 'border-destructive' : ''
                    }`}
                />
              </div>
              {errors.reorderLevel && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.reorderLevel}
                </p>
              )}
            </div>
          </div>

          {/* Stock Warning */}
          {parseFloat(formData.currentStock) <= parseFloat(formData.reorderLevel) &&
            parseFloat(formData.currentStock) > 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-4 border border-warning/20">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
                <p className="text-sm text-warning">
                  Current stock is at or below the reorder level. Consider restocking soon.
                </p>
              </div>
            )}
        </div>
      </motion.div>

      {/* Pricing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-warning/5 via-card/50 to-card/30 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-warning/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pricing & Margin</h3>
              <p className="text-sm text-muted-foreground">
                Set cost and selling prices to calculate profit margin
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="costPrice" className="flex items-center gap-2 text-sm font-medium">
                Cost Price (₹)
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={(e) => handleChange('costPrice', e.target.value)}
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-8 shadow-inner transition-all focus:border-warning/50 focus:shadow-lg ${errors.costPrice ? 'border-destructive' : ''
                    }`}
                />
              </div>
              {errors.costPrice && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.costPrice}
                </p>
              )}
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="flex items-center gap-2 text-sm font-medium">
                Selling Price (₹)
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange('sellingPrice', e.target.value)}
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-8 shadow-inner transition-all focus:border-warning/50 focus:shadow-lg ${errors.sellingPrice ? 'border-destructive' : ''
                    }`}
                />
              </div>
              {errors.sellingPrice && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.sellingPrice}
                </p>
              )}
            </div>
          </div>

          {/* Profit Margin Display */}
          {costPrice > 0 && sellingPrice > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-card/50 p-4 border">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Profit Margin</span>
              </div>
              <Badge
                variant={profitMargin < 0 ? 'destructive' : profitMargin < 20 ? 'secondary' : 'default'}
                className="text-base px-4 py-1"
              >
                {profitMargin.toFixed(2)}%
              </Badge>
            </div>
          )}

          {/* Pricing Warning */}
          {sellingPrice > 0 && costPrice > 0 && sellingPrice < costPrice && (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                Selling price is less than cost price. This will result in a loss.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Form Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="sticky bottom-0 z-10 flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/80 p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <kbd className="rounded bg-muted px-2 py-1 text-xs font-mono">Ctrl</kbd>
          <span>+</span>
          <kbd className="rounded bg-muted px-2 py-1 text-xs font-mono">S</kbd>
          <span>to save</span>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2 min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEdit ? 'Update' : 'Create'}
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <EditPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        changes={changes}
        onConfirm={actualSubmit}
        isSubmitting={isLoading}
      />
    </form>
  );
}
