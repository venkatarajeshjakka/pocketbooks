'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, Plus, Edit, Trash2, Search, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Barcode, PackageOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useFinishedGoods, useDeleteFinishedGood } from '@/lib/hooks/use-inventory-items';
import type { IFinishedGood, IRawMaterial } from '@/types';

export function FinishedGoodsList() {
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const limit = 10;
  const { data, isLoading, error } = useFinishedGoods({
    page,
    limit,
    search,
  });

  const deleteMutation = useDeleteFinishedGood();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Finished good deleted successfully');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete finished good');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-destructive/10 p-8 border border-destructive/20">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">Failed to load finished goods. Please try again.</p>
      </div>
    );
  }

  const goods = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // Calculate production cost for each finished good
  const calculateProductionCost = (good: IFinishedGood) => {
    if (!good.bom || good.bom.length === 0) return 0;
    return good.bom.reduce((sum, item) => {
      const material = typeof item.rawMaterialId === 'object' && item.rawMaterialId !== null && '_id' in item.rawMaterialId ? item.rawMaterialId as IRawMaterial : null;
      return sum + (material?.costPrice || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finished Goods</h2>
          <p className="text-muted-foreground mt-1">
            Manage manufactured products with bill of materials
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/inventory/finished-goods/new">
            <Plus className="h-4 w-4" />
            Add Finished Good
          </Link>
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10 h-12"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : goods.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Finished Goods Found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {search ? 'Try adjusting your search terms' : 'Get started by adding your first finished good'}
            </p>
            {!search && (
              <Button asChild>
                <Link href="/inventory/finished-goods/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Finished Good
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-center">BOM Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goods.map((good: IFinishedGood, index: number) => {
                  const isLowStock = good.currentStock <= good.reorderLevel;
                  const productionCost = calculateProductionCost(good);
                  const profitMargin = productionCost > 0
                    ? ((good.sellingPrice - productionCost) / productionCost) * 100
                    : 0;

                  return (
                    <motion.tr
                      key={good._id.toString()}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group"
                    >
                      <TableCell>
                        <Link
                          href={`/inventory/finished-goods/${good._id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {good.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {good.sku ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Barcode className="h-3 w-3" />
                            <span className="text-xs font-mono">{good.sku}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{good.unit}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {good.currentStock.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₹{productionCost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{good.sellingPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={profitMargin < 0 ? 'destructive' : profitMargin < 20 ? 'secondary' : 'default'}
                          className="gap-1"
                        >
                          {profitMargin >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {profitMargin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="gap-1">
                          <PackageOpen className="h-3 w-3" />
                          {good.bom?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="destructive" className="gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-success text-success-foreground">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Link href={`/inventory/finished-goods/${good._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(good._id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t p-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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
  );
}
