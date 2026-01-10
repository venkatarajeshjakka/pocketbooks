/**
 * Loan Accounts Dashboard Page
 * Displays a list of all loan accounts with filtering and stats
 */

import { Suspense } from 'react';
import { Landmark } from 'lucide-react';
import { LoanAccountList } from '@/components/loans/loan-account-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';

interface LoanAccountsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        status?: string;
    }>;
}

export const metadata = {
    title: 'Loan Accounts | PocketBooks',
    description: 'Manage and track business loans and interest rates',
};

export default async function LoanAccountsPage({ searchParams }: LoanAccountsPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || '';
    const status = params?.status || '';

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/10">
                        <Landmark className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Loan Accounts
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            Track your business liabilities and interest outgo
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <EntitySearchFilterBar
                entityType="loan"
                addNewPath="/loan-accounts/new"
                addNewLabel="New Loan Account"
                searchPlaceholder="Search by bank name or account number..."
                showStatusFilter={true}
                statusOptions={[
                    { label: 'Active Loans', value: 'active' },
                    { label: 'Closed Loans', value: 'closed' },
                    { label: 'Defaulted', value: 'defaulted' },
                ]}
            />

            {/* Loan Accounts List */}
            <Suspense
                fallback={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                        ))}
                    </div>
                }
            >
                <LoanAccountList
                    page={page}
                    search={search}
                    status={status}
                />
            </Suspense>
        </div>
    );
}
