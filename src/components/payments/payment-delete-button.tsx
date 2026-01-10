/**
 * PaymentDeleteButton Component
 * Client component to handle payment deletion with confirmation dialog
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteEntityDialog } from '@/components/shared/entity/delete-entity-dialog';
import { toast } from 'sonner';

interface PaymentDeleteButtonProps {
    paymentId: string;
    paymentDescription: string;
}

export function PaymentDeleteButton({ paymentId, paymentDescription }: PaymentDeleteButtonProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/payments/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete payment');
            }

            toast.success('Payment deleted successfully');
            router.push('/payments');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete payment');
            throw error;
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                aria-label={`Delete ${paymentDescription}`}
                title={`Delete ${paymentDescription}`}
            >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Delete
            </Button>

            <DeleteEntityDialog
                entityId={paymentId}
                entityName={paymentDescription}
                entityType="payment"
                open={showDeleteDialog}
                basePath="/payments"
                onOpenChange={setShowDeleteDialog}
                onDelete={handleDelete}
            />
        </>
    );
}
