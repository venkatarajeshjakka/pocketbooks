/**
 * Expenses Page Loading State
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ExpensesLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header Skeleton */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[120px] mb-2" />
                            <Skeleton className="h-3 w-[80px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Skeleton className="h-11 w-full lg:max-w-md" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-[100px]" />
                    <Skeleton className="h-11 w-[140px]" />
                </div>
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
