/**
 * AdvancedFilters Component
 * Filter panel with status, outstanding balance, and other filters
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { useClientFilters } from '@/lib/hooks/use-client-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EntityStatus } from '@/types';
import { fadeInUp } from '@/lib/utils/animation-variants';

export function AdvancedFilters() {
  const { activeFilters, setFilter, clearFilters, hasActiveFilters } = useClientFilters();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="secondary" className="h-5">
                  {Object.values(activeFilters).filter(Boolean).length}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-xs">
            Status
          </Label>
          <Select
            value={activeFilters.status || 'all'}
            onValueChange={(value) =>
              setFilter('status', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="status-filter" className="h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={EntityStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={EntityStatus.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Outstanding Balance Filter */}
        <div className="space-y-2">
          <Label htmlFor="outstanding-filter" className="text-xs">
            Outstanding Balance
          </Label>
          <Select
            value={activeFilters.hasOutstanding ? 'true' : 'all'}
            onValueChange={(value) =>
              setFilter('hasOutstanding', value === 'true' ? true : undefined)
            }
          >
            <SelectTrigger id="outstanding-filter" className="h-9">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              <SelectItem value="true">With outstanding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {activeFilters.status && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 text-xs transition-colors hover:bg-secondary/80"
              >
                Status: {activeFilters.status}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-sm hover:bg-muted"
                  onClick={() => setFilter('status', undefined)}
                  aria-label="Remove status filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.hasOutstanding && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 text-xs transition-colors hover:bg-secondary/80"
              >
                Has outstanding
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-sm hover:bg-muted"
                  onClick={() => setFilter('hasOutstanding', undefined)}
                  aria-label="Remove outstanding balance filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
