/**
 * ViewToggle Component
 * Toggle between grid and table view modes
 */

'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'table';

export interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1 transition-colors duration-200">
      {/* Animated background */}
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-background shadow-sm"
        animate={{
          x: view === 'grid' ? 4 : 'calc(100% + 4px)',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'relative z-10 h-8 w-20 transition-colors',
          view === 'grid' && 'text-foreground',
          view !== 'grid' && 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
      >
        <LayoutGrid className="mr-2 h-4 w-4" />
        Grid
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'relative z-10 h-8 w-20 transition-colors',
          view === 'table' && 'text-foreground',
          view !== 'table' && 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onViewChange('table')}
        aria-label="Table view"
        aria-pressed={view === 'table'}
      >
        <LayoutList className="mr-2 h-4 w-4" />
        Table
      </Button>
    </div>
  );
}
