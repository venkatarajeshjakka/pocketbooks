/**
 * Asset Detail Page
 * Server component that fetches asset data and renders the AssetDetailView
 */

import { notFound } from 'next/navigation';
import { AssetDetailView } from '@/components/assets/asset-detail-view';
import { Asset } from '@/models';
import { connectToDatabase } from '@/lib/api-helpers';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;

  let asset;
  try {
    await connectToDatabase();
    asset = await Asset.findById(id).populate('vendorId').lean();

    if (!asset) {
      notFound();
    }
  } catch (error) {
    console.error('Failed to fetch asset:', error);
    notFound();
  }

  // Serialize the asset data for the client component
  const serializedAsset = JSON.parse(JSON.stringify(asset));

  return <AssetDetailView asset={serializedAsset} assetId={id} />;
}

export async function generateMetadata({ params }: AssetDetailPageProps) {
  const { id } = await params;

  try {
    await connectToDatabase();
    const asset = await Asset.findById(id).lean();

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
