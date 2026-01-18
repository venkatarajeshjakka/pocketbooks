/**
 * Asset Detail Page
 * Server component that fetches asset data and renders the AssetDetailView
 */

import { Suspense } from 'react';
import { AssetDetailContainer } from '@/components/assets/asset-detail-container';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <AssetDetailContainer id={id} />
    </Suspense>
  );
}

export const metadata = {
  title: 'Asset Details | PocketBooks',
  description: 'View asset details and payment history',
};
