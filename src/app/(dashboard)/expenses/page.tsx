/**
 * Expenses History Page
 * Displays a list of all expense transactions
 */

import { Suspense } from 'react';
import { Receipt } from 'lucide-react';
import { ExpenseList } from '@/components/expenses/expense-list';
import { EntitySearchFilterBar } from '@/components/shared/entity/entity-search-filter-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExpenseStatsDashboard } from '@/components/expenses/expense-stats-dashboard';

interface ExpensesPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        category?: string;
    }>;
}

export const metadata = {
    title: 'Expenses | PocketBooks',
    description: 'View and manage all expense transactions',
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || '';
    const category = params?.category || '';

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 ring-1 ring-orange-500/20">
                        <Receipt className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Expense History
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View and track all business expenses
                        </p>
                    </div>
                </div>
            </div>

            {/* Expense Stats */}
            <ExpenseStatsDashboard />

            {/* Search and Filters Bar */}
            <EntitySearchFilterBar
                entityType="expense"
                addNewPath="/expenses/new"
                addNewLabel="Add Expense"
                searchPlaceholder="Search by description or receipt number..."
                showStatusFilter={false}
                showOutstandingFilter={false}
            />

            {/* Expenses List */}
            <Suspense
                fallback={
                    <div className="space-y-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                    </div>
                }
            >
                <ExpenseList
                    page={page}
                    search={search}
                    category={category}
                />
            </Suspense>
        </div>
    );
}
