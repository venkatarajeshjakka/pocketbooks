/**
 * LoanAccountList Component
 *
 * Displays a list of loan accounts with status, interest rates, and balances
 * Reuses EntityListContainer for consistent UI
 */

'use client';

import { ILoanAccount, LoanAccountStatus } from '@/types';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, Landmark, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useLoanAccounts, useDeleteLoanAccount } from '@/lib/hooks/use-loan-accounts';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/ui/empty-state';

interface LoanAccountListProps {
    page?: number;
    search?: string;
    status?: string;
}

export function LoanAccountList({ page = 1, search = '', status = '' }: LoanAccountListProps) {
    const { data, isLoading, error } = useLoanAccounts({
        page,
        search,
        status,
        limit: 50,
    });
    const deleteLoanMutation = useDeleteLoanAccount();

    const handleDelete = async (id: string) => {
        await deleteLoanMutation.mutateAsync(id);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={Landmark}
                title="Failed to load loan accounts"
                description="An error occurred while loading loan accounts. Please try again later."
            />
        );
    }

    const loanAccounts = data?.data || [];

    if (loanAccounts.length === 0) {
        const hasFilters = search || status;
        return (
            <EmptyState
                icon={Landmark}
                title={hasFilters ? 'No loan accounts found' : 'No loan accounts yet'}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : 'Get started by creating your first loan account.'
                }
                action={
                    !hasFilters
                        ? {
                            label: 'Create first loan account',
                            onClick: () => {
                                window.location.href = '/loan-accounts/new';
                            },
                        }
                        : undefined
                }
            />
        );
    }

    const columns = [
        {
            header: 'Bank & Account',
            accessorKey: 'bankName',
            cell: (loan: ILoanAccount) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Landmark className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-bold text-foreground/90">{loan.bankName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{loan.accountNumber}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Loan Details',
            cell: (loan: ILoanAccount) => (
                <div className="space-y-1">
                    <div className="text-sm font-medium">{loan.loanType}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <TrendingUp className="h-3 w-3 text-success" />
                        {loan.interestRate}% Interest
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (loan: ILoanAccount) => {
                const statusColors = {
                    [LoanAccountStatus.ACTIVE]: 'bg-success/10 text-success border-success/20',
                    [LoanAccountStatus.CLOSED]: 'bg-muted text-muted-foreground border-border',
                    [LoanAccountStatus.DEFAULTED]: 'bg-destructive/10 text-destructive border-destructive/20',
                };
                return (
                    <Badge className={cn('capitalize font-bold px-2.5 py-0.5', statusColors[loan.status])}>
                        {loan.status}
                    </Badge>
                );
            },
        },
        {
            header: 'Outstanding',
            cell: (loan: ILoanAccount) => (
                <div className="text-right">
                    <div className="font-bold text-foreground">
                        ₹{loan.outstandingAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        of ₹{loan.principalAmount.toLocaleString('en-IN')}
                    </div>
                </div>
            ),
        },
        {
            header: 'Last Updated',
            cell: (loan: ILoanAccount) => (
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(loan.updatedAt), 'dd MMM yyyy')}
                </div>
            ),
        },
    ];

    return (
        <EntityListContainer
            entities={loanAccounts}
            entityType="loan"
            basePath="/loan-accounts"
            onDelete={handleDelete}
            columns={columns}
            renderCardContent={(loan: ILoanAccount) => (
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">
                                Outstanding Balance
                            </div>
                            <div className="text-2xl font-black text-foreground">
                                ₹{loan.outstandingAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10">
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/40">
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Interest Rate</div>
                            <div className="font-bold">{loan.interestRate}%</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Principal Paid</div>
                            <div className="font-bold text-success">₹{loan.totalPrincipalPaid.toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Landmark className="h-3 w-3" />
                        <span className="truncate">{loan.bankName} • {loan.accountNumber}</span>
                    </div>
                </div>
            )}
        />
    );
}
