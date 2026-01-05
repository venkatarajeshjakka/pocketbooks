/**
 * New Expense Page
 * Page for recording a new expense
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ExpenseForm } from '@/components/expenses/expense-form';

export const metadata = {
    title: 'Add Expense | PocketBooks',
    description: 'Record a new business expense',
};

export default function NewExpensePage() {
    return (
        <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
            {/* Page Header */}
            <div className="mx-auto w-full max-w-4xl mb-10">
                <Link
                    href="/expenses"
                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
                >
                    <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    Back to Expenses
                </Link>
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-orange-500/20 rounded-full" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">
                        Add Expense
                    </h1>
                    <p className="text-base text-muted-foreground mt-3 font-medium max-w-2xl leading-relaxed">
                        Record a new business expense. All expense details will be tracked and categorized automatically.
                    </p>
                </div>
            </div>

            {/* Expense Form */}
            <div className="mx-auto w-full max-w-4xl">
                <ExpenseForm mode="create" />
            </div>
        </div>
    );
}
