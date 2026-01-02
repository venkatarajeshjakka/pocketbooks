'use client';

import { RotateCw, Pencil, Trash2, Loader2, Plus, ListFilter, X } from 'lucide-react';
import { useRawMaterialTypes, useDeleteRawMaterialType } from '@/lib/hooks/use-raw-material-types';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { QuickAddRawMaterialType } from './quick-add-raw-material-type';
import { motion, AnimatePresence } from 'framer-motion';

export function RawMaterialTypesManager() {
    const { data, isLoading, refetch, isFetching } = useRawMaterialTypes();
    const deleteMutation = useDeleteRawMaterialType();

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-muted/20 border-b border-border/30">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight">Raw Material Types</CardTitle>
                    <CardDescription className="text-sm font-medium">
                        Manage your procurement categories as interactive tags
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-border/10 bg-background/50 hover:bg-background transition-colors"
                        onClick={() => refetch()}
                        disabled={isLoading || isFetching}
                    >
                        <RotateCw className={cn("h-4 w-4 text-muted-foreground", (isLoading || isFetching) && "animate-spin")} />
                    </Button>
                    <QuickAddRawMaterialType
                        trigger={
                            <Button size="sm" className="h-9 font-semibold shadow-lg shadow-primary/10">
                                <Plus className="mr-2 h-4 w-4" /> Add Type
                            </Button>
                        }
                    />
                </div>
            </CardHeader>
            <CardContent className="px-6 py-2 space-y-6">
                <div className="min-h-[120px] rounded-2xl border border-dashed border-border/60 bg-muted/5 p-6 flex flex-wrap gap-3 content-start">
                    {isLoading ? (
                        <div className="w-full flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                            <Loader2 className="h-8 w-8 animate-spin opacity-50" />
                            <p className="text-sm font-medium animate-pulse">Syncing tags...</p>
                        </div>
                    ) : data?.data?.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center py-8 text-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/40">
                                <ListFilter className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">No Categories Found</p>
                                <p className="text-xs text-muted-foreground">Click 'Add Type' to initialize your master data.</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {data?.data.map((type: any) => (
                                <motion.div
                                    key={type._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.1 } }}
                                    className="group relative"
                                >
                                    <div className="flex items-center gap-0 overflow-hidden rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 pl-4 transition-all duration-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                                        <QuickAddRawMaterialType
                                            mode="edit"
                                            initialData={{
                                                id: type._id,
                                                name: type.name,
                                                description: type.description
                                            }}
                                            trigger={
                                                <button className="h-9 font-semibold text-sm text-primary py-2 pr-2 tracking-tight flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary/30 rounded-l-full">
                                                    {type.name}
                                                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                                                </button>
                                            }
                                        />

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button className="h-9 w-9 flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 border-l border-primary/10 transition-colors outline-none focus:ring-2 focus:ring-destructive/30">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="font-bold flex items-center gap-2">
                                                        <Trash2 className="h-5 w-5 text-destructive" />
                                                        Remove Category?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-muted-foreground font-medium">
                                                        "{type.name}" will be removed from future selection.
                                                        Historical data remains safe.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-2">
                                                    <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteMutation.mutate(type._id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <p className="text-[11px] text-muted-foreground px-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                    Interactive Cloud: Click a tag to edit, 'x' to remove. Use 'Add Type' for new categories.
                </p>
            </CardContent>
        </Card>
    );
}
