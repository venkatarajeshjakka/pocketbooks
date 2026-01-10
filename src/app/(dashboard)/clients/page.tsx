/**
 * Clients Page - Redesigned with Caching
 * Modern UI with stats dashboard, advanced search/filters, and React Query caching
 */

import { Suspense } from 'react';
import { Users } from 'lucide-react';
import { ClientStatsDashboard } from '@/components/clients/stats/client-stats-dashboard';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { ClientListWithCache } from '@/components/clients/list/client-list-with-cache';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    hasOutstanding?: string;
    view?: 'grid' | 'table';
  }>;
}

export const metadata = {
  title: 'Clients | PocketBooks',
  description: 'Manage your clients and customer relationships',
};


export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const status = params?.status || '';
  const hasOutstanding = params?.hasOutstanding || '';
  const view = params?.view || 'table';

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-page-title">
              Clients
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your customer relationships
            </p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/50 p-6"
              >
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        }
      >
        <ClientStatsDashboard />
      </Suspense>

      {/* Search, Filters, and Actions Bar */}
      <EntitySearchFilterBar
        entityType="client"
        addNewPath="/clients/new"
        addNewLabel="Add Client"
        searchPlaceholder="Search by name, email, or phone..."
        showOutstandingFilter={true}
        outstandingFilterLabel="With outstanding"
      />

      {/* Clients List with Caching */}
      <ClientListWithCache
        page={page}
        search={search}
        status={status}
        hasOutstanding={hasOutstanding}
        view={view}
      />
    </div>
  );
}
