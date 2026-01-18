/**
 * ClientForm Component
 *
 * Wrapper around the generic EntityForm for clients
 * with client-specific configuration
 */

'use client';

import { EntityForm, BaseEntityFormData, EntityFormConfig } from '@/components/shared/entity';
import { IClient, IClientInput } from '@/types';
import { useCreateClient, useUpdateClient, useClient } from '@/lib/hooks/use-clients';
import { Loader2 } from 'lucide-react';

interface ClientFormProps {
  mode: 'create' | 'edit';
  clientId?: string;
  initialData?: IClient;
}

export function ClientForm({ mode, clientId, initialData }: ClientFormProps) {
  const { data: clientResponse, isLoading: isFetching } = useClient(clientId || '', {
    enabled: mode === 'edit' && !!clientId && !initialData,
  });

  const clientData = initialData || clientResponse;

  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const isSubmitting = createClientMutation.isPending || updateClientMutation.isPending;

  if (mode === 'edit' && isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const config: EntityFormConfig = {
    entityType: 'client',
    mode,
    entityId: clientId,
    returnPath: '/clients',
    showSpecialty: false,
    showRawMaterialTypes: false,
  };

  const handleSubmit = async (data: BaseEntityFormData): Promise<{ _id?: string | { toString(): string } } | void> => {
    const input: IClientInput = {
      name: data.name,
      email: data.email,
      contactPerson: data.contactPerson,
      phone: data.phone,
      address: data.address,
      status: data.status,
      gstNumber: data.gstNumber,
    };

    if (mode === 'create') {
      const response = await createClientMutation.mutateAsync(input);
      return { _id: response.data?._id };
    } else if (mode === 'edit' && clientId) {
      await updateClientMutation.mutateAsync({ id: clientId, input });
    }
  };

  // Transform IClient to BaseEntityFormData for initial data
  const formInitialData: BaseEntityFormData | undefined = initialData
    ? {
      name: initialData.name,
      email: initialData.email,
      contactPerson: initialData.contactPerson,
      phone: initialData.phone,
      address: initialData.address,
      status: initialData.status,
      gstNumber: initialData.gstNumber,
    }
    : undefined;

  return (
    <EntityForm<BaseEntityFormData>
      config={config}
      initialData={formInitialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
