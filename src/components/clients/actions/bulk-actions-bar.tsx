/**
 * BulkActionsBar Component
 * Floating action bar for bulk operations
 */

'use client';

import { motion } from 'framer-motion';
import { X, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/lib/utils/animation-variants';

export interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onExport,
}: BulkActionsBarProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/95 px-6 py-3 shadow-lg backdrop-blur-md transition-colors duration-200">
        {/* Selected Count */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="h-8"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-8 w-8 rounded-full"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
