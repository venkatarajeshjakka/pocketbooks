/**
 * Interest Payment Details Page
 */

import { notFound } from 'next/navigation';
import { fetchInterestPayment } from '@/lib/api/interest-payments';
import { InterestPaymentDetailView } from '@/components/loans/interest-payment-detail-view';

interface InterestPaymentPageProps {
    params: Promise<{ id: string }>;
}

async function getInterestPayment(id: string) {
    try {
        const response = await fetchInterestPayment(id);
        return response.data;
    } catch (error) {
        console.error('Error fetching interest payment:', error);
        return null;
    }
}

export async function generateMetadata({ params }: InterestPaymentPageProps) {
    const { id } = await params;
    const payment = await getInterestPayment(id);

    return {
        title: payment ? `Payment Details | PocketBooks` : 'Payment Not Found',
        description: payment
            ? `View details for interest payment recorded on ${new Date(payment.date).toLocaleDateString()}`
            : 'Interest payment record not found',
    };
}

export default async function InterestPaymentPage({ params }: InterestPaymentPageProps) {
    const { id } = await params;
    const payment = await getInterestPayment(id);

    if (!payment) {
        notFound();
    }

    return (
        <div className="flex flex-1 flex-col saas-canvas -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
            <InterestPaymentDetailView payment={payment} />
        </div>
    );
}
