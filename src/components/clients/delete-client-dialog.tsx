/**
 * Delete Client Dialog Component
 *
 * Confirmation dialog for deleting a client
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteClient } from "@/lib/hooks/use-clients";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      router.push("/clients");
    } catch (error) {
      // Error toast is handled by the mutation hook
      console.error("Delete failed:", error);
    }
  };

  const defaultTrigger = (
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  const dialogTrigger = trigger || (
    <Tooltip>
      <TooltipTrigger asChild>{defaultTrigger}</TooltipTrigger>
      <TooltipContent>Delete client</TooltipContent>
    </Tooltip>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-6" showCloseButton={false}>
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          disabled={deleteClientMutation.isPending}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="gap-3 items-center text-center pt-2">
          {/* Warning Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold">
              Delete Client
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteClientMutation.isPending}
            className="flex-1 sm:flex-1 h-10"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteClientMutation.isPending}
            className="flex-1 sm:flex-1 h-10 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {deleteClientMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
