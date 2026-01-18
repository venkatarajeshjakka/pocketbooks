/**
 * VendorForm Component
 *
 * Wrapper around the generic EntityForm for vendors
 * with vendor-specific configuration
 */

'use client';

import { EntityForm, VendorFormData, EntityFormConfig } from '@/components/shared/entity';
import { IVendor, IVendorInput } from '@/types';
import { useCreateVendor, useUpdateVendor, useVendor } from '@/lib/hooks/use-vendors';
import { Loader2 } from 'lucide-react';

interface VendorFormProps {
  mode: 'create' | 'edit';
  vendorId?: string;
  initialData?: IVendor;
}

export function VendorForm({ mode, vendorId, initialData }: VendorFormProps) {
  const { data: vendorResponse, isLoading: isFetching } = useVendor(vendorId || '', {
    enabled: mode === 'edit' && !!vendorId && !initialData,
  });

  const vendorData = initialData || vendorResponse;

  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();
  const isSubmitting = createVendorMutation.isPending || updateVendorMutation.isPending;

  if (mode === 'edit' && isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const config: EntityFormConfig = {
    entityType: 'vendor',
    mode,
    entityId: vendorId,
    returnPath: '/vendors',
    showSpecialty: true,
    showRawMaterialTypes: true,
  };

  const handleSubmit = async (data: VendorFormData): Promise<{ _id?: string | { toString(): string } } | void> => {
    const input: IVendorInput = {
      name: data.name,
      email: data.email,
      contactPerson: data.contactPerson,
      phone: data.phone,
      address: data.address,
      status: data.status,
      gstNumber: data.gstNumber,
      specialty: data.specialty,
      rawMaterialTypes: data.rawMaterialTypes,
    };

    if (mode === 'create') {
      const response = await createVendorMutation.mutateAsync(input);
      return { _id: response.data?._id };
    } else if (mode === 'edit' && vendorId) {
      await updateVendorMutation.mutateAsync({ id: vendorId, input });
    }
  };

  // Transform IVendor to VendorFormData for initial data
  const formInitialData: VendorFormData | undefined = vendorData
    ? {
      name: vendorData.name,
      email: vendorData.email,
      contactPerson: vendorData.contactPerson,
      phone: vendorData.phone,
      address: vendorData.address,
      status: vendorData.status,
      gstNumber: vendorData.gstNumber,
      specialty: vendorData.specialty,
      rawMaterialTypes: vendorData.rawMaterialTypes,
    }
    : undefined;

  return (
    <EntityForm<VendorFormData>
      config={config}
      initialData={formInitialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
