/**
 * New Loan Account Page
 */

import { Landmark, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoanAccountForm } from '@/components/loans/loan-account-form';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'New Loan Account | PocketBooks',
    description: 'Add a new loan account to your portfolio',
};

export default function NewLoanAccountPage() {
    return (
        <div className="flex flex-1 flex-col gap-8 max-w-5xl mx-auto w-full pb-20">
            {/* Navigation & Header */}
            <div className="space-y-4">
                <Link href="/loan-accounts" className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Loan Accounts
                </Link>

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 shadow-xl shadow-primary/10">
                        <Landmark className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            New Loan Account
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            Enter loan details and repayment terms
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <LoanAccountForm mode="create" />
        </div>
    );
}
