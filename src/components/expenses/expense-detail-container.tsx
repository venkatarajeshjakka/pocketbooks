'use client';

import { useExpense } from '@/lib/hooks/use-expenses';
import { ExpenseDetailView } from '@/components/expenses/expense-detail-view';
import { Loader2 } from 'lucide-react';

interface ExpenseDetailContainerProps {
    id: string;
}

export function ExpenseDetailContainer({ id }: ExpenseDetailContainerProps) {
    const { data: expense, isLoading, error } = useExpense(id);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground/50">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !expense) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Expense Not Found</h2>
                <p className="text-sm text-muted-foreground max-w-xs">We couldn't find the expense you're looking for. It might have been deleted or the ID is invalid.</p>
            </div>
        );
    }

    return <ExpenseDetailView expense={expense} id={id} />;
}
