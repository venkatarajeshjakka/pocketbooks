/**
 * Edit Loan Account Page
 */

import { Suspense } from 'react';
import { LoanAccountForm } from '@/components/loans/loan-account-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditLoanAccountPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata = {
    title: 'Edit Loan Account | PocketBooks',
    description: 'Modify loan account details',
};

export default async function EditLoanAccountPage({ params }: EditLoanAccountPageProps) {
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
                    <LoanAccountForm mode="edit" id={id} />
                </Suspense>
            </div>
        </div>
    );
}
