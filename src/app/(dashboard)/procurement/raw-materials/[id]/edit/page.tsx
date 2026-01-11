import { notFound } from 'next/navigation';
import { ProcurementForm } from '@/components/procurement/procurement-form';
import { fetchProcurement } from '@/lib/api/procurements';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditRawMaterialProcurementPage({ params }: PageProps) {
    const { id } = await params;

    let procurement;
    try {
        procurement = await fetchProcurement('raw_material', id);
    } catch (error) {
        console.error('Failed to fetch procurement:', error);
        notFound();
    }

    // The API returns serialization safe JSON (dates as strings)
    // We need to transform items for the form to understand them
    const serializedProcurement = procurement as any;

    const transformedItems = serializedProcurement.items.map((item: any) => ({
        ...item,
        // Ensure rawMaterialId is just the ID string
        rawMaterialId: item.rawMaterialId?._id || item.rawMaterialId,
        // Add name for display
        name: item.rawMaterialId?.name || 'Unknown Item',
    }));

    serializedProcurement.items = transformedItems;

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto py-6">
            <div className="flex items-center gap-4">
                <Link href={`/procurement/raw-materials/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Procurement</h1>
                    <p className="text-muted-foreground">
                        Update procurement details.
                    </p>
                </div>
            </div>
            <ProcurementForm
                type="raw_material"
                mode="edit"
                initialData={serializedProcurement}
                procurementId={id}
            />
        </div>
    );
}
