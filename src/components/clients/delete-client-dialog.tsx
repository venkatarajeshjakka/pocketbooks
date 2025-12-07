/**
 * Delete Client Dialog Component
 *
 * Confirmation dialog for deleting a client
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteClient } from '@/lib/hooks/use-clients';
import { toast } from 'sonner';

interface DeleteClientDialogProps {
  clientId: string;
  clientName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function DeleteClientDialog({
  clientId,
  clientName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: DeleteClientDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Use React Query mutation hook
  const deleteClientMutation = useDeleteClient();

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  const setOpen = controlledOnOpenChange || setIsOpen;

  const handleDelete = async () => {
    try {
      // Use mutation hook - it handles cache invalidation and toast automatically
      await deleteClientMutation.mutateAsync(clientId);

      setOpen(false);

      // Redirect to clients list
      router.push('/clients');
    } catch (error) {
      // Error toast is handled by the mutation hook
      console.error('Delete failed:', error);
    }
  };

  const dialogTrigger = trigger || (
    <Button variant="destructive" size="sm">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{clientName}</strong>? This
            action cannot be undone and will permanently remove all client data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteClientMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteClientMutation.isPending}
          >
            {deleteClientMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
