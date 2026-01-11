import { notFound } from 'next/navigation';
import { ProcurementDetailView } from '@/components/procurement/procurement-detail-view';
import { fetchProcurement } from '@/lib/api/procurements';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TradingGoodsProcurementPage({ params }: PageProps) {
    const { id } = await params;

    let procurement;
    try {
        procurement = await fetchProcurement('trading_good', id);
    } catch (error) {
        console.error('Error fetching procurement:', error);
        notFound();
    }

    if (!procurement) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <ProcurementDetailView
                procurement={procurement as any}
                type="trading_good"
            />
        </div>
    );
}
