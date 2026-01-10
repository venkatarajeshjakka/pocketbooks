/**
 * Edit Asset Page
 *
 * Page for editing an existing asset
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AssetForm } from '@/components/assets/asset-form';
import { fetchAsset } from '@/lib/api/assets';

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditAssetPageProps) {
  const { id } = await params;
  try {
    const response = await fetchAsset(id);
    if (response.success && response.data) {
      return {
        title: `Edit ${response.data.name} | Assets | PocketBooks`,
        description: `Edit asset ${response.data.name}`,
      };
    }
    return {
      title: 'Asset Not Found | PocketBooks',
    };
  } catch {
    return {
      title: 'Asset Not Found | PocketBooks',
    };
  }
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id } = await params;

  let asset;
  try {
    const response = await fetchAsset(id);
    if (!response.success || !response.data) {
      notFound();
    }
    asset = response.data;
  } catch (error) {
    console.error('Error fetching asset:', error);
    notFound();
  }

  return (
    <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
      {/* Page Header */}
      <div className="mx-auto w-full max-w-4xl mb-10">
        <Link
          href={`/assets/${id}`}
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
        >
          <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Asset
        </Link>
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">
            Edit Asset
          </h1>
          <p className="text-base text-muted-foreground mt-3 font-medium max-w-2xl leading-relaxed">
            Update asset information, status, and valuation details.
          </p>
        </div>
      </div>

      {/* Asset Form */}
      <div className="mx-auto w-full max-w-4xl">
        <AssetForm mode="edit" assetId={id} initialData={asset} />
      </div>
    </div>
  );
}
