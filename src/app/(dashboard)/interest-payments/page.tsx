/**
 * Interest Payments Dashboard Page
 * Displays a list of all interest payments with filtering
 */

import { Suspense } from 'react';
import { Wallet } from 'lucide-react';
import { InterestPaymentList } from '@/components/loans/interest-payment-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';

interface InterestPaymentsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        loanAccountId?: string;
    }>;
}

export const metadata = {
    title: 'Interest Payments | PocketBooks',
    description: 'View and manage all interest and principal payments against loans',
};

export default async function InterestPaymentsPage({ searchParams }: InterestPaymentsPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || '';
    const loanAccountId = params?.loanAccountId || '';

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/10">
                        <Wallet className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Interest Payments
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            Monitor debt service and principal repayments
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <EntitySearchFilterBar
                entityType="interest-payment"
                addNewPath="/interest-payments/new"
                addNewLabel="Record Payment"
                searchPlaceholder="Search notes or references..."
                showStatusFilter={false}
                showOutstandingFilter={false}
            />

            {/* Interest Payments List */}
            <Suspense
                fallback={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                        ))}
                    </div>
                }
            >
                <InterestPaymentList
                    page={page}
                    search={search}
                    loanAccountId={loanAccountId}
                />
            </Suspense>
        </div>
    );
}
