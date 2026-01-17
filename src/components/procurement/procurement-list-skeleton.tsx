/**
 * ProcurementListSkeleton Component
 * Loading state for procurement lists (grid/table)
 */

import { Skeleton } from '@/components/ui/skeleton';

interface ProcurementListSkeletonProps {
    view?: 'grid' | 'table';
}

export function ProcurementListSkeleton({ view = 'grid' }: ProcurementListSkeletonProps) {
    if (view === 'table') {
        return (
            <div className="rounded-xl border border-border/50 bg-card/30 p-1">
                <div className="space-y-4 p-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-border/10">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 flex-1" />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2 opacity-50">
                            {Array.from({ length: 5 }).map((_, j) => (
                                <Skeleton key={j} className="h-8 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-border/10">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
