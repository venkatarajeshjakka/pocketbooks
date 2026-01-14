'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Package, Hash, Layers, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCreateRawMaterial, useUpdateRawMaterial } from '@/lib/hooks/use-inventory-items';
import type { IRawMaterial } from '@/types';

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

interface RawMaterialFormProps {
  initialData?: IRawMaterial;
  isEdit?: boolean;
}

export function RawMaterialForm({ initialData, isEdit = false }: RawMaterialFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    unit: initialData?.unit || '',
    currentStock: initialData?.currentStock?.toString() || '0',
    reorderLevel: initialData?.reorderLevel?.toString() || '0',
    costPrice: initialData?.costPrice?.toString() || '0',
    intendedFor: initialData?.intendedFor || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateRawMaterial();
  const updateMutation = useUpdateRawMaterial();

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

    const costPrice = parseFloat(formData.costPrice);
    if (isNaN(costPrice) || costPrice < 0) {
      newErrors.costPrice = 'Cost price must be a positive number';
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

    const data = {
      name: formData.name.trim(),
      unit: formData.unit,
      currentStock: parseFloat(formData.currentStock),
      reorderLevel: parseFloat(formData.reorderLevel),
      costPrice: parseFloat(formData.costPrice),
      intendedFor: formData.intendedFor.trim() || undefined,
    };

    try {
      if (isEdit && initialData?._id) {
        await updateMutation.mutateAsync({
          id: initialData._id,
          data,
        });
        toast.success('Raw material updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Raw material created successfully');
      }
      router.push('/inventory/raw-materials');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save raw material');
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
                Enter the basic details of the raw material
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                Material Name
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Cotton Fabric, Steel Rod"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`h-12 rounded-xl border-2 bg-background/50 shadow-inner transition-all focus:border-primary/50 focus:shadow-lg ${
                  errors.name ? 'border-destructive' : ''
                }`}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="flex items-center gap-2 text-sm font-medium">
                Unit of Measurement
                <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                <SelectTrigger
                  className={`h-12 rounded-xl border-2 bg-background/50 shadow-inner transition-all focus:border-primary/50 focus:shadow-lg ${
                    errors.unit ? 'border-destructive' : ''
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

          {/* Intended For */}
          <div className="space-y-2">
            <Label htmlFor="intendedFor" className="text-sm font-medium">
              Intended For (Optional)
            </Label>
            <Textarea
              id="intendedFor"
              placeholder="e.g., Used in production of Product A"
              value={formData.intendedFor}
              onChange={(e) => handleChange('intendedFor', e.target.value)}
              className="min-h-[80px] rounded-xl border-2 bg-background/50 shadow-inner transition-all focus:border-primary/50 focus:shadow-lg"
            />
          </div>
        </div>
      </motion.div>

      {/* Stock & Pricing Section */}
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
              <h3 className="text-lg font-semibold">Stock & Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Manage stock levels and pricing information
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
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
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-10 shadow-inner transition-all focus:border-success/50 focus:shadow-lg ${
                    errors.currentStock ? 'border-destructive' : ''
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
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-10 shadow-inner transition-all focus:border-success/50 focus:shadow-lg ${
                    errors.reorderLevel ? 'border-destructive' : ''
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
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-8 shadow-inner transition-all focus:border-success/50 focus:shadow-lg ${
                    errors.costPrice ? 'border-destructive' : ''
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

      {/* Form Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
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
    </form>
  );
}
