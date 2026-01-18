
'use client';

import { useDeleteSale } from '@/lib/hooks/use-sales'; // Assume hook exists
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SaleDeleteButtonProps {
    saleId: string;
}

export function SaleDeleteButton({ saleId }: SaleDeleteButtonProps) {
    const deleteSale = useDeleteSale();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            await deleteSale.mutateAsync(saleId);
            router.push('/sales');
        } catch (error) {
            console.error('Failed to delete sale:', error);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-12 w-12 rounded-xl p-0 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                    <Trash2 className="h-5 w-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        sale record and revert the inventory stock changes and client balance.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteSale.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Sale'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
