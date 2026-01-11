/**
 * Asset Detail Page
 * Server component that fetches asset data and renders the AssetDetailView
 */

import { notFound } from 'next/navigation';
import { AssetDetailView } from '@/components/assets/asset-detail-view';
import { fetchAsset } from '@/lib/api/assets';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;

  let asset;
  try {
    const response = await fetchAsset(id);
    asset = response.data;

    if (!asset) {
      notFound();
    }
  } catch (error) {
    console.error('Failed to fetch asset:', error);
    notFound();
  }

  return <AssetDetailView asset={asset as any} assetId={id} />;
}

export async function generateMetadata({ params }: AssetDetailPageProps) {
  const { id } = await params;

  try {
    const response = await fetchAsset(id);
    const asset = response.data;

    if (asset) {
      return {
        title: `${asset.name} | Assets | PocketBooks`,
        description: `View details for ${asset.name}`,
      };
    }
  } catch (error) {
    console.error('Failed to fetch asset for metadata:', error);
  }

  return {
    title: 'Asset Details | PocketBooks',
    description: 'View asset details and payment history',
  };
}
