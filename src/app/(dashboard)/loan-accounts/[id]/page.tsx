import { Suspense } from 'react';
import { LoanAccountDetailContainer } from '@/components/loans/loan-detail-container';

interface LoanAccountPageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Loan Details | PocketBooks',
    description: 'View loan account details',
};

export default async function LoanAccountPage({ params }: LoanAccountPageProps) {
    const { id } = await params;

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8 w-full p-4 md:p-6">
            <Suspense fallback={null}>
                <LoanAccountDetailContainer id={id} />
            </Suspense>
        </div>
    );
}
