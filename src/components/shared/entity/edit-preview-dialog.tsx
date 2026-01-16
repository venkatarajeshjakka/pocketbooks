'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Change {
    field: string;
    label: string;
    oldValue: any;
    newValue: any;
    type?: 'text' | 'price' | 'date' | 'status' | 'list';
}

interface EditPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    changes: Change[];
    title?: string;
    description?: string;
    isSubmitting?: boolean;
}

export function EditPreviewDialog({
    open,
    onOpenChange,
    onConfirm,
    changes,
    title = "Review Changes",
    description = "Please review the changes you've made before saving.",
    isSubmitting = false
}: EditPreviewDialogProps) {

    if (changes.length === 0) return null;

    const formatValue = (value: any, type?: string) => {
        if (value === null || value === undefined || value === '') return <span className="text-muted-foreground italic text-xs">Empty</span>;

        switch (type) {
            case 'price':
                return <span className="font-mono">₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>;
            case 'date':
                return <span>{new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
            case 'status':
                return <span className="capitalize">{String(value).replace('_', ' ')}</span>;
            default:
                return <span>{String(value)}</span>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground/70 mt-1">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4 pr-4">
                        {changes.map((change, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-muted/20 p-4 transition-all hover:border-primary/20 hover:bg-muted/30"
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                                            {change.label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">Current</span>
                                            <div className="text-sm font-medium truncate w-full">
                                                {formatValue(change.oldValue, change.type)}
                                            </div>
                                        </div>

                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shadow-sm transition-transform group-hover:scale-110">
                                            <ArrowRight className="h-4 w-4 text-primary" />
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-tighter">New Value</span>
                                            <div className="text-sm font-bold text-primary truncate w-full text-right">
                                                {formatValue(change.newValue, change.type)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Items special mention if any */}
                    {changes.some(c => c.field === 'items') && (
                        <div className="mt-4 p-4 rounded-xl bg-warning/5 border border-warning/20 flex gap-3 items-start">
                            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-warning/90">Items Modified</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Updating items may trigger automatic stock adjustments in your inventory records.
                                </p>
                            </div>
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="p-6 pt-4 border-t border-border/20 bg-muted/10">
                    <div className="flex items-center justify-between w-full gap-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="flex-1 h-12 font-bold rounded-xl border-border/40 hover:bg-background transition-all"
                        >
                            Back to Editing
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="flex-1 h-12 font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting ? "Saving..." : "Confirm & Save"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

