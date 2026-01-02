/**
 * VendorListWithCache Component
 */

'use client';

import { Package } from 'lucide-react';
import { useVendors, useDeleteVendor } from '@/lib/hooks/use-vendors';
import { EntityListWithCache } from '@/components/shared/entity/entity-list-with-cache';
import type { ViewMode } from '@/components/shared/entity/view-toggle';

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
  return (
    <EntityListWithCache
      page={page}
      search={search}
      status={status}
      hasOutstanding={hasOutstanding}
      view={view}
      useEntities={useVendors}
      useDeleteEntity={useDeleteVendor}
      entityType="vendor"
      icon={Package}
      basePath="/vendors"
      addNewPath="/vendors/new"
      outstandingFilterField="outstandingPayable"
    />
  );
}
