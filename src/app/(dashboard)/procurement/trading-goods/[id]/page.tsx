import { Suspense } from 'react';
import { ProcurementDetailContainer } from '@/components/procurement/procurement-detail-container';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Procurement Details | PocketBooks',
    description: 'View trading good procurement details',
};

export default async function TradingGoodsProcurementPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={null}>
            <ProcurementDetailContainer id={id} type="trading_good" />
        </Suspense>
    );
}
