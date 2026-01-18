
'use client';

import { useState } from 'react';
import { useDeleteSale } from '@/lib/hooks/use-sales';
import { Button } from '@/components/ui/button';
import { Trash2, Package, Users, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DeleteEntityDialog } from '@/components/shared/entity/delete-entity-dialog';

interface SaleDeleteButtonProps {
    saleId: string;
    invoiceNumber?: string;
}

export function SaleDeleteButton({ saleId, invoiceNumber }: SaleDeleteButtonProps) {
    const deleteSale = useDeleteSale();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleDelete = async (id: string) => {
        await deleteSale.mutateAsync(id);
        // Navigation is handled inside DeleteEntityDialog via basePath, or we can handle it here.
        // But for SaleDetailView, we want to go back to /sales.
    };

    const affectedItems = [
        { label: 'Inventory Reversal', description: 'Deducted inventory items will be added back to stock.', severity: 'warning' as const },
        { label: 'Client Balance', description: 'The client\'s outstanding balance will be reduced by the remaining amount.', severity: 'info' as const },
        { label: 'Payment History', description: 'All associated payments for this sale will be permanently deleted.', severity: 'danger' as const }
    ];

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-12 w-12 rounded-xl p-0 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
                <Trash2 className="h-5 w-5" />
            </Button>

            <DeleteEntityDialog
                entityId={saleId}
                entityName={invoiceNumber || 'this sale'}
                entityType="sale"
                open={open}
                onOpenChange={setOpen}
                onDelete={handleDelete}
                basePath="/sales"
                affectedItems={affectedItems}
            />
        </>
    );
}
