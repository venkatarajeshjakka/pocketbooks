'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Edit, Trash2, Package, Hash, Layers, AlertCircle,
  TrendingDown, Loader2
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
import { toast } from 'sonner';
import { useRawMaterial, useDeleteRawMaterial } from '@/lib/hooks/use-inventory-items';
import { ProcurementHistory } from '@/components/inventory/procurement-history';

interface RawMaterialDetailProps {
  id: string;
}

export function RawMaterialDetail({ id }: RawMaterialDetailProps) {
  const router = useRouter();

  const { data: material, isLoading, error } = useRawMaterial(id);
  const deleteMutation = useDeleteRawMaterial();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Raw material deleted successfully');
      router.push('/inventory/raw-materials');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete raw material');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-destructive/10 p-8 border border-destructive/20">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">Failed to load raw material. Please try again.</p>
      </div>
    );
  }

  const isLowStock = material.currentStock <= material.reorderLevel;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/inventory/raw-materials"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground mb-6"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Raw Materials
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{material.name}</h1>
            {material.intendedFor && (
              <p className="text-muted-foreground">{material.intendedFor}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/inventory/raw-materials/${id}/edit`}>
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
                    This action cannot be undone. This will permanently delete the raw material from your inventory.
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
            <strong>Low Stock Alert:</strong> Current stock is at or below the reorder level. Consider restocking soon.
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
              <p className="text-sm text-muted-foreground mb-1">Material Name</p>
              <p className="text-lg font-semibold">{material.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unit of Measurement</p>
              <Badge variant="outline" className="text-base px-3 py-1">{material.unit}</Badge>
            </div>
            {material.intendedFor && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Intended For</p>
                <p className="text-base">{material.intendedFor}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stock Information */}
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
            <h3 className="text-lg font-semibold">Stock & Pricing</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{material.currentStock.toFixed(2)}</p>
                <span className="text-sm text-muted-foreground">{material.unit}</span>
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
                <p className="text-2xl font-bold">{material.reorderLevel.toFixed(2)}</p>
                <span className="text-sm text-muted-foreground">{material.unit}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Cost Price</p>
              <p className="text-2xl font-bold">₹{material.costPrice.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">per {material.unit}</p>
            </div>
          </div>

          {/* Total Value */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border">
            <span className="text-sm font-medium">Total Inventory Value</span>
            <span className="text-lg font-bold">
              ₹{(material.currentStock * material.costPrice).toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Procurement History */}
      <ProcurementHistory itemId={id} type="raw_material" />
    </div>
  );
}
