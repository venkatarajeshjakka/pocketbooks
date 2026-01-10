/**
 * AssetDeleteButton Component
 * Client component to handle asset deletion with confirmation dialog
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteEntityDialog } from '@/components/shared/entity/delete-entity-dialog';
import { toast } from 'sonner';

interface AssetDeleteButtonProps {
    assetId: string;
    assetName: string;
}

export function AssetDeleteButton({ assetId, assetName }: AssetDeleteButtonProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/assets/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete asset');
            }

            toast.success('Asset deleted successfully');
            router.push('/assets');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete asset');
            throw error; // Re-throw to let the dialog handle it
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                aria-label={`Delete asset: ${assetName}`}
                title={`Delete asset: ${assetName}`}
            >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Delete
            </Button>

            <DeleteEntityDialog
                entityId={assetId}
                entityName={assetName}
                entityType="asset"
                open={showDeleteDialog}
                basePath="/assets"
                onOpenChange={setShowDeleteDialog}
                onDelete={handleDelete}
            />
        </>
    );
}
