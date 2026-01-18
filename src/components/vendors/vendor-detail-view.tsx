'use client';

import { useVendor } from '@/lib/hooks/use-vendors';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Pencil, Mail, Phone, MapPin, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VendorDetailViewProps {
    id: string;
}

export function VendorDetailView({ id }: VendorDetailViewProps) {
    const { data: vendor, isLoading, error } = useVendor(id);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    if (error || !vendor) {
        return <div>Vendor not found or an error occurred.</div>;
    }

    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
            {/* Header with back navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/vendors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{vendor.name}</h1>
                                <Badge
                                    variant={vendor.status === 'active' ? 'default' : 'secondary'}
                                    className={cn(
                                        'text-xs capitalize',
                                        vendor.status === 'active'
                                            ? 'bg-success/10 text-success border-success/20'
                                            : 'bg-muted text-muted-foreground border-border'
                                    )}
                                >
                                    {vendor.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {vendor.specialty || 'Vendor'}
                            </p>
                        </div>
                    </div>
                </div>

                <Button asChild>
                    <Link href={`/vendors/${id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Vendor
                    </Link>
                </Button>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Contact Information */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Mail className="h-5 w-5 text-primary" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {vendor.contactPerson && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Person</p>
                                <p className="text-sm font-medium mt-1">{vendor.contactPerson}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                            <a
                                href={`mailto:${vendor.email}`}
                                className="text-sm font-medium mt-1 text-primary hover:underline block"
                            >
                                {vendor.email}
                            </a>
                        </div>
                        {vendor.phone && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
                                <a
                                    href={`tel:${vendor.phone}`}
                                    className="text-sm font-medium mt-1 text-primary hover:underline block"
                                >
                                    {vendor.phone}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="h-5 w-5 text-primary" />
                            Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vendor.address?.street || vendor.address?.city ? (
                            <div className="space-y-1">
                                {vendor.address.street && (
                                    <p className="text-sm">{vendor.address.street}</p>
                                )}
                                <p className="text-sm">
                                    {[vendor.address.city, vendor.address.state].filter(Boolean).join(', ')}
                                </p>
                                <p className="text-sm">
                                    {[vendor.address.postalCode, vendor.address.country].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No address provided</p>
                        )}
                    </CardContent>
                </Card>

                {/* Business Information */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Building2 className="h-5 w-5 text-primary" />
                            Business Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {vendor.gstNumber && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">GST Number</p>
                                <p className="text-sm font-mono font-medium mt-1">{vendor.gstNumber}</p>
                            </div>
                        )}
                        {vendor.specialty && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Specialty</p>
                                <p className="text-sm font-medium mt-1">{vendor.specialty}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Payable</p>
                            <p
                                className={cn(
                                    'text-2xl font-bold mt-1',
                                    vendor.outstandingPayable > 0 ? 'text-destructive' : 'text-success'
                                )}
                            >
                                {'\u20B9'}{(vendor.outstandingPayable || 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground">
                <p>
                    Created: {new Date(vendor.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    {' '}&bull;{' '}
                    Updated: {new Date(vendor.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </p>
            </div>
        </div>
    );
}
