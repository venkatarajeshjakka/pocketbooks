/**
 * Clients Page - Redesigned
 * Modern UI with stats dashboard, advanced search/filters, and beautiful layouts
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientStatsDashboard } from '@/components/clients/stats/client-stats-dashboard';
import { ClientSearchBar } from '@/components/clients/search/client-search-bar';
import { AdvancedFilters } from '@/components/clients/search/advanced-filters';
import { ClientListContainer } from '@/components/clients/list/client-list-container';
import { ClientListSkeleton } from '@/components/clients/ui/client-list-skeleton';
import { EmptyState } from '@/components/clients/ui/empty-state';
import { fetchClients } from '@/lib/api/clients';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    hasOutstanding?: string;
  }>;
}

export const metadata = {
  title: 'Clients | PocketBooks',
  description: 'Manage your clients and customer relationships',
};

async function ClientList({
  page,
  search,
  status,
  hasOutstanding,
}: {
  page: number;
  search: string;
  status: string;
  hasOutstanding: string;
}) {
  try {
    const response = await fetchClients({
      page,
      limit: 50,
      search,
      status,
    });

    const clients = response.data;

    // Filter by outstanding balance if needed
    const filteredClients =
      hasOutstanding === 'true'
        ? clients.filter((c) => c.outstandingBalance > 0)
        : clients;

    if (filteredClients.length === 0) {
      const hasFilters = search || status || hasOutstanding;

      return (
        <EmptyState
          icon={Users}
          title={hasFilters ? 'No clients found' : 'No clients yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Get started by adding your first client to begin managing your customer relationships.'
          }
          action={
            !hasFilters
              ? {
                  label: 'Add your first client',
                  onClick: () => {
                    window.location.href = '/clients/new';
                  },
                }
              : undefined
          }
        />
      );
    }

    return <ClientListContainer clients={filteredClients} />;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return (
      <EmptyState
        icon={Users}
        title="Failed to load clients"
        description="An error occurred while loading clients. Please try again later."
      />
    );
  }
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const status = params?.status || '';
  const hasOutstanding = params?.hasOutstanding || '';

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your clients and customer relationships
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Client
          </Link>
        </Button>
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

      {/* Search Bar */}
      <ClientSearchBar />

      {/* Advanced Filters */}
      <AdvancedFilters />

      {/* Clients List */}
      <Suspense
        key={`${page}-${search}-${status}-${hasOutstanding}`}
        fallback={<ClientListSkeleton view="table" count={8} />}
      >
        <ClientList
          page={page}
          search={search}
          status={status}
          hasOutstanding={hasOutstanding}
        />
      </Suspense>
    </div>
  );
}
