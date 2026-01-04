/**
 * AssetDetailView Component
 * Displays detailed asset information with payment history
 * Extracted from the asset detail page for better code organization
 */

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Monitor, ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetPaymentHistory } from '@/components/assets/asset-payment-history';
import { AssetDeleteButton } from '@/components/assets/asset-delete-button';
import { AssetStatusBadge, PaymentStatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { IAsset } from '@/types';

interface AssetDetailViewProps {
  asset: IAsset & { vendorId?: { name: string } };
  assetId: string;
}

export function AssetDetailView({ asset, assetId }: AssetDetailViewProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8">
      {/* Header */}
      <AssetDetailHeader asset={asset} assetId={assetId} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Asset Details */}
        <div className="lg:col-span-2 space-y-6">
          <AssetInformationCard asset={asset} />
          <AssetFinancialCard asset={asset} />
        </div>

        {/* Payment History */}
        <div className="lg:col-span-1">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            }
          >
            <AssetPaymentHistory assetId={assetId} assetName={asset.name} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * Asset Detail Header Component
 */
function AssetDetailHeader({ asset, assetId }: AssetDetailViewProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/assets">
          <Button variant="ghost" size="sm" aria-label="Go back to assets list">
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back to Assets
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
            <Monitor className="h-6 w-6 text-indigo-500" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{asset.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {asset.category ? asset.category.replace('_', ' ') : 'Unknown Category'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/assets/${assetId}/edit`}>
          <Button variant="outline" size="sm" aria-label={`Edit ${asset.name}`}>
            <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
            Edit
          </Button>
        </Link>
        <AssetDeleteButton assetId={assetId} assetName={asset.name} />
      </div>
    </div>
  );
}

/**
 * Asset Information Card Component
 */
function AssetInformationCard({ asset }: { asset: IAsset }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span id="status-label" className="text-sm font-medium text-muted-foreground">
              Status
            </span>
            <div className="flex items-center gap-2 mt-1" role="group" aria-labelledby="status-label">
              <AssetStatusBadge status={asset.status || 'active'} />
              <PaymentStatusBadge status={asset.paymentStatus || 'unpaid'} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Serial Number</span>
            <p className="mt-1 font-mono text-sm">{asset.serialNumber || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Location</span>
            <p className="mt-1">{asset.location || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Purchase Date</span>
            <p className="mt-1">{format(new Date(asset.purchaseDate), 'dd MMM yyyy')}</p>
          </div>
        </div>
        {asset.description && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Description</span>
            <p className="mt-1 text-sm">{asset.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Asset Financial Card Component
 */
function AssetFinancialCard({ asset }: { asset: IAsset }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Purchase Price</span>
            <p className="mt-1 text-lg font-bold">
              ₹{(asset.purchasePrice || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Current Value</span>
            <p className="mt-1 text-lg font-bold text-primary">
              ₹{(asset.currentValue || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
            <p className="mt-1 text-lg font-bold text-success">
              ₹{(asset.totalPaid || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Remaining Amount</span>
            <p
              className={cn(
                'mt-1 text-lg font-bold',
                (asset.remainingAmount || 0) > 0 ? 'text-destructive' : 'text-success'
              )}
            >
              ₹{(asset.remainingAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        {asset.gstEnabled && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">GST Percentage</span>
                <p className="mt-1">{asset.gstPercentage || 0}%</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">GST Amount</span>
                <p className="mt-1">₹{(asset.gstAmount || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
