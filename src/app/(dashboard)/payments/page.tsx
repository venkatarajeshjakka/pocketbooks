/**
 * Payments History Page
 * Displays a list of all payment transactions
 */

import { Suspense } from 'react';
import { CreditCard } from 'lucide-react';
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

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
                        <CreditCard className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Payment History
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View and track all sales, purchases, and expense payments
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Stats */}
            <PaymentStatsDashboard />

            {/* Search and Filters Bar */}
            <EntitySearchFilterBar
                entityType="payment"
                addNewPath="/payments/new"
                addNewLabel="Record Payment"
                searchPlaceholder="Search by notes or transaction ID..."
                showStatusFilter={false}
                showOutstandingFilter={false}
            />

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
                />
            </Suspense>
        </div>
    );
}
