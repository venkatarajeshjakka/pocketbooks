/**
 * DeleteEntityDialog Component
 *
 * Generic confirmation dialog for deleting an entity (client/vendor)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AffectedItem {
  label: string;
  count?: number;
  description: string;
  severity?: 'info' | 'warning' | 'danger';
}

interface DeleteEntityDialogProps {
  entityId: string | string[];
  entityName: string;
  entityType: 'client' | 'vendor' | 'asset' | 'payment' | 'expense' | 'loan' | 'interest-payment' | 'procurement' | 'trading_good_procurement' | 'raw-material' | 'trading-good' | 'finished-good';
  open: boolean;
  basePath: string;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  affectedItems?: AffectedItem[];
}

export function DeleteEntityDialog({
  entityId,
  entityName,
  entityType,
  open,
  basePath,
  onOpenChange,
  onDelete,
  affectedItems = [],
}: DeleteEntityDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const entityLabel = entityType === 'client' ? 'Client' : entityType === 'vendor' ? 'Vendor' : entityType === 'asset' ? 'Asset' : entityType === 'loan' ? 'Loan Account' : entityType === 'interest-payment' ? 'Interest Payment' : entityType === 'raw-material' ? 'Raw Material' : entityType === 'trading-good' ? 'Trading Good' : entityType === 'finished-good' ? 'Finished Good' : entityType === 'procurement' || entityType === 'trading_good_procurement' ? 'Procurement' : 'Payment';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (Array.isArray(entityId)) {
        for (const id of entityId) {
          await onDelete(id);
        }
      } else {
        await onDelete(entityId);
      }
      onOpenChange(false);
      router.push(basePath);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] gap-0 p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl" showCloseButton={false}>
        <div className="p-6 pt-8">
          <DialogHeader className="gap-4 items-center text-center">
            {/* Warning Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 shadow-inner group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 to-transparent opacity-50" />
              <svg
                className="h-8 w-8 text-destructive relative z-10"
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

            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold tracking-tight">
                Delete {entityLabel}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground/70 px-4 leading-relaxed">
                Are you sure you want to delete <strong className="text-foreground">{entityName}</strong>? This action cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>

          {affectedItems.length > 0 && (
            <div className="mt-8 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">
                Linked Impacts
              </h4>
              <div className="space-y-2">
                {affectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 transition-colors hover:bg-muted/50"
                  >
                    <div className={cn(
                      "mt-1 h-2 w-2 rounded-full",
                      item.severity === 'danger' ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                        item.severity === 'warning' ? "bg-warning" : "bg-primary"
                    )} />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground/90">{item.label}</span>
                        {item.count !== undefined && (
                          <span className="text-[10px] bg-muted px-1.5 rounded-full font-mono text-muted-foreground">
                            {item.count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal italic">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-border/20 bg-muted/10 gap-3 sm:gap-3 flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1 h-11 font-bold rounded-xl border-border/40 hover:bg-background transition-all"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 h-11 font-bold rounded-xl shadow-lg shadow-destructive/10 hover:shadow-destructive/20 transition-all bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white/50" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
