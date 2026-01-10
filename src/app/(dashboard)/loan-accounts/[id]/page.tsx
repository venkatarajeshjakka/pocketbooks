/**
 * Loan Account Details Page
 */

import { notFound } from 'next/navigation';
import { fetchLoanAccount } from '@/lib/api/loan-accounts';
import { LoanAccountDetailView } from '@/components/loans/loan-detail-view';

interface LoanAccountPageProps {
    params: Promise<{ id: string }>;
}

async function getLoanAccount(id: string) {
    try {
        const response = await fetchLoanAccount(id);
        return response.data;
    } catch (error) {
        console.error('Error fetching loan account:', error);
        return null;
    }
}

export async function generateMetadata({ params }: LoanAccountPageProps) {
    const { id } = await params;
    const loan = await getLoanAccount(id);

    return {
        title: loan ? `${loan.bankName} | Loan Details | PocketBooks` : 'Loan Not Found',
        description: loan
            ? `View details for loan account ${loan.accountNumber}`
            : 'Loan account not found',
    };
}

export default async function LoanAccountPage({ params }: LoanAccountPageProps) {
    const { id } = await params;
    const loan = await getLoanAccount(id);

    if (!loan) {
        notFound();
    }

    return (
        <div className="flex flex-1 flex-col saas-canvas -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
            <LoanAccountDetailView loan={loan} />
        </div>
    );
}
