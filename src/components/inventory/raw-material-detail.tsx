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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, ShoppingCart, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-12">
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
              <p className="text-muted-foreground/80 font-medium">{material.intendedFor}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="lg" className="h-12 gap-2 rounded-xl border-border/40 hover:bg-accent/50">
              <Link href={`/inventory/raw-materials/${id}/edit`}>
                <Edit className="h-4 w-4 text-primary" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="lg" className="h-12 gap-2 rounded-xl text-destructive border-border/40 hover:bg-destructive/10 hover:border-destructive/30">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground/80">
                    This action cannot be undone. This will permanently delete the raw material from your inventory.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="h-11 rounded-xl border-border/40">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
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

      {/* Main Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-14 p-1.5 bg-muted/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-inner mb-8 px-1.5 gap-1.5 w-full sm:w-auto">
          <TabsTrigger
            value="overview"
            className="h-full px-8 rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2"
          >
            <Layers className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="procurement"
            className="h-full px-8 rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Procurement
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="h-full px-8 rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Sales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 ring-offset-background focus-visible:outline-none space-y-8">
          {/* Stock Warning */}
          {isLowStock && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 rounded-2xl bg-destructive/10 p-5 border border-destructive/20 shadow-lg shadow-destructive/5"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-destructive/20 text-destructive shadow-inner">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-destructive">Low Stock Alert</p>
                <p className="text-sm text-destructive/80 font-medium leading-relaxed">
                  Current stock is at or below the reorder level. Consider restocking soon.
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 p-10 backdrop-blur-xl shadow-xl"
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
              <div className="relative space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b border-border/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Basic Information</h3>
                    <p className="text-sm text-muted-foreground/70">Material details & usage</p>
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 font-mono">Material Name</p>
                    <p className="text-xl font-black text-foreground">{material.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 font-mono">UoM</p>
                    <Badge variant="outline" className="text-sm px-4 py-1.5 font-bold rounded-lg border-primary/20 bg-primary/5 text-primary">
                      {material.unit}
                    </Badge>
                  </div>
                  {material.intendedFor && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 font-mono">Intended For</p>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                        <p className="text-sm font-medium leading-relaxed">{material.intendedFor}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stock & Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 p-10 backdrop-blur-xl shadow-xl"
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-success/5 blur-3xl opacity-50" />
              <div className="relative space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b border-border/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success shadow-inner">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Stock & Pricing</h3>
                    <p className="text-sm text-muted-foreground/70">Inventory availability & costs</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="relative p-6 rounded-2xl bg-background border border-border/60 shadow-md group relative hover:shadow-lg transition-all overflow-hidden h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Package className="h-10 w-10 rotate-12" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 font-mono">Stock Level</p>
                      <p className="text-4xl font-black text-foreground tracking-tight">{material.currentStock.toLocaleString()}</p>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-gray-500/10 uppercase">
                        {material.unit}
                      </span>
                    </div>
                    {isLowStock && (
                      <Badge variant="destructive" className="absolute top-3 right-3 gap-1 px-3 py-1 shadow-lg shadow-destructive/20 animate-pulse">
                        <TrendingDown className="h-3 w-3" />
                        Low
                      </Badge>
                    )}
                  </div>
                  <div className="relative p-6 rounded-2xl bg-background border border-border/60 shadow-md group hover:shadow-lg transition-all h-full flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 font-mono">Reorder Point</p>
                      <p className="text-4xl font-black text-foreground/80 tracking-tight">{material.reorderLevel.toLocaleString()}</p>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-gray-500/10 uppercase">
                        {material.unit}
                      </span>
                    </div>
                  </div>
                  <div className="relative p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-inner group sm:col-span-2">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3 font-mono">Purchasing Cost</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1 text-primary">
                        <span className="text-2xl font-bold opacity-40">₹</span>
                        <p className="text-4xl font-black tracking-tighter">{material.costPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <span className="text-xs font-bold text-muted-foreground/60 ml-2">/ {material.unit}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Total Value</p>
                        <p className="text-xl font-bold text-foreground/80">
                          ₹{(material.currentStock * material.costPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="procurement" className="mt-0 ring-offset-background focus-visible:outline-none">
          <ProcurementHistory itemId={id} type="raw_material" />
        </TabsContent>

        <TabsContent value="sales" className="mt-0 ring-offset-background focus-visible:outline-none">
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5 opacity-60">
            <div className="h-16 w-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-5">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h4 className="text-xl font-bold text-foreground/70">Sales History Coming Soon</h4>
            <p className="text-sm text-muted-foreground mt-2 max-w-[300px] text-center leading-relaxed font-medium">
              Raw material sales tracking is currently being optimized. This section will display any direct sales of this material in the future.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
