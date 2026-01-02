/**
 * Vendor Not Found Page
 *
 * Displayed when a vendor is not found
 */

import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VendorNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        <Package className="h-10 w-10 text-muted-foreground/50" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Vendor Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The vendor you are looking for does not exist or may have been deleted.
        </p>
      </div>

      <Button asChild>
        <Link href="/vendors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Link>
      </Button>
    </div>
  );
}
