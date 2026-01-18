'use client';

import { useVendor } from '@/lib/hooks/use-vendors';
import { VendorDetailView } from '@/components/vendors/vendor-detail-view';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VendorDetailContainerProps {
    id: string;
}

export function VendorDetailContainer({ id }: VendorDetailContainerProps) {
    const { data: vendor, isLoading, isError, error } = useVendor(id);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    if (isError || !vendor) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center bg-card rounded-3xl border border-dashed">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Failed to load vendor</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        {error instanceof Error ? error.message : 'The vendor could not be found or there was an error loading it.'}
                    </p>
                </div>
                <Button asChild variant="outline" className="mt-2">
                    <Link href="/vendors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Vendors
                    </Link>
                </Button>
            </div>
        );
    }

    // Since VendorDetailView was already fetching data, we might need to modify it
    // to accept vendor as a prop, or just keep it as is if it can handle it.
    // However, VendorDetailView (original) was fetching its own data.
    // Let's modify VendorDetailView to be a pure view component.

    return <VendorDetailView vendor={vendor} />;
}
