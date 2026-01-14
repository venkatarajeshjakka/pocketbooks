'use client';

import { useRawMaterials, useDeleteRawMaterial } from '@/lib/hooks/use-inventory-items';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Package, AlertCircle } from 'lucide-react';
import { EntityListSkeleton } from '@/components/shared/entity/entity-list-skeleton';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { IRawMaterial } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface RawMaterialsListProps {
  page: number;
  search: string;
  view: 'grid' | 'table';
}

export function RawMaterialsList({ page, search, view }: RawMaterialsListProps) {
  const router = useRouter();
  const limit = 10;

  const { data, isLoading, error, refetch } = useRawMaterials({
    page,
    limit,
    search,
  });

  const deleteMutation = useDeleteRawMaterial();

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
        title="Failed to load raw materials"
        description="An error occurred while loading raw materials. Please try again later."
      />
    );
  }

  const materials = data?.data || [];

  if (materials.length === 0) {
    const hasFilters = search;
    return (
      <EmptyState
        icon={Package}
        title={hasFilters ? 'No materials found' : 'No raw materials yet'}
        description={
          hasFilters
            ? 'Try adjusting your search to find what you are looking for.'
            : 'Get started by adding your first raw material.'
        }
        action={
          !hasFilters
            ? {
              label: 'Add Raw Material',
              onClick: () => {
                router.push('/inventory/raw-materials/new');
              },
            }
            : undefined
        }
      />
    );
  }

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (material: IRawMaterial) => (
        <div className="flex flex-col">
          <span className="font-medium">{material.name}</span>
          {material.intendedFor && (
            <span className="text-[10px] text-muted-foreground">{material.intendedFor}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Unit',
      accessorKey: 'unit',
      cell: (material: IRawMaterial) => (
        <Badge variant="outline">{material.unit}</Badge>
      ),
    },
    {
      header: 'Current Stock',
      accessorKey: 'currentStock',
      cell: (material: IRawMaterial) => (
        <span className="font-medium">{material.currentStock.toFixed(2)}</span>
      ),
    },
    {
      header: 'Cost Price',
      accessorKey: 'costPrice',
      cell: (material: IRawMaterial) => (
        <span className="font-medium">₹{material.costPrice.toFixed(2)}</span>
      ),
    },
    {
      header: 'Status',
      cell: (material: IRawMaterial) => {
        const isLowStock = material.currentStock <= material.reorderLevel;
        return isLowStock ? (
          <Badge variant="destructive" className="gap-1 h-5 text-[10px]">
            <TrendingDown className="h-3 w-3" />
            Low Stock
          </Badge>
        ) : (
          <Badge variant="default" className="bg-success text-success-foreground h-5 text-[10px]">
            In Stock
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <EntityListContainer<IRawMaterial>
        entities={materials}
        entityType="raw-material"
        basePath="/inventory/raw-materials"
        onDelete={handleDelete}
        initialView={view}
        columns={columns}
        renderCardContent={(material) => {
          const isLowStock = material.currentStock <= material.reorderLevel;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{material.unit}</Badge>
                {isLowStock ? (
                  <Badge variant="destructive" className="gap-1 h-5 text-[10px]">
                    <TrendingDown className="h-3 w-3" />
                    Low
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-success text-success-foreground h-5 text-[10px]">
                    Good
                  </Badge>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate">{material.name}</span>
                <span className="text-[10px] text-muted-foreground">{material.intendedFor}</span>
              </div>
              <div className="flex items-end justify-between border-t border-border/5 pt-2">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Stock</span>
                  <span className="text-lg font-black">{material.currentStock.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Cost</span>
                  <span className="font-bold text-primary">₹{material.costPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
