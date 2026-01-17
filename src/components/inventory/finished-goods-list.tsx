'use client';

import { useFinishedGoods, useDeleteFinishedGood } from '@/lib/hooks/use-inventory-items';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Barcode, PackageOpen, LayoutGrid, AlertCircle } from 'lucide-react';
import { EntityListSkeleton } from '@/components/shared/entity/entity-list-skeleton';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { IFinishedGood, IRawMaterial } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FinishedGoodsListProps {
  page: number;
  search: string;
  view: 'grid' | 'table';
}

export function FinishedGoodsList({ page, search, view }: FinishedGoodsListProps) {
  const router = useRouter();
  const limit = 10;

  const { data, isLoading, error, refetch } = useFinishedGoods({
    page,
    limit,
    search,
  });

  const deleteMutation = useDeleteFinishedGood();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    refetch();
  };

  if (isLoading) {
    return <EntityListSkeleton view={view} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load finished goods"
        description="An error occurred while loading finished goods. Please try again later."
      />
    );
  }

  const goods = data?.data || [];

  if (goods.length === 0) {
    const hasFilters = search;
    return (
      <EmptyState
        icon={LayoutGrid}
        title={hasFilters ? 'No goods found' : 'No finished goods yet'}
        description={
          hasFilters
            ? 'Try adjusting your search to find what you are looking for.'
            : 'Get started by adding your first finished good.'
        }
        action={
          !hasFilters
            ? {
              label: 'Add Finished Good',
              onClick: () => {
                router.push('/inventory/finished-goods/new');
              },
            }
            : undefined
        }
      />
    );
  }

  // Calculate production cost for each finished good
  const calculateProductionCost = (good: IFinishedGood) => {
    if (!good.bom || good.bom.length === 0) return 0;
    return good.bom.reduce((sum, item) => {
      const material = typeof item.rawMaterialId === 'object' && item.rawMaterialId !== null && '_id' in item.rawMaterialId ? item.rawMaterialId as IRawMaterial : null;
      return sum + (material?.costPrice || 0) * item.quantity;
    }, 0);
  };

  const columns = [
    {
      header: 'Name & SKU',
      accessorKey: 'name',
      cell: (good: IFinishedGood) => (
        <div className="flex flex-col">
          <span className="font-medium">{good.name}</span>
          {good.sku && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Barcode className="h-3 w-3" />
              <span>{good.sku}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'BOM',
      cell: (good: IFinishedGood) => (
        <Badge variant="outline" className="gap-1 h-5 text-[10px]">
          <PackageOpen className="h-3 w-3" />
          {good.bom?.length || 0} items
        </Badge>
      ),
    },
    {
      header: 'Stock',
      accessorKey: 'currentStock',
      cell: (good: IFinishedGood) => (
        <span className="font-medium">{good.currentStock.toFixed(2)}</span>
      ),
    },
    {
      header: 'Pricing',
      cell: (good: IFinishedGood) => {
        const prodCost = calculateProductionCost(good);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">₹{good.sellingPrice.toFixed(2)}</span>
            <span className="text-[10px] text-muted-foreground">Cost: ₹{prodCost.toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      header: 'Margin',
      cell: (good: IFinishedGood) => {
        const prodCost = calculateProductionCost(good);
        const profitMargin = prodCost > 0
          ? ((good.sellingPrice - prodCost) / prodCost) * 100
          : 0;
        return (
          <Badge
            variant={profitMargin < 0 ? 'destructive' : profitMargin < 20 ? 'secondary' : 'default'}
            className="gap-1 h-5 text-[10px]"
          >
            {profitMargin >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {profitMargin.toFixed(1)}%
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <EntityListContainer<IFinishedGood>
        entities={goods}
        entityType="finished-good"
        basePath="/inventory/finished-goods"
        onDelete={handleDelete}
        initialView={view}
        columns={columns}
        renderCardContent={(good) => {
          const isLowStock = good.currentStock <= good.reorderLevel;
          const prodCost = calculateProductionCost(good);
          const profitMargin = prodCost > 0
            ? ((good.sellingPrice - prodCost) / prodCost) * 100
            : 0;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <PackageOpen className="h-3 w-3" />
                  {good.bom?.length || 0}
                </Badge>
                <Badge
                  variant={profitMargin < 0 ? 'destructive' : profitMargin < 20 ? 'secondary' : 'default'}
                  className="gap-1 h-5 text-[10px]"
                >
                  {profitMargin.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate">{good.name}</span>
                {good.sku && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Barcode className="h-3 w-3" /> {good.sku}
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between border-t border-border/5 pt-2">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Stock</span>
                  <span className={cn("text-lg font-black", isLowStock && "text-destructive")}>
                    {good.currentStock.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Price</span>
                  <span className="font-bold text-success">₹{good.sellingPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
