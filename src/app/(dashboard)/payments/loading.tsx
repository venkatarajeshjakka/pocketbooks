/**
 * Payments Loading State
 */

import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentsLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8 p-6">
            {/* Header Skeleton */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 max-w-md" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
