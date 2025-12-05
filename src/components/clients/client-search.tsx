/**
 * Client Search Component
 *
 * Search and filter controls for the clients list
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityStatus } from '@/types';

export function ClientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const currentStatus = searchParams.get('status') || 'all';

  const handleSearch = (value: string) => {
    setSearch(value);
    updateParams({ search: value });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === 'all' ? '' : value });
  };

  const clearFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push('/clients');
    });
  };

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.delete('page');

    startTransition(() => {
      router.push(`/clients?${params.toString()}`);
    });
  };

  const hasFilters = search || currentStatus !== 'all';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients by name, email, or contact person..."
            className="pl-8"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={currentStatus}
          onValueChange={handleStatusChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={EntityStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={EntityStatus.INACTIVE}>Inactive</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
