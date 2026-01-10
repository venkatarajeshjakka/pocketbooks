/**
 * Loan Accounts Dashboard Page
 * Displays a list of all loan accounts with filtering and stats
 */

import { Suspense } from 'react';
import { PiggyBank } from 'lucide-react';
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/5 text-warning border border-warning/20 backdrop-blur-md shadow-lg shadow-warning/5">
                        <PiggyBank className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                            Capital Management
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground/60">
                            Loan accounts, interest tracking, and capital oversight
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
