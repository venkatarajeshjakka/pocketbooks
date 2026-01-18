/**
 * Edit Asset Page
 *
 * Page for editing an existing asset
 */

import { Suspense } from 'react';
import { AssetForm } from '@/components/assets/asset-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Asset | PocketBooks',
  description: 'Update asset information',
};

export default async function EditAssetPage({ params }: EditAssetPageProps) {
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
          <AssetForm mode="edit" assetId={id} />
        </Suspense>
      </div>
    </div>
  );
}
