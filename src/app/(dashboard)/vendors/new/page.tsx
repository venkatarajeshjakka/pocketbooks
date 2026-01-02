/**
 * New Vendor Page
 *
 * Page for creating a new vendor
 */

import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorForm } from '@/components/vendors/vendor-form';

export const metadata = {
  title: 'Add New Vendor | PocketBooks',
  description: 'Create a new vendor in PocketBooks',
};

export default function NewVendorPage() {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Add New Vendor</h1>
              <p className="text-sm text-muted-foreground">
                Create a new vendor for your business
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8">
          <VendorForm mode="create" />
        </div>
      </div>
    </div>
  );
}
