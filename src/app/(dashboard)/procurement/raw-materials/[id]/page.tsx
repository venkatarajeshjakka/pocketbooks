import { Suspense } from 'react';
import { ProcurementDetailContainer } from '@/components/procurement/procurement-detail-container';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Procurement Details | PocketBooks',
    description: 'View raw material procurement details',
};

export default async function RawMaterialProcurementPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={null}>
            <ProcurementDetailContainer id={id} type="raw_material" />
        </Suspense>
    );
}
