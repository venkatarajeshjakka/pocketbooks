/**
 * Client List with Caching
 *
 * Client component that uses React Query for data fetching and caching
 */

'use client';

import { Users } from 'lucide-react';
import { useClients } from '@/lib/hooks/use-clients';
import { ClientListContainer } from './client-list-container';
import { ClientListSkeleton } from '../ui/client-list-skeleton';
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

  // Loading state
  if (isLoading) {
    return <ClientListSkeleton view={view} count={8} />;
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

  // Render client list
  return <ClientListContainer clients={filteredClients} initialView={view} />;
}
