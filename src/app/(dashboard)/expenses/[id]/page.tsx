/**
 * Expense Detail Page
 * Shows detailed expense information
 */

import { Suspense } from 'react';
import { ExpenseDetailContainer } from '@/components/expenses/expense-detail-container';

interface ExpenseDetailPageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Expense Details | PocketBooks',
    description: 'View expense details',
};

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={null}>
            <ExpenseDetailContainer id={id} />
        </Suspense>
    );
}
