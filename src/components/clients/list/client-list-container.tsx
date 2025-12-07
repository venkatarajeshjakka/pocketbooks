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
import { DeleteConfirmation } from '../actions/delete-confirmation';
import { useDeleteClient } from '@/lib/hooks/use-clients';
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
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Use React Query mutation hook for delete
  const deleteClientMutation = useDeleteClient();

  const {
    selectedItems,
    isSelected,
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
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;

    // For bulk delete, we'll delete the first selected item as confirmation
    // In production, you'd want a different confirmation dialog for bulk actions
    const firstSelectedId = Array.from(selectedItems)[0];
    setClientToDelete(firstSelectedId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    // Use the mutation hook - it handles cache invalidation automatically
    await deleteClientMutation.mutateAsync(clientToDelete);

    // Close dialog and clear selection
    setDeleteDialogOpen(false);
    setClientToDelete(null);
    clearSelection();
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={deleteClientMutation.isPending}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
      />
    </div>
  );
}
