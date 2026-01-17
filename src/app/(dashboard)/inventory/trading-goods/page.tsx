import { ShoppingBag } from 'lucide-react';
import { TradingGoodsList } from '@/components/inventory/trading-goods-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    view?: 'grid' | 'table';
  }>;
}

export default async function TradingGoodsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const view = params?.view || 'table';

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 md:px-10 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trading Goods</h1>
            <p className="text-sm text-muted-foreground">
              Manage your trading goods inventory and profit margins
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 space-y-6">
        {/* Search and Filters Bar */}
        <EntitySearchFilterBar
          entityType="trading-good"
          addNewPath="/inventory/trading-goods/new"
          addNewLabel="Add Trading Good"
          searchPlaceholder="Search goods by name, SKU, or category..."
          showStatusFilter={false}
          showOutstandingFilter={false}
        />

        <TradingGoodsList
          page={page}
          search={search}
          view={view}
        />
      </div>
    </div>
  );
}
