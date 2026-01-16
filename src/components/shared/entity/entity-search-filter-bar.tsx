/**
 * EntitySearchFilterBar Component
 * Generic search, filter, view toggle, and actions bar for entities (clients/vendors)
 */

'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, PlusCircle, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEntitySearch } from '@/lib/hooks/use-entity-search';
import { useEntityFilters } from '@/lib/hooks/use-entity-filters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ViewToggle, ViewMode } from './view-toggle';
import { EntityStatus } from '@/types';
import { fadeInUp } from '@/lib/utils/animation-variants';

export interface EntitySearchFilterBarProps {
  entityType: 'client' | 'vendor' | 'asset' | 'payment' | 'expense' | 'loan' | 'interest-payment' | 'raw-material' | 'trading-good' | 'finished-good' | 'raw-material-procurement' | 'trading-good-procurement';
  addNewPath: string;
  addNewLabel?: string;
  addNewIcon?: LucideIcon;
  searchPlaceholder?: string;
  showStatusFilter?: boolean;
  showOutstandingFilter?: boolean;
  outstandingFilterLabel?: string;
  statusOptions?: { label: string; value: string }[];
}

export function EntitySearchFilterBar({
  entityType,
  addNewPath,
  addNewLabel,
  addNewIcon: AddNewIcon = PlusCircle,
  searchPlaceholder,
  showStatusFilter = true,
  showOutstandingFilter = true,
  outstandingFilterLabel,
  statusOptions,
}: EntitySearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const entityLabel =
    entityType === 'client' ? 'Client' :
      entityType === 'vendor' ? 'Vendor' :
        entityType === 'asset' ? 'Asset' :
          entityType === 'expense' ? 'Expense' :
            entityType === 'loan' ? 'Loan Account' :
              entityType === 'interest-payment' ? 'Interest Payment' :
                entityType === 'raw-material' ? 'Raw Material' :
                  entityType === 'trading-good' ? 'Trading Good' :
                    entityType === 'finished-good' ? 'Finished Good' :
                      entityType === 'raw-material-procurement' ? 'Raw Material Order' :
                        entityType === 'trading-good-procurement' ? 'Trading Good Order' :
                          'Payment';
  const defaultSearchPlaceholder = `Search ${entityType}s...`;
  const defaultAddNewLabel = `Add ${entityLabel}`;
  const defaultOutstandingLabel = entityType === 'client' ? 'With outstanding' : 'With payable';

  // Get view mode from URL params, default to 'table'
  const viewMode = (searchParams.get('view') as ViewMode) || 'table';

  const handleViewChange = useCallback((newView: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const { searchQuery, setSearchQuery, clearSearch, isSearching } = useEntitySearch();
  const { activeFilters, setFilter } = useEntityFilters();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-accent/5 backdrop-blur-md p-4 rounded-2xl border border-border/10"
    >
      {/* Left: Search Bar */}
      <div className="relative flex-1 lg:max-w-md">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Search className="h-4 w-4 text-muted-foreground/60" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Input
          type="search"
          placeholder={searchPlaceholder || defaultSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-11 pr-10 bg-background/50 border-border/50 rounded-xl transition-all focus:ring-2 focus:ring-primary/10 hover:bg-background/80"
          aria-label={`Search ${entityType}s`}
        />

        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted"
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
        {showStatusFilter && (
          <Select
            value={activeFilters.status || 'all'}
            onValueChange={(value) =>
              setFilter('status', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="h-11 w-[150px] bg-background/50 border-border/50 rounded-xl hover:bg-background/80 transition-all">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions ? (
                statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value={EntityStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={EntityStatus.INACTIVE}>Inactive</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )}

        {/* Outstanding/Payable Filter */}
        {showOutstandingFilter && (
          <Select
            value={activeFilters.hasOutstanding ? 'true' : 'all'}
            onValueChange={(value) =>
              setFilter('hasOutstanding', value === 'true' ? true : undefined)
            }
          >
            <SelectTrigger className="h-11 w-[190px] bg-background/50 border-border/50 rounded-xl hover:bg-background/80 transition-all">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="all">All {entityType}s</SelectItem>
              <SelectItem value="true">{outstandingFilterLabel || defaultOutstandingLabel}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Right: View Toggle & Add Button */}
      <div className="flex items-center gap-4">
        <ViewToggle view={viewMode} onViewChange={handleViewChange} />

        <Button
          asChild
          size="default"
          className="h-11 rounded-xl px-5 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
        >
          <Link href={addNewPath}>
            <AddNewIcon className="mr-2 h-5 w-5" />
            {addNewLabel || defaultAddNewLabel}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
