/**
 * VendorListWithCache Component
 *
 * Client component that uses React Query for data fetching and caching
 * Mirrors the ClientListWithCache structure using shared components
 */

'use client';

import { Package } from 'lucide-react';
import { useVendors, useDeleteVendor } from '@/lib/hooks/use-vendors';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { EntityListSkeleton } from '@/components/shared/entity/entity-list-skeleton';
import { EmptyState } from '@/components/clients/ui/empty-state';
import type { ViewMode } from '@/components/clients/list/view-toggle';

interface VendorListWithCacheProps {
  page: number;
  search: string;
  status: string;
  hasOutstanding: string;
  view: ViewMode;
}

export function VendorListWithCache({
  page,
  search,
  status,
  hasOutstanding,
  view,
}: VendorListWithCacheProps) {
  // Fetch vendors with caching
  const { data, isLoading, error } = useVendors({
    page,
    limit: 50,
    search,
    status,
  });

  const deleteVendorMutation = useDeleteVendor();

  const handleDelete = async (id: string) => {
    await deleteVendorMutation.mutateAsync(id);
  };

  // Loading state
  if (isLoading) {
    return <EntityListSkeleton view={view} count={8} />;
  }

  // Error state
  if (error) {
    console.error('Error fetching vendors:', error);
    return (
      <EmptyState
        icon={Package}
        title="Failed to load vendors"
        description="An error occurred while loading vendors. Please try again later."
      />
    );
  }

  // Extract vendors from response
  const vendors = data?.data || [];

  // Filter by outstanding payable if needed
  const filteredVendors =
    hasOutstanding === 'true'
      ? vendors.filter((v) => v.outstandingPayable > 0)
      : vendors;

  // Empty state
  if (filteredVendors.length === 0) {
    const hasFilters = search || status || hasOutstanding;

    return (
      <EmptyState
        icon={Package}
        title={hasFilters ? 'No vendors found' : 'No vendors yet'}
        description={
          hasFilters
            ? 'Try adjusting your search or filters to find what you are looking for.'
            : 'Get started by adding your first vendor to begin managing your supplier relationships.'
        }
        action={
          !hasFilters
            ? {
                label: 'Add your first vendor',
                onClick: () => {
                  window.location.href = '/vendors/new';
                },
              }
            : undefined
        }
      />
    );
  }

  // Render vendor list using shared EntityListContainer
  return (
    <EntityListContainer
      entities={filteredVendors}
      entityType="vendor"
      initialView={view}
      basePath="/vendors"
      onDelete={handleDelete}
    />
  );
}
