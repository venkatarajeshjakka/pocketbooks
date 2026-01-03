/**
 * Asset Detail Page
 * Shows detailed asset information with payment history
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Monitor, ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetPaymentHistory } from '@/components/assets/asset-payment-history';
import { AssetDeleteButton } from '@/components/assets/asset-delete-button';
import { Asset } from '@/models';
import { connectToDatabase } from '@/lib/api-helpers';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssetDetailPageProps {
    params: Promise<{ id: string }>;
}

function getStatusBadgeStyles(status: string) {
    switch (status) {
        case 'active':
            return 'bg-success/10 text-success border-success/20';
        case 'repair':
            return 'bg-warning/10 text-warning border-warning/20';
        case 'retired':
            return 'bg-muted text-muted-foreground border-border';
        case 'disposed':
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

function getPaymentStatusBadgeStyles(status: string) {
    switch (status) {
        case 'fully_paid':
            return 'bg-success/10 text-success border-success/20';
        case 'partially_paid':
            return 'bg-warning/10 text-warning border-warning/20';
        case 'unpaid':
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
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

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/assets">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Assets
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
                            <Monitor className="h-6 w-6 text-indigo-500" />
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
                    <Link href={`/assets/${id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <AssetDeleteButton assetId={id} assetName={asset.name} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Asset Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Asset Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant="outline"
                                            className={cn('capitalize', getStatusBadgeStyles(asset.status || 'active'))}
                                        >
                                            {asset.status || 'active'}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={cn('capitalize text-xs', getPaymentStatusBadgeStyles(asset.paymentStatus || 'unpaid'))}
                                        >
                                            {asset.paymentStatus ? asset.paymentStatus.replace('_', ' ') : 'unpaid'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                                    <p className="mt-1 font-mono text-sm">{asset.serialNumber || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                                    <p className="mt-1">{asset.location || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                                    <p className="mt-1">{format(new Date(asset.purchaseDate), 'dd MMM yyyy')}</p>
                                </div>
                            </div>
                            {asset.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="mt-1 text-sm">{asset.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Purchase Price</label>
                                    <p className="mt-1 text-lg font-bold">₹{(asset.purchasePrice || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Current Value</label>
                                    <p className="mt-1 text-lg font-bold text-primary">₹{(asset.currentValue || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Total Paid</label>
                                    <p className="mt-1 text-lg font-bold text-success">₹{(asset.totalPaid || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Remaining Amount</label>
                                    <p className={cn(
                                        "mt-1 text-lg font-bold",
                                        (asset.remainingAmount || 0) > 0 ? "text-destructive" : "text-success"
                                    )}>
                                        ₹{(asset.remainingAmount || 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                            {asset.gstEnabled && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">GST Percentage</label>
                                            <p className="mt-1">{asset.gstPercentage || 0}%</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">GST Amount</label>
                                            <p className="mt-1">₹{(asset.gstAmount || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                        <AssetPaymentHistory assetId={id} assetName={asset.name} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
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