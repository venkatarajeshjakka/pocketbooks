/**
 * Assets Loading State
 *
 * Displayed while the assets page is loading
 */

import { Skeleton } from '@/components/ui/skeleton';

export default function AssetsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8 p-6">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Stats Dashboard Skeleton */}
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

      {/* Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-80" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Asset List Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
