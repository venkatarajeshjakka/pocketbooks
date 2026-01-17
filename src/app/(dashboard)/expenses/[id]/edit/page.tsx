/**
 * Edit Expense Page
 *
 * Page for editing an existing expense
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { fetchExpense } from '@/lib/api/expenses';

interface EditExpensePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditExpensePageProps) {
    const { id } = await params;
    try {
        const expense = await fetchExpense(id);
        if (expense) {
            return {
                title: `Edit ${expense.description} | Expenses | PocketBooks`,
                description: `Edit expense ${expense.description}`,
            };
        }
    } catch {
        // Fall through to default
    }
    return {
        title: 'Expense Not Found | PocketBooks',
    };
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
    const { id } = await params;

    let expense;
    try {
        expense = await fetchExpense(id);

        if (!expense) {
            notFound();
        }
    } catch (error) {
        console.error('Error fetching expense:', error);
        notFound();
    }

    return (
        <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
            {/* Page Header */}
            <div className="mx-auto w-full max-w-4xl mb-10">
                <Link
                    href={`/expenses/${id}`}
                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
                >
                    <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    Back to Expense
                </Link>
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-orange-500/20 rounded-full" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">
                        Edit Expense
                    </h1>
                    <p className="text-base text-muted-foreground mt-3 font-medium max-w-2xl leading-relaxed">
                        Update expense details, category, and payment information.
                    </p>
                </div>
            </div>

            {/* Expense Form */}
            <div className="mx-auto w-full max-w-4xl">
                <ExpenseForm mode="edit" expenseId={id} initialData={expense} />
            </div>
        </div>
    );
}
