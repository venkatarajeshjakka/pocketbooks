/**
 * ClientListContainer Component
 * Main container for client list with view toggle, bulk selection, and actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IClient } from '@/types';
import { ClientGridView } from './client-grid-view';
import { ClientTableView } from './client-table-view';
import { ViewMode } from './view-toggle';
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection';
import { BulkActionsBar } from '../actions/bulk-actions-bar';
import { DeleteClientDialog } from '../delete-client-dialog';
import { toast } from 'sonner';

export interface ClientListContainerProps {
  clients: IClient[];
  initialView?: ViewMode;
}

export function ClientListContainer({
  clients,
  initialView = 'table',
}: ClientListContainerProps) {
  const router = useRouter();
  const viewMode = initialView;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
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
  } = useBulkSelection<IClient>();

  const handleToggleAll = () => {
    toggleAll(clients, (client) => client._id.toString());
  };

  const handleEdit = (clientId: string) => {
    router.push(`/clients/${clientId}/edit`);
  };

  const handleDelete = (clientId: string) => {
    const client = clients.find((c) => c._id.toString() === clientId);
    if (client) {
      setClientToDelete({ id: clientId, name: client.name });
      setDeleteDialogOpen(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;

    // For bulk delete, we'll delete the first selected item as confirmation
    // In production, you'd want a different confirmation dialog for bulk actions
    const firstSelectedId = Array.from(selectedItems)[0];
    const client = clients.find((c) => c._id.toString() === firstSelectedId);
    if (client) {
      setClientToDelete({ id: firstSelectedId, name: client.name });
      setDeleteDialogOpen(true);
    }
  };

  const handleExport = () => {
    // Export functionality will be implemented
    toast.info('Export feature', {
      description: 'Export functionality coming soon!',
    });
  };

  const allSelected = isAllSelected(clients, (client) => client._id.toString());

  return (
    <div className="space-y-4">
      {/* Client count */}
      <div className="text-sm text-muted-foreground">
        {clients.length} client{clients.length !== 1 ? 's' : ''}
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

      {/* Client List Views */}
      {viewMode === 'grid' ? (
        <ClientGridView
          clients={clients}
          selectedClients={selectedItems}
          onToggleSelection={toggleSelection}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ClientTableView
          clients={clients}
          selectedClients={selectedItems}
          onToggleSelection={toggleSelection}
          onToggleAll={handleToggleAll}
          isAllSelected={allSelected}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Delete Client Dialog */}
      {clientToDelete && (
        <DeleteClientDialog
          clientId={clientToDelete.id}
          clientName={clientToDelete.name}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setClientToDelete(null);
              clearSelection();
            }
          }}
        />
      )}
    </div>
  );
}
