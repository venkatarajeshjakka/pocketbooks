/**
 * EntityListContainer Component
 * Generic container for entity list with view toggle, bulk selection, and actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IClient, IVendor } from '@/types';
import { EntityGridView } from './entity-grid-view';
import { EntityTableView } from './entity-table-view';
import { ViewMode } from '@/components/clients/list/view-toggle';
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection';
import { BulkActionsBar } from '@/components/clients/actions/bulk-actions-bar';
import { DeleteEntityDialog } from './delete-entity-dialog';
import { toast } from 'sonner';

export type EntityType = IClient | IVendor;

export interface EntityListContainerProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor';
  initialView?: ViewMode;
  basePath: string;
  onDelete: (id: string) => Promise<void>;
}

export function EntityListContainer<T extends EntityType>({
  entities,
  entityType,
  initialView = 'table',
  basePath,
  onDelete,
}: EntityListContainerProps<T>) {
  const router = useRouter();
  const viewMode = initialView;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    selectedItems,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectedCount,
    hasSelection,
    isAllSelected,
  } = useBulkSelection<T>();

  const handleToggleAll = () => {
    toggleAll(entities, (entity) => entity._id.toString());
  };

  const handleEdit = (entityId: string) => {
    router.push(`${basePath}/${entityId}/edit`);
  };

  const handleDelete = (entityId: string) => {
    const entity = entities.find((e) => e._id.toString() === entityId);
    if (entity) {
      setEntityToDelete({ id: entityId, name: entity.name });
      setDeleteDialogOpen(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;

    const firstSelectedId = Array.from(selectedItems)[0];
    const entity = entities.find((e) => e._id.toString() === firstSelectedId);
    if (entity) {
      setEntityToDelete({ id: firstSelectedId, name: entity.name });
      setDeleteDialogOpen(true);
    }
  };

  const handleExport = () => {
    toast.info('Export feature', {
      description: 'Export functionality coming soon!',
    });
  };

  const allSelected = isAllSelected(entities, (entity) => entity._id.toString());
  const entityLabel = entityType === 'client' ? 'client' : 'vendor';

  return (
    <div className="space-y-4">
      {/* Entity count */}
      <div className="text-sm text-muted-foreground">
        {entities.length} {entityLabel}{entities.length !== 1 ? 's' : ''}
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          onDelete={handleBulkDelete}
          onExport={handleExport}
        />
      )}

      {/* Entity List Views */}
      {viewMode === 'grid' ? (
        <EntityGridView
          entities={entities}
          entityType={entityType}
          selectedEntities={selectedItems}
          onToggleSelection={toggleSelection}
          onEdit={handleEdit}
          onDelete={handleDelete}
          basePath={basePath}
        />
      ) : (
        <EntityTableView
          entities={entities}
          entityType={entityType}
          selectedEntities={selectedItems}
          onToggleSelection={toggleSelection}
          onToggleAll={handleToggleAll}
          isAllSelected={allSelected}
          onEdit={handleEdit}
          onDelete={handleDelete}
          basePath={basePath}
        />
      )}

      {/* Delete Entity Dialog */}
      {entityToDelete && (
        <DeleteEntityDialog
          entityId={entityToDelete.id}
          entityName={entityToDelete.name}
          entityType={entityType}
          open={deleteDialogOpen}
          basePath={basePath}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setEntityToDelete(null);
              clearSelection();
            }
          }}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
