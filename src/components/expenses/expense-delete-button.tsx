/**
 * ExpenseDeleteButton Component
 * Client component to handle expense deletion with confirmation dialog
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteEntityDialog } from '@/components/shared/entity/delete-entity-dialog';
import { toast } from 'sonner';

interface ExpenseDeleteButtonProps {
    expenseId: string;
    expenseDescription: string;
}

export function ExpenseDeleteButton({ expenseId, expenseDescription }: ExpenseDeleteButtonProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete expense');
            }

            toast.success('Expense deleted successfully');
            router.push('/expenses');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete expense');
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
                aria-label={`Delete ${expenseDescription}`}
                title={`Delete ${expenseDescription}`}
            >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Delete
            </Button>

            <DeleteEntityDialog
                entityId={expenseId}
                entityName={expenseDescription}
                entityType="expense"
                open={showDeleteDialog}
                basePath="/expenses"
                onOpenChange={setShowDeleteDialog}
                onDelete={handleDelete}
            />
        </>
    );
}
