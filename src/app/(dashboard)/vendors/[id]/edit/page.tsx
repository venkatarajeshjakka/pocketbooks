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
    <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
      {/* Page Header */}
      <div className="mx-auto w-full max-w-4xl mb-10">
        <Link
          href={`/vendors/${id}`}
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
        >
          <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Profile
        </Link>
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
              <Package className="h-7 w-7 text-primary relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">Edit Vendor</h1>
              <p className="text-base text-muted-foreground mt-2 font-medium max-w-2xl leading-relaxed">
                Refine {vendor.name}&apos;s vendor profile. Update procurement categories and contact details to ensure smooth supply chain operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="mx-auto w-full max-w-4xl">
        <VendorForm mode="edit" vendorId={id} initialData={vendor} />
      </div>
    </div>
  );
}
