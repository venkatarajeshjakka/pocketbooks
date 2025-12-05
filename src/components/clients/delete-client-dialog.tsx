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
import { deleteClient } from '@/lib/api/clients';
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
  const [isDeleting, setIsDeleting] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  const setOpen = controlledOnOpenChange || setIsOpen;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteClient(clientId);

      toast.success('Client deleted', {
        description: `${clientName} has been successfully deleted.`,
      });

      setOpen(false);

      // Redirect to clients list and refresh
      router.push('/clients');
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete client';
      toast.error('Delete failed', {
        description: message,
      });
    } finally {
      setIsDeleting(false);
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
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
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
