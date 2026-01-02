/**
 * Edit Vendor Page
 *
 * Page for editing an existing vendor
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorForm } from '@/components/vendors/vendor-form';
import { fetchVendor } from '@/lib/api/vendors';

interface EditVendorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditVendorPageProps) {
  const { id } = await params;
  try {
    const vendor = await fetchVendor(id);
    return {
      title: `Edit ${vendor.name} | Vendors | PocketBooks`,
      description: `Edit vendor ${vendor.name}`,
    };
  } catch {
    return {
      title: 'Vendor Not Found | PocketBooks',
    };
  }
}

export default async function EditVendorPage({ params }: EditVendorPageProps) {
  const { id } = await params;

  let vendor;
  try {
    vendor = await fetchVendor(id);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/vendors/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Vendor</h1>
              <p className="text-sm text-muted-foreground">
                Update information for {vendor.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8">
          <VendorForm mode="edit" vendorId={id} initialData={vendor} />
        </div>
      </div>
    </div>
  );
}
