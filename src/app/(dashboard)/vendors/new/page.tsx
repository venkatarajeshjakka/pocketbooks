/**
 * New Vendor Page
 *
 * Page for creating a new vendor
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { VendorForm } from '@/components/vendors/vendor-form';

export const metadata = {
  title: 'Add New Vendor | PocketBooks',
  description: 'Create a new vendor in PocketBooks',
};

export default function NewVendorPage() {
  return (
    <div className="flex flex-1 flex-col saas-canvas -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Vendors
        </Link>
        <div className='mx-auto w-full max-w-3xl mb-4'>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Vendor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new vendor for your business
          </p>
        </div>
      </div>

      {/* Vendor Form */}
      <div className="mx-auto w-full max-w-3xl">
        <VendorForm mode="create" />
      </div>
    </div>
  );
}
