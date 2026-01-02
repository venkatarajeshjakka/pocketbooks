/**
 * Client List with Caching
 */

'use client';

import { Users } from 'lucide-react';
import { useClients, useDeleteClient } from '@/lib/hooks/use-clients';
import { EntityListWithCache } from '@/components/shared/entity/entity-list-with-cache';
import type { ViewMode } from '@/components/shared/entity/view-toggle';

interface ClientListWithCacheProps {
  page: number;
  search: string;
  status: string;
  hasOutstanding: string;
  view: ViewMode;
}

export function ClientListWithCache({
  page,
  search,
  status,
  hasOutstanding,
  view,
}: ClientListWithCacheProps) {
  return (
    <EntityListWithCache
      page={page}
      search={search}
      status={status}
      hasOutstanding={hasOutstanding}
      view={view}
      useEntities={useClients}
      useDeleteEntity={useDeleteClient}
      entityType="client"
      icon={Users}
      basePath="/clients"
      addNewPath="/clients/new"
      outstandingFilterField="outstandingBalance"
    />
  );
}
