/**
 * QuickAddRawMaterialType Component
 * 
 * A premium dialog to quickly add a new raw material type
 */

'use client';

import { useState } from 'react';
import { Plus, Check, Loader2, Package, Info, X, Pencil } from 'lucide-react';
import { useCreateRawMaterialType, useUpdateRawMaterialType } from '@/lib/hooks/use-raw-material-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface QuickAddProps {
    onSuccess?: (typeName: string) => void;
    trigger?: React.ReactNode;
    mode?: 'add' | 'edit';
    initialData?: {
        id: string;
        name: string;
        description?: string;
    };
}

export function QuickAddRawMaterialType({ onSuccess, trigger, mode = 'add', initialData }: QuickAddProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');

    const createMutation = useCreateRawMaterialType();
    const updateMutation = useUpdateRawMaterialType();

    const isEdit = mode === 'edit' && !!initialData;
    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            if (isEdit) {
                await updateMutation.mutateAsync({
                    id: initialData!.id,
                    input: { name: name.trim(), description: description.trim() }
                });
            } else {
                await createMutation.mutateAsync({
                    name: name.trim(),
                    description: description.trim()
                });
            }

            onSuccess?.(name.trim());
            if (!isEdit) {
                setName('');
                setDescription('');
            }
            setOpen(false);
        } catch (error) {
            // Error is handled by the hook's toast
        }
    };

    // Reset internal state when modal opens for edit
    const onOpenChange = (newOpen: boolean) => {
        if (newOpen && isEdit) {
            setName(initialData!.name);
            setDescription(initialData!.description || '');
        }
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add New Type
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                <form onSubmit={handleAction}>
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                    <div className="p-6 md:p-8 space-y-8">
                        <DialogHeader className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative group">
                                    {isEdit ? (
                                        <Pencil className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                                    ) : (
                                        <Package className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                                    )}
                                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                                        {isEdit ? (
                                            <Check className="h-2 w-2 text-primary-foreground" />
                                        ) : (
                                            <Plus className="h-2 w-2 text-primary-foreground" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <DialogTitle className="text-xl font-bold tracking-tight">
                                        {isEdit ? 'Update Raw Material Type' : 'Add Raw Material Type'}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-medium text-muted-foreground/80">
                                        {isEdit ? 'Refine your procurement category' : 'Define a new category for procurement'}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid gap-6"
                        >
                            <div className="space-y-3">
                                <Label htmlFor="quick-name" className="text-sm font-semibold tracking-wide flex items-center gap-2">
                                    Type Name <span className="text-destructive font-bold">*</span>
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="quick-name"
                                        placeholder="e.g. Silk, Denim, Hardware"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                        required
                                        className="h-11 bg-muted/30 border-border/50 focus:bg-background transition-all duration-300 pl-4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="quick-desc" className="text-sm font-semibold tracking-wide flex items-center gap-2">
                                    Description
                                    <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground/60">(Optional)</span>
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="quick-desc"
                                        placeholder="What kind of materials fall under this?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="h-11 bg-muted/30 border-border/50 focus:bg-background transition-all duration-300 pl-4"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <DialogFooter className="bg-muted/30 p-6 md:px-8 border-t border-border/50 gap-3">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-11 px-6 font-medium hover:bg-background hover:text-foreground transition-all duration-300"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isPending || !name.trim()}
                            className="h-11 px-8 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 active:scale-95"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {isEdit ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    <span>{isEdit ? 'Update Category' : 'Create Category'}</span>
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
