/**
 * Vendors Loading State
 *
 * Displayed while the vendors page is loading
 */

import { Skeleton } from '@/components/ui/skeleton';

export default function VendorsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8">
      {/* Page Header Skeleton */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-11 w-full lg:max-w-md" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-11 w-[140px]" />
          <Skeleton className="h-11 w-[180px]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-11 w-32" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-4 text-left">
                  <Skeleton className="h-5 w-5 rounded" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="p-4 text-left hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="p-4 text-left hidden lg:table-cell">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="p-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="p-4 text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                </th>
                <th className="p-4 text-left hidden xl:table-cell">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-4">
                    <Skeleton className="h-5 w-5 rounded" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="p-4 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </td>
                  <td className="p-4 hidden xl:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-8 w-8 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
