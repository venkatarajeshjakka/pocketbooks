/**
 * Edit Expense Page
 *
 * Page for editing an existing expense
 */

import { Suspense } from 'react';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditExpensePageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Edit Expense | PocketBooks',
    description: 'Update expense information',
};

export default async function EditExpensePage({ params }: EditExpensePageProps) {
    const { id } = await params;

    return (
        <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
            <div className="mx-auto w-full max-w-4xl">
                <Suspense
                    fallback={
                        <div className="space-y-8">
                            <Skeleton className="h-64 w-full rounded-2xl" />
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                    }
                >
                    <ExpenseForm mode="edit" expenseId={id} />
                </Suspense>
            </div>
        </div>
    );
}
