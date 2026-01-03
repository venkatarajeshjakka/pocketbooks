/**
 * Asset Detail Page
 *
 * Displays detailed information about a single asset
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Monitor, Pencil, MapPin, Building2, Calendar, Tag, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAsset } from '@/lib/api/assets';
import { cn } from '@/lib/utils';
import { AssetStatus } from '@/types';
import { format } from 'date-fns';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AssetDetailPageProps) {
  const { id } = await params;
  try {
    const asset = await fetchAsset(id);
    return {
      title: `${asset.name} | Assets | PocketBooks`,
      description: `View details for asset ${asset.name}`,
    };
  } catch {
    return {
      title: 'Asset Not Found | PocketBooks',
    };
  }
}

function getStatusBadgeStyles(status: AssetStatus) {
  switch (status) {
    case AssetStatus.ACTIVE:
      return 'bg-success/10 text-success border-success/20';
    case AssetStatus.REPAIR:
      return 'bg-warning/10 text-warning border-warning/20';
    case AssetStatus.RETIRED:
      return 'bg-muted text-muted-foreground border-border';
    case AssetStatus.DISPOSED:
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;

  let asset;
  try {
    asset = await fetchAsset(id);
  } catch (error) {
    console.error('Error fetching asset:', error);
    notFound();
  }

  const depreciation = asset.purchasePrice - asset.currentValue;
  const depreciationPercentage = asset.purchasePrice > 0
    ? ((depreciation / asset.purchasePrice) * 100).toFixed(1)
    : '0';

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8 p-6">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/assets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
              <Monitor className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
                <Badge
                  variant="outline"
                  className={cn('text-xs capitalize', getStatusBadgeStyles(asset.status))}
                >
                  {asset.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {asset.category.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <Button asChild>
          <Link href={`/assets/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Asset
          </Link>
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Asset Information */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5 text-primary" />
              Asset Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</p>
                <p className="text-sm font-medium mt-1">{asset.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</p>
              <p className="text-sm font-medium mt-1 capitalize">{asset.category.replace('_', ' ')}</p>
            </div>
            {asset.serialNumber && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Serial Number</p>
                <p className="text-sm font-mono font-medium mt-1">{asset.serialNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Vendor */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Location & Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.location ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium mt-1">{asset.location}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</p>
                <p className="text-sm text-muted-foreground mt-1">Not specified</p>
              </div>
            )}
            {asset.vendorId && typeof asset.vendorId === 'object' && 'name' in asset.vendorId ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchased From</p>
                <Link
                  href={`/vendors/${(asset.vendorId as any)._id}`}
                  className="text-sm font-medium mt-1 text-primary hover:underline block"
                >
                  {(asset.vendorId as any).name}
                </Link>
              </div>
            ) : asset.vendorId ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendor ID</p>
                <p className="text-sm font-mono font-medium mt-1">{String(asset.vendorId)}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchase Price</p>
              <p className="text-2xl font-bold mt-1">
                {'\u20B9'}{asset.purchasePrice.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Value</p>
              <p
                className={cn(
                  'text-2xl font-bold mt-1',
                  asset.currentValue < asset.purchasePrice ? 'text-warning' : 'text-success'
                )}
              >
                {'\u20B9'}{asset.currentValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Depreciation</p>
              <p className="text-sm font-medium mt-1 text-destructive">
                {'\u20B9'}{depreciation.toLocaleString('en-IN')} ({depreciationPercentage}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Date Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Purchase Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchase Date</p>
              <p className="text-sm font-medium mt-1">
                {format(new Date(asset.purchaseDate), 'dd MMMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Age</p>
              <p className="text-sm font-medium mt-1">
                {Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years,{' '}
                {Math.floor(((Date.now() - new Date(asset.purchaseDate).getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))} months
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
              <Badge
                variant="outline"
                className={cn('text-xs capitalize mt-1', getStatusBadgeStyles(asset.status))}
              >
                {asset.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground">
        <p>
          Created: {new Date(asset.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          {' '}&bull;{' '}
          Updated: {new Date(asset.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </p>
      </div>
    </div>
  );
}
