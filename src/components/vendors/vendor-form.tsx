/**
 * VendorForm Component
 *
 * Wrapper around the generic EntityForm for vendors
 * with vendor-specific configuration
 */

'use client';

import { EntityForm, VendorFormData, EntityFormConfig } from '@/components/shared/entity';
import { IVendor, IVendorInput } from '@/types';
import { useCreateVendor, useUpdateVendor } from '@/lib/hooks/use-vendors';

interface VendorFormProps {
  mode: 'create' | 'edit';
  vendorId?: string;
  initialData?: IVendor;
}

export function VendorForm({ mode, vendorId, initialData }: VendorFormProps) {
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();
  const isSubmitting = createVendorMutation.isPending || updateVendorMutation.isPending;

  const config: EntityFormConfig = {
    entityType: 'vendor',
    mode,
    entityId: vendorId,
    returnPath: '/vendors',
    showSpecialty: true,
    showRawMaterialTypes: false, // TODO: Add support for this in the form
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
  const formInitialData: VendorFormData | undefined = initialData
    ? {
        name: initialData.name,
        email: initialData.email,
        contactPerson: initialData.contactPerson,
        phone: initialData.phone,
        address: initialData.address,
        status: initialData.status,
        gstNumber: initialData.gstNumber,
        specialty: initialData.specialty,
        rawMaterialTypes: initialData.rawMaterialTypes,
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
