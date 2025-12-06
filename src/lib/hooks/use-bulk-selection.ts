/**
 * Custom Hook: useBulkSelection
 * Manages bulk selection of clients for batch operations
 */

'use client';

import { useCallback, useState, useMemo } from 'react';

export interface UseBulkSelectionReturn<T> {
  selectedItems: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  toggleAll: (items: T[], getId: (item: T) => string) => void;
  clearSelection: () => void;
  selectedCount: number;
  hasSelection: boolean;
  isAllSelected: (items: T[], getId: (item: T) => string) => boolean;
}

export function useBulkSelection<T>(): UseBulkSelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const selectedCount = useMemo(() => selectedItems.size, [selectedItems]);
  const hasSelection = selectedCount > 0;

  const isSelected = useCallback(
    (id: string) => {
      return selectedItems.has(id);
    },
    [selectedItems]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isAllSelected = useCallback(
    (items: T[], getId: (item: T) => string) => {
      if (items.length === 0) return false;
      return items.every((item) => selectedItems.has(getId(item)));
    },
    [selectedItems]
  );

  const toggleAll = useCallback(
    (items: T[], getId: (item: T) => string) => {
      const allSelected = isAllSelected(items, getId);

      setSelectedItems((prev) => {
        const next = new Set(prev);

        if (allSelected) {
          // Deselect all
          items.forEach((item) => {
            next.delete(getId(item));
          });
        } else {
          // Select all
          items.forEach((item) => {
            next.add(getId(item));
          });
        }

        return next;
      });
    },
    [isAllSelected]
  );

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    selectedItems,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectedCount,
    hasSelection,
    isAllSelected,
  };
}
