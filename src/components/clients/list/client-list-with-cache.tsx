/**
 * Client List with Caching
 *
 * Client component that uses React Query for data fetching and caching
 * Uses shared EntityListContainer for consistency with vendors
 */

'use client';

import { Users } from 'lucide-react';
import { useClients, useDeleteClient } from '@/lib/hooks/use-clients';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { EntityListSkeleton } from '@/components/shared/entity/entity-list-skeleton';
import { EmptyState } from '../ui/empty-state';
import type { ViewMode } from './view-toggle';

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
  // Fetch clients with caching
  const { data, isLoading, error } = useClients({
    page,
    limit: 50,
    search,
    status,
  });

  const deleteClientMutation = useDeleteClient();

  const handleDelete = async (id: string) => {
    await deleteClientMutation.mutateAsync(id);
  };

  // Loading state
  if (isLoading) {
    return <EntityListSkeleton view={view} count={8} />;
  }

  // Error state
  if (error) {
    console.error('Error fetching clients:', error);
    return (
      <EmptyState
        icon={Users}
        title="Failed to load clients"
        description="An error occurred while loading clients. Please try again later."
      />
    );
  }

  // Extract clients from response
  const clients = data?.data || [];

  // Filter by outstanding balance if needed
  const filteredClients =
    hasOutstanding === 'true'
      ? clients.filter((c) => c.outstandingBalance > 0)
      : clients;

  // Empty state
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

  // Render client list using shared EntityListContainer
  return (
    <EntityListContainer
      entities={filteredClients}
      entityType="client"
      initialView={view}
      basePath="/clients"
      onDelete={handleDelete}
    />
  );
}
