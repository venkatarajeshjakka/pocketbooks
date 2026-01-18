'use client';

import { Receipt, ArrowLeft, Edit, Calendar, Hash, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ExpenseDeleteButton } from '@/components/expenses/expense-delete-button';
import { ExpenseCategory, PaymentMethod, IExpense } from '@/types';

interface ExpenseDetailViewProps {
    expense: IExpense;
    id: string;
}

function getCategoryBadgeStyles(category: ExpenseCategory) {
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

function getPaymentMethodBadgeStyles(method: PaymentMethod) {
    switch (method) {
        case PaymentMethod.CASH:
            return 'bg-green-500/10 text-green-600 border-green-500/20';
        case PaymentMethod.BANK_TRANSFER:
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        case PaymentMethod.UPI:
            return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        case PaymentMethod.CHEQUE:
            return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        case PaymentMethod.CARD:
            return 'bg-red-500/10 text-red-600 border-red-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

function formatCategoryLabel(category: ExpenseCategory): string {
    return category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function ExpenseDetailView({ expense, id }: ExpenseDetailViewProps) {
    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/expenses">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Expenses
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 ring-1 ring-orange-500/20">
                            <Receipt className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Expense Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {expense.description}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/expenses/${id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <ExpenseDeleteButton
                        expenseId={id}
                        expenseDescription={expense.description}
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Expense Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Expense Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                <p className="mt-1 text-2xl font-bold text-destructive">
                                    -₹{expense.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Date</label>
                                <p className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(expense.date), 'dd MMMM yyyy')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                <div className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={cn('capitalize', getCategoryBadgeStyles(expense.category))}
                                    >
                                        {formatCategoryLabel(expense.category)}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                <div className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={cn('capitalize', getPaymentMethodBadgeStyles(expense.paymentMethod))}
                                    >
                                        {expense.paymentMethod?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            {expense.receiptNumber && (
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Receipt Number</label>
                                    <p className="mt-1 flex items-center gap-2 font-mono text-sm">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        {expense.receiptNumber}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="mt-1 text-sm">{expense.description}</p>
                        </div>
                        {expense.notes && (
                            <div className="pt-4 border-t border-border/50">
                                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                <p className="mt-1 text-sm flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    {expense.notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Timestamps and Additional Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Record Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p className="mt-1 text-sm">
                                    {expense.createdAt ? format(new Date(expense.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="mt-1 text-sm">
                                    {expense.updatedAt ? format(new Date(expense.updatedAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="pt-4 border-t border-border/50">
                            <label className="text-sm font-medium text-muted-foreground mb-3 block">Quick Info</label>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Transaction Type</span>
                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                        Expense
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Account Impact</span>
                                    <span className="text-sm font-medium text-destructive">Debit (Money Out)</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
