
/**
 * Sales Page
 */
import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';
import { SaleList } from '@/components/sales/sale-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    view?: 'grid' | 'table';
  }>;
}

export const metadata = {
  title: 'Sales | PocketBooks',
  description: 'Manage sales transactions and invoices',
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const status = params?.status || '';
  const view = params?.view || 'grid';

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/20 backdrop-blur-md shadow-lg shadow-primary/5">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
              Sales
            </h1>
            <p className="text-sm font-medium text-muted-foreground/60">
              Track revenue, invoices, and payments
            </p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard can be added here */}

      {/* Search, Filters, and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <EntitySearchFilterBar
          entityType="sale"
          addNewPath="/sales/new"
          addNewLabel="New Sale"
          searchPlaceholder="Search sales by invoice or client..."
          showOutstandingFilter={false}
        />
      </div>

      {/* Sales List */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        <SaleList
          page={page}
          search={search}
          status={status}
          view={view}
        />
      </Suspense>
    </div>
  );
}
