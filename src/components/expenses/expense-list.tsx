/**
 * ExpenseList Component
 * Displays a list of expenses with filtering
 */

'use client';

import { useExpenses } from '@/lib/hooks/use-expenses';
import { EntityListContainer } from '@/components/shared/entity/entity-list-container';
import { EmptyState } from '@/components/shared/ui/empty-state';
import { IExpense, ExpenseCategory, PaymentMethod } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Receipt, HandCoins, Wallet, Landmark, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
    page: number;
    search: string;
    category: string;
}

function getCategoryStyles(category: ExpenseCategory) {
    switch (category) {
        case ExpenseCategory.RENT:
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        case ExpenseCategory.UTILITIES:
            return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
        case ExpenseCategory.SALARIES:
            return 'bg-green-500/10 text-green-600 border-green-500/20';
        case ExpenseCategory.TRANSPORTATION:
            return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        case ExpenseCategory.OFFICE_SUPPLIES:
            return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
        case ExpenseCategory.MARKETING:
            return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
        case ExpenseCategory.MAINTENANCE:
            return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
        case ExpenseCategory.PROFESSIONAL_FEES:
            return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
        case ExpenseCategory.INSURANCE:
            return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
        case ExpenseCategory.TAXES:
            return 'bg-red-500/10 text-red-600 border-red-500/20';
        case ExpenseCategory.INTEREST:
            return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        default:
            return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
}

function formatCategoryLabel(category: ExpenseCategory): string {
    return category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getPaymentMethodIcon(method: PaymentMethod) {
    switch (method) {
        case PaymentMethod.CASH:
            return <HandCoins className="h-4 w-4" />;
        case PaymentMethod.UPI:
            return <Wallet className="h-4 w-4" />;
        case PaymentMethod.BANK_TRANSFER:
        case PaymentMethod.CHEQUE:
            return <Landmark className="h-4 w-4" />;
        case PaymentMethod.CARD:
            return <CreditCard className="h-4 w-4" />;
        default:
            return <CreditCard className="h-4 w-4" />;
    }
}

export function ExpenseList({ page, search, category }: ExpenseListProps) {
    const { data, isLoading, error } = useExpenses({
        page,
        search,
        category,
        limit: 50,
        sortBy: 'date',
        sortOrder: 'desc',
    });

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
                icon={Receipt}
                title="Failed to load expenses"
                description="An error occurred while loading expense history. Please try again later."
            />
        );
    }

    const expenses = data?.data || [];

    if (expenses.length === 0) {
        const hasFilters = search || category;

        return (
            <EmptyState
                icon={Receipt}
                title={hasFilters ? 'No expenses found' : 'No expenses yet'}
                description={
                    hasFilters
                        ? 'Try adjusting your search or filters to find what you are looking for.'
                        : 'Get started by recording your first expense.'
                }
                action={
                    !hasFilters
                        ? {
                            label: 'Record your first expense',
                            onClick: () => {
                                window.location.href = '/expenses/new';
                            },
                        }
                        : undefined
                }
            />
        );
    }

    const columns = [
        {
            header: 'Date',
            accessorKey: 'date',
            cell: (expense: IExpense) => format(new Date(expense.date), 'dd MMM yyyy'),
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: (expense: IExpense) => (
                <div className="flex flex-col">
                    <span className="font-medium line-clamp-1">{expense.description}</span>
                    {expense.receiptNumber && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                            #{expense.receiptNumber}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Category',
            accessorKey: 'category',
            cell: (expense: IExpense) => (
                <Badge
                    variant="outline"
                    className={cn('text-[10px] h-6 px-2 capitalize font-bold tracking-wider', getCategoryStyles(expense.category))}
                >
                    {formatCategoryLabel(expense.category)}
                </Badge>
            ),
        },
        {
            header: 'Method',
            accessorKey: 'paymentMethod',
            cell: (expense: IExpense) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getPaymentMethodIcon(expense.paymentMethod)}
                    <span className="capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
                </div>
            ),
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            cell: (expense: IExpense) => (
                <span className="font-bold text-base text-destructive">
                    -{'\u20B9'}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            header: 'Notes',
            accessorKey: 'notes',
            cell: (expense: IExpense) => (
                <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                    {expense.notes || '-'}
                </span>
            ),
        },
    ];

    return (
        <EntityListContainer
            entityType="expense"
            entities={expenses}
            initialView="table"
            basePath="/expenses"
            onDelete={async () => { }}
            columns={columns}
            renderCardContent={(expense: IExpense) => (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="outline"
                            className={cn('text-[10px] h-5 px-1.5 capitalize font-bold', getCategoryStyles(expense.category))}
                        >
                            {formatCategoryLabel(expense.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), 'dd MMM yyyy')}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground line-clamp-2">
                            {expense.description}
                        </span>
                        {expense.receiptNumber && (
                            <span className="text-[10px] text-muted-foreground font-mono mt-1">
                                Receipt: #{expense.receiptNumber}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/10">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {getPaymentMethodIcon(expense.paymentMethod)}
                            <span className="capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <span className="font-bold text-sm text-destructive">
                            -{'\u20B9'}{expense.amount.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {expense.notes && (
                        <p className="text-[10px] text-muted-foreground italic line-clamp-1 opacity-70">
                            "{expense.notes}"
                        </p>
                    )}
                </div>
            )}
        />
    );
}
