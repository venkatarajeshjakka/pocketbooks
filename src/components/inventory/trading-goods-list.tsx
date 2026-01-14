'use client';

import { useTradingGoods, useDeleteTradingGood } from '@/lib/hooks/use-inventory-items';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Barcode, ShoppingBag, AlertCircle } from 'lucide-react';
import { EntityListSkeleton } from '@/components/shared/entity/entity-list-skeleton';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { ITradingGood } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface TradingGoodsListProps {
  page: number;
  search: string;
  view: 'grid' | 'table';
}

export function TradingGoodsList({ page, search, view }: TradingGoodsListProps) {
  const router = useRouter();
  const limit = 10;

  const { data, isLoading, error, refetch } = useTradingGoods({
    page,
    limit,
    search,
  });

  const deleteMutation = useDeleteTradingGood();

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
        title="Failed to load trading goods"
        description="An error occurred while loading trading goods. Please try again later."
      />
    );
  }

  const goods = data?.data || [];

  if (goods.length === 0) {
    const hasFilters = search;
    return (
      <EmptyState
        icon={ShoppingBag}
        title={hasFilters ? 'No goods found' : 'No trading goods yet'}
        description={
          hasFilters
            ? 'Try adjusting your search to find what you are looking for.'
            : 'Get started by adding your first trading good.'
        }
        action={
          !hasFilters
            ? {
              label: 'Add Trading Good',
              onClick: () => {
                router.push('/inventory/trading-goods/new');
              },
            }
            : undefined
        }
      />
    );
  }

  const columns = [
    {
      header: 'Name & SKU',
      accessorKey: 'name',
      cell: (good: ITradingGood) => (
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
      header: 'Unit',
      accessorKey: 'unit',
      cell: (good: ITradingGood) => (
        <Badge variant="outline">{good.unit}</Badge>
      ),
    },
    {
      header: 'Stock',
      accessorKey: 'currentStock',
      cell: (good: ITradingGood) => (
        <span className="font-medium">{good.currentStock.toFixed(2)}</span>
      ),
    },
    {
      header: 'Pricing',
      cell: (good: ITradingGood) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">₹{good.sellingPrice.toFixed(2)}</span>
          <span className="text-[10px] text-muted-foreground">Cost: ₹{good.costPrice.toFixed(2)}</span>
        </div>
      ),
    },
    {
      header: 'Margin',
      cell: (good: ITradingGood) => {
        const profitMargin = good.costPrice > 0
          ? ((good.sellingPrice - good.costPrice) / good.costPrice) * 100
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
      <EntityListContainer<ITradingGood>
        entities={goods}
        entityType="trading-good"
        basePath="/inventory/trading-goods"
        onDelete={handleDelete}
        initialView={view}
        columns={columns}
        renderCardContent={(good) => {
          const isLowStock = good.currentStock <= good.reorderLevel;
          const profitMargin = good.costPrice > 0
            ? ((good.sellingPrice - good.costPrice) / good.costPrice) * 100
            : 0;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{good.unit}</Badge>
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
