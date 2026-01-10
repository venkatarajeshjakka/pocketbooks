/**
 * Payments History Page
 * Displays a list of all payment transactions
 */

import { Suspense } from 'react';
import { IndianRupee } from 'lucide-react';
import { PaymentList } from '@/components/payments/payment-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';

import { PaymentStatsDashboard } from '@/components/payments/payment-stats-dashboard';

interface PaymentsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        transactionType?: string;
        partyType?: string;
        view?: 'grid' | 'table';
    }>;
}

export const metadata = {
    title: 'Payments | PocketBooks',
    description: 'View and manage all payment transactions',
};

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || '';
    const transactionType = params?.transactionType || '';
    const partyType = params?.partyType || '';
    const view = params?.view || 'table';

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/5 text-success border border-success/20 backdrop-blur-md shadow-lg shadow-success/5">
                        <IndianRupee className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                            Payment Ledger
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground/60">
                            Financial transaction history and settlement
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Stats */}
            <Suspense
                fallback={
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
                }
            >
                <PaymentStatsDashboard />
            </Suspense>

            {/* Search and Filters Bar */}
            <div className="flex items-center justify-between gap-4">
                <EntitySearchFilterBar
                    entityType="payment"
                    addNewPath="/payments/new"
                    addNewLabel="Record Payment"
                    searchPlaceholder="Search by notes or transaction ID..."
                    showStatusFilter={false}
                    showOutstandingFilter={false}
                />
            </div>

            {/* Payments List */}
            <Suspense
                fallback={
                    <div className="space-y-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                    </div>
                }
            >
                <PaymentList
                    page={page}
                    search={search}
                    transactionType={transactionType}
                    partyType={partyType}
                    view={view}
                />
            </Suspense>
        </div>
    );
}
