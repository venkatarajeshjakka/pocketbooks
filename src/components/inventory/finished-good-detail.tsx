'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Edit, Trash2, Package, Layers, AlertCircle,
  TrendingDown, Loader2, TrendingUp, Barcode, PackageOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useFinishedGood, useDeleteFinishedGood } from '@/lib/hooks/use-inventory-items';
import type { IRawMaterial } from '@/types';

interface FinishedGoodDetailProps {
  id: string;
}

export function FinishedGoodDetail({ id }: FinishedGoodDetailProps) {
  const router = useRouter();
  
  const { data: good, isLoading, error } = useFinishedGood(id);
  const deleteMutation = useDeleteFinishedGood();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Finished good deleted successfully');
      router.push('/inventory/finished-goods');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete finished good');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !good) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-destructive/10 p-8 border border-destructive/20">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">Failed to load finished good. Please try again.</p>
      </div>
    );
  }

  const isLowStock = good.currentStock <= good.reorderLevel;

  // Calculate production cost from BOM
  const productionCost = good.bom?.reduce((sum, item) => {
    const material = typeof item.rawMaterialId === 'object' && item.rawMaterialId !== null && '_id' in item.rawMaterialId ? item.rawMaterialId as IRawMaterial : null;
    return sum + (material?.costPrice || 0) * item.quantity;
  }, 0) || 0;

  const profitMargin = productionCost > 0
    ? ((good.sellingPrice - productionCost) / productionCost) * 100
    : 0;
  const profitPerUnit = good.sellingPrice - productionCost;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/inventory/finished-goods"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground mb-6"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Finished Goods
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{good.name}</h1>
            {good.sku && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Barcode className="h-4 w-4" />
                <span className="font-mono text-sm">{good.sku}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/inventory/finished-goods/${id}/edit`}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the finished good from your inventory.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>

      {/* Stock Warning */}
      {isLowStock && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 border border-destructive/20"
        >
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            <strong>Low Stock Alert:</strong> Current stock is at or below the reorder level. Consider producing more units.
          </p>
        </motion.div>
      )}

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Product Name</p>
              <p className="text-lg font-semibold">{good.name}</p>
            </div>
            {good.sku && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">SKU</p>
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-mono">{good.sku}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unit of Measurement</p>
              <Badge variant="outline" className="text-base px-3 py-1">{good.unit}</Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bill of Materials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/5 via-card/50 to-card/30 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <PackageOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bill of Materials</h3>
              <p className="text-sm text-muted-foreground">
                {good.bom?.length || 0} raw material{(good.bom?.length || 0) !== 1 ? 's' : ''} required
              </p>
            </div>
          </div>

          {good.bom && good.bom.length > 0 ? (
            <>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Raw Material</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {good.bom.map((item, index) => {
                      const material = typeof item.rawMaterialId === 'object' && item.rawMaterialId !== null && '_id' in item.rawMaterialId ? item.rawMaterialId as IRawMaterial : null;
                      const itemCost = (material?.costPrice || 0) * item.quantity;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{material?.name || 'Unknown Material'}</p>
                              {material?.unit && (
                                <p className="text-xs text-muted-foreground">Unit: {material.unit}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.quantity.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            ₹{(material?.costPrice || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{itemCost.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm font-semibold">Total Production Cost per Unit</span>
                <span className="text-xl font-bold">₹{productionCost.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No bill of materials defined</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stock Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-success/5 via-card/50 to-card/30 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-success/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Stock & Pricing</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{good.currentStock.toFixed(2)}</p>
                <span className="text-sm text-muted-foreground">{good.unit}</span>
              </div>
              {isLowStock && (
                <Badge variant="destructive" className="gap-1 mt-2">
                  <TrendingDown className="h-3 w-3" />
                  Low Stock
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Reorder Level</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{good.reorderLevel.toFixed(2)}</p>
                <span className="text-sm text-muted-foreground">{good.unit}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Production Cost</p>
              <p className="text-2xl font-bold">₹{productionCost.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">per unit</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Selling Price</p>
              <p className="text-2xl font-bold">₹{good.sellingPrice.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">per unit</p>
            </div>
          </div>

          {/* Profit Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg bg-card/50 p-4 border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit Margin</p>
                <Badge
                  variant={profitMargin < 0 ? 'destructive' : profitMargin < 20 ? 'secondary' : 'default'}
                  className="text-base px-3 py-1"
                >
                  {profitMargin.toFixed(2)}%
                </Badge>
              </div>
              {profitMargin >= 0 ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-card/50 p-4 border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit per Unit</p>
                <p className="text-base font-bold">₹{profitPerUnit.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-card/50 p-4 border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Inventory Value</p>
                <p className="text-base font-bold">
                  ₹{(good.currentStock * good.sellingPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
