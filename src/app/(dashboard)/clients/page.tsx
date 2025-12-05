/**
 * Clients Page
 *
 * Main listing page for viewing and managing clients
 * Server Component that fetches initial client data
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientList } from '@/components/clients/client-list';
import { ClientSearch } from '@/components/clients/client-search';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';

interface ClientsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
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

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and customer relationships
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <ClientSearch />

      {/* Clients List */}
      <Suspense
        key={`${page}-${search}-${status}`}
        fallback={<ClientListSkeleton />}
      >
        <ClientList page={page} search={search} status={status} />
      </Suspense>
    </div>
  );
}

function ClientListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="p-4">
          <Skeleton className="h-8 w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-t p-4">
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
