/**
 * Edit Vendor Page
 *
 * Page for editing an existing vendor
 */

import { Suspense } from 'react';
import { VendorForm } from '@/components/vendors/vendor-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditVendorPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Vendor | PocketBooks',
  description: 'Update vendor information',
};

export default async function EditVendorPage({ params }: EditVendorPageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        <Suspense
          fallback={
            <div className="space-y-8">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          }
        >
          <VendorForm mode="edit" vendorId={id} />
        </Suspense>
      </div>
    </div>
  );
}
