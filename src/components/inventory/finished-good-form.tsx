'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, Package, Hash, Layers, AlertCircle, Save, ArrowLeft,
  TrendingUp, Barcode, Plus, Trash2, PackageOpen
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCreateFinishedGood, useUpdateFinishedGood } from '@/lib/hooks/use-inventory-items';
import { useRawMaterials } from '@/lib/hooks/use-inventory-items';
import type { IFinishedGood } from '@/types';

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

interface BOMItem {
  rawMaterialId: string;
  quantity: number;
  _id?: string;
}

interface FinishedGoodFormProps {
  initialData?: IFinishedGood;
  isEdit?: boolean;
}

export function FinishedGoodForm({ initialData, isEdit = false }: FinishedGoodFormProps) {
  const router = useRouter();
  

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    unit: initialData?.unit || '',
    currentStock: initialData?.currentStock?.toString() || '0',
    reorderLevel: initialData?.reorderLevel?.toString() || '0',
    sellingPrice: initialData?.sellingPrice?.toString() || '0',
  });

  const [bom, setBom] = useState<BOMItem[]>(
    initialData?.bom?.map((item: any) => ({
      rawMaterialId: typeof item.rawMaterialId === 'string' ? item.rawMaterialId : item.rawMaterialId?._id,
      quantity: item.quantity,
      _id: item._id,
    })) || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch raw materials for BOM dropdown
  const { data: rawMaterialsData, isLoading: rawMaterialsLoading } = useRawMaterials({
    page: 1,
    limit: 1000,
  });

  const createMutation = useCreateFinishedGood();
  const updateMutation = useUpdateFinishedGood();

  // Calculate total cost from BOM
  const totalCost = bom.reduce((sum, item) => {
    const material = rawMaterialsData?.data?.find((m: any) => m._id === item.rawMaterialId);
    return sum + (material?.costPrice || 0) * item.quantity;
  }, 0);

  const sellingPrice = parseFloat(formData.sellingPrice) || 0;
  const profitMargin = totalCost > 0 ? ((sellingPrice - totalCost) / totalCost) * 100 : 0;

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

    if (isNaN(sellingPrice) || sellingPrice < 0) {
      newErrors.sellingPrice = 'Selling price must be a positive number';
    }

    if (bom.length === 0) {
      newErrors.bom = 'At least one raw material is required';
    }

    // Validate BOM items
    bom.forEach((item, index) => {
      if (!item.rawMaterialId) {
        newErrors[`bom_${index}_material`] = 'Material is required';
      }
      if (item.quantity <= 0) {
        newErrors[`bom_${index}_quantity`] = 'Quantity must be positive';
      }
    });

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
      sku: formData.sku.trim() || undefined,
      unit: formData.unit,
      currentStock: parseFloat(formData.currentStock),
      reorderLevel: parseFloat(formData.reorderLevel),
      sellingPrice: parseFloat(formData.sellingPrice),
      bom: bom.map((item) => ({
        rawMaterialId: item.rawMaterialId,
        quantity: item.quantity,
      })),
    };

    try {
      if (isEdit && initialData?._id) {
        await updateMutation.mutateAsync({
          id: initialData._id.toString(),
          data,
        });
        toast.success('Finished good updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Finished good created successfully');
      }
      router.push('/inventory/finished-goods');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save finished good');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addBOMItem = () => {
    setBom([...bom, { rawMaterialId: '', quantity: 0 }]);
  };

  const removeBOMItem = (index: number) => {
    setBom(bom.filter((_, i) => i !== index));
  };

  const updateBOMItem = (index: number, field: keyof BOMItem, value: string | number) => {
    const newBom = [...bom];
    newBom[index] = { ...newBom[index], [field]: value };
    setBom(newBom);

    // Clear errors for this BOM item
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`bom_${index}_material`];
      delete newErrors[`bom_${index}_quantity`];
      delete newErrors.bom;
      return newErrors;
    });
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
                Enter the basic details of the finished good
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
                placeholder="e.g., Custom Cabinet, Finished T-Shirt"
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

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="flex items-center gap-2 text-sm font-medium">
                SKU (Optional)
              </Label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sku"
                  placeholder="e.g., FG-001, CAB-100"
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
        </div>
      </motion.div>

      {/* Bill of Materials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/5 via-card/50 to-card/30 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <PackageOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Bill of Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Define raw materials needed to produce this finished good
                </p>
              </div>
            </div>
            <Button type="button" onClick={addBOMItem} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </div>

          {errors.bom && (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.bom}</p>
            </div>
          )}

          {bom.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                No raw materials added yet. Click "Add Material" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bom.map((item, index) => {
                const material = rawMaterialsData?.data?.find((m: any) => m._id === item.rawMaterialId);
                const itemCost = (material?.costPrice || 0) * item.quantity;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border"
                  >
                    <div className="flex-1 grid gap-4 md:grid-cols-3">
                      {/* Material Selection */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">
                          Raw Material
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select
                          value={item.rawMaterialId}
                          onValueChange={(value) => updateBOMItem(index, 'rawMaterialId', value)}
                        >
                          <SelectTrigger
                            className={`h-10 ${
                              errors[`bom_${index}_material`] ? 'border-destructive' : ''
                            }`}
                          >
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterialsLoading ? (
                              <div className="p-4 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              </div>
                            ) : !rawMaterialsData?.data || rawMaterialsData.data.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                No raw materials available
                              </div>
                            ) : (
                              rawMaterialsData.data.map((material: any) => (
                                <SelectItem key={material._id} value={material._id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{material.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ₹{material.costPrice}/{material.unit}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {errors[`bom_${index}_material`] && (
                          <p className="text-xs text-destructive">{errors[`bom_${index}_material`]}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">
                          Quantity
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.quantity || ''}
                          onChange={(e) => updateBOMItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className={`h-10 ${errors[`bom_${index}_quantity`] ? 'border-destructive' : ''}`}
                        />
                        {errors[`bom_${index}_quantity`] && (
                          <p className="text-xs text-destructive">{errors[`bom_${index}_quantity`]}</p>
                        )}
                      </div>

                      {/* Cost Display */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Cost</Label>
                        <div className="h-10 flex items-center justify-between px-3 rounded-md bg-muted">
                          <span className="text-sm font-medium">₹{itemCost.toFixed(2)}</span>
                          {material && (
                            <span className="text-xs text-muted-foreground">{material.unit}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBOMItem(index)}
                      className="mt-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                );
              })}

              {/* Total Cost Display */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm font-semibold">Total Production Cost</span>
                <span className="text-lg font-bold">₹{totalCost.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stock & Pricing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
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
                Manage stock levels and selling price
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
                  className={`h-12 rounded-xl border-2 bg-background/50 pl-8 shadow-inner transition-all focus:border-success/50 focus:shadow-lg ${
                    errors.sellingPrice ? 'border-destructive' : ''
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
          {totalCost > 0 && sellingPrice > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
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

              <div className="flex items-center justify-between rounded-lg bg-card/50 p-4 border">
                <span className="text-sm font-medium">Profit per Unit</span>
                <span className="text-base font-bold">₹{(sellingPrice - totalCost).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Pricing Warning */}
          {sellingPrice > 0 && totalCost > 0 && sellingPrice < totalCost && (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                Selling price is less than production cost. This will result in a loss.
              </p>
            </div>
          )}

          {/* Stock Warning */}
          {parseFloat(formData.currentStock) <= parseFloat(formData.reorderLevel) &&
            parseFloat(formData.currentStock) > 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-4 border border-warning/20">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
                <p className="text-sm text-warning">
                  Current stock is at or below the reorder level. Consider producing more units.
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
    </form>
  );
}
