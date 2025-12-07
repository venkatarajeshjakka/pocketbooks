/**
 * UnifiedSearchFilterBar Component
 * Combines search, filters, view toggle, and actions in a single row
 */

'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClientSearch } from '@/lib/hooks/use-client-search';
import { useClientFilters } from '@/lib/hooks/use-client-filters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ViewToggle, ViewMode } from '../list/view-toggle';
import { EntityStatus } from '@/types';
import { fadeInUp } from '@/lib/utils/animation-variants';

export interface UnifiedSearchFilterBarProps {
  // Props removed - now using URL params for view mode
}

export function UnifiedSearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get view mode from URL params, default to 'table'
  const viewMode = (searchParams.get('view') as ViewMode) || 'table';

  const handleViewChange = useCallback((newView: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const { searchQuery, setSearchQuery, clearSearch, isSearching } = useClientSearch();
  const { activeFilters, setFilter } = useClientFilters();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      {/* Left: Search Bar */}
      <div className="relative flex-1 lg:max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Input
          type="search"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-10 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
          aria-label="Search clients"
        />

        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-muted"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center: Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <Select
          value={activeFilters.status || 'all'}
          onValueChange={(value) =>
            setFilter('status', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className="h-11 w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={EntityStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={EntityStatus.INACTIVE}>Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Outstanding Balance Filter */}
        <Select
          value={activeFilters.hasOutstanding ? 'true' : 'all'}
          onValueChange={(value) =>
            setFilter('hasOutstanding', value === 'true' ? true : undefined)
          }
        >
          <SelectTrigger className="h-11 w-[180px]">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            <SelectItem value="true">With outstanding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right: View Toggle & Add Client Button */}
      <div className="flex items-center gap-3">
        <ViewToggle view={viewMode} onViewChange={handleViewChange} />

        <Button
          asChild
          size="default"
          className="h-11 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Client
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
