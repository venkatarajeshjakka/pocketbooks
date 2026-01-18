'use client';

import { useLoanAccount } from '@/lib/hooks/use-loan-accounts';
import { LoanAccountDetailView } from './loan-detail-view';
import { Loader2 } from 'lucide-react';

interface LoanAccountDetailContainerProps {
    id: string;
}

export function LoanAccountDetailContainer({ id }: LoanAccountDetailContainerProps) {
    const { data, isLoading, error } = useLoanAccount(id);
    const loan = data?.data;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground/50">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !loan) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Loan Account Not Found</h2>
                <p className="text-sm text-muted-foreground max-w-xs">We couldn't find the loan account you're looking for. It might have been deleted or the ID is invalid.</p>
            </div>
        );
    }

    return <LoanAccountDetailView loan={loan} />;
}
