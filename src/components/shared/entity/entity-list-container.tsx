/**
 * EntityListContainer Component
 * Generic container for entity list with view toggle, bulk selection, and actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IClient, IVendor, IAsset, IPayment, IExpense, ILoanAccount, IInterestPayment, IRawMaterialProcurement, ITradingGoodsProcurement, IRawMaterial, ITradingGood, IFinishedGood } from '@/types';
import { EntityGridView } from './entity-grid-view';
import { EntityTableView } from './entity-table-view';
import { ViewMode } from './view-toggle';
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection';
import { BulkActionsBar } from './bulk-actions-bar';
import { DeleteEntityDialog } from './delete-entity-dialog';
import { toast } from 'sonner';

export type EntityType = IClient | IVendor | IAsset | IPayment | IExpense | ILoanAccount | IInterestPayment | IRawMaterialProcurement | ITradingGoodsProcurement | IRawMaterial | ITradingGood | IFinishedGood;

export interface EntityListContainerProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor' | 'asset' | 'payment' | 'expense' | 'loan' | 'interest-payment' | 'procurement' | 'trading_good_procurement' | 'raw-material' | 'trading-good' | 'finished-good';
  initialView?: ViewMode;
  basePath: string;
  onDelete?: (id: string) => Promise<void>;
  getAffectedItems?: (entity: T) => any[]; // Simplified for prop
  // Support custom rendering (mostly for assets)
  renderCardContent?: (entity: T) => React.ReactNode;
  columns?: Array<{
    header: string;
    accessorKey?: string;
    cell?: (entity: T) => React.ReactNode;
  }>;
  canEdit?: boolean;
}

export function EntityListContainer<T extends EntityType>({
  entities,
  entityType,
  initialView = 'table',
  basePath,
  onDelete,
  renderCardContent,
  columns,
  canEdit = true,
}: EntityListContainerProps<T>) {
  const router = useRouter();
  const viewMode = initialView;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<{
    id: string | string[];
    name: string;
    affectedItems?: any[];
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
      const name = (entity as any).name || (entity as any).notes || (entity as any).bankName || (entity as any).description || 'Item';

      let affectedItems: any[] = [];

      if ((entityType as any) === 'expense') {
        affectedItems = [
          { label: 'Payment Record', description: 'The linked payment transaction will be permanently deleted.', severity: 'danger' }
        ];
      } else if ((entityType as any).includes('procurement')) {
        affectedItems = [
          { label: 'Payment Records', description: 'All associated payments for this procurement will be deleted.', severity: 'danger' },
          { label: 'Inventory Reversal', description: 'Any stock received from this procurement will be deducted from inventory.', severity: 'warning' }
        ];
      } else if ((entityType as any) === 'asset') {
        affectedItems = [
          { label: 'Asset Payments', description: 'All recorded payments for this asset will be permanently deleted.', severity: 'danger' },
          { label: 'Vendor Balance', description: 'The vendor\'s outstanding balance will be reduced by the remaining asset cost.', severity: 'info' }
        ];
      } else if ((entityType as any) === 'interest-payment') {
        affectedItems = [
          { label: 'Loan Reversal', description: 'The principal and interest paid will be added back to the loan balance.', severity: 'warning' },
          { label: 'Linked Records', description: 'The associated expense and payment records will be deleted.', severity: 'danger' }
        ];
      } else if ((entityType as any) === 'loan') {
        affectedItems = [
          { label: 'Integrity Check', description: 'This loan can only be deleted if there are no interest payments recorded.', severity: 'info' }
        ];
      } else if ((entityType as any) === 'client') {
        affectedItems = [
          { label: 'Sales Records', description: 'This client cannot be deleted if there are existing sales associated with them.', severity: 'warning' },
          { label: 'Payment History', description: 'Deletion will be blocked if any payments are linked to this client.', severity: 'danger' }
        ];
      } else if ((entityType as any) === 'vendor') {
        affectedItems = [
          { label: 'Asset Records', description: 'This vendor cannot be deleted if there are assets linked to them.', severity: 'warning' },
          { label: 'Procurements', description: 'Any associated raw material or trading good procurements will block deletion.', severity: 'danger' },
          { label: 'Payment History', description: 'Deletion will be blocked if any payments are linked to this vendor.', severity: 'info' }
        ];
      } else if ((entityType as any) === 'raw-material') {
        affectedItems = [
          { label: 'Bill of Materials', description: 'Deletion will be blocked if this material is part of a Finished Good BOM.', severity: 'warning' },
          { label: 'Procurements', description: 'Any recorded procurements for this material will block deletion.', severity: 'danger' }
        ];
      } else if ((entityType as any) === 'trading-good') {
        affectedItems = [
          { label: 'Procurements', description: 'Associated procurement records will block the deletion of this good.', severity: 'danger' },
          { label: 'Sales History', description: 'Any sales involving this trading good must be deleted first.', severity: 'warning' }
        ];
      } else if ((entityType as any) === 'finished-good') {
        affectedItems = [
          { label: 'Sales History', description: 'Any sales involving this finished good will block its deletion.', severity: 'warning' }
        ];
      }

      setEntityToDelete({ id: entityId, name, affectedItems });
      setDeleteDialogOpen(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;

    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 1) {
      const entity = entities.find((e) => e._id.toString() === selectedIds[0]);
      if (entity) {
        setEntityToDelete({ id: selectedIds[0], name: (entity as any).name || (entity as any).notes || 'Payment' });
      }
    } else {
      setEntityToDelete({
        id: selectedIds,
        name: `${selectedCount} ${entityType}${selectedCount !== 1 ? 's' : ''}`,
      });
    }
    setDeleteDialogOpen(true);
  };

  const handleExport = () => {
    toast.info('Export feature', {
      description: 'Export functionality coming soon!',
    });
  };

  const allSelected = isAllSelected(entities, (entity) => entity._id.toString());
  const entityLabel = entityType === 'client' ? 'client' : entityType === 'vendor' ? 'vendor' : entityType === 'expense' ? 'expense' : entityType === 'payment' ? 'payment' : entityType === 'loan' ? 'loan account' : entityType === 'interest-payment' ? 'interest payment' : entityType === 'raw-material' ? 'raw material' : entityType === 'trading-good' ? 'trading good' : entityType === 'finished-good' ? 'finished good' : 'asset';

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
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={onDelete ? handleDelete : undefined}
          basePath={basePath}
          renderCardContent={renderCardContent}
        />
      ) : (
        <EntityTableView
          entities={entities}
          entityType={entityType}
          selectedEntities={selectedItems}
          onToggleSelection={toggleSelection}
          onToggleAll={handleToggleAll}
          isAllSelected={allSelected}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={onDelete ? handleDelete : undefined}
          basePath={basePath}
          columns={columns}
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
          onDelete={onDelete!}
          affectedItems={entityToDelete.affectedItems}
        />
      )}
    </div>
  );
}
