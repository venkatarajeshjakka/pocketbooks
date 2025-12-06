/**
 * New Client Page
 *
 * Page for creating a new client
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientFormEnhanced } from '@/components/clients/client-form-enhanced';

export const metadata = {
  title: 'New Client | PocketBooks',
  description: 'Add a new client to your customer base',
};

export default function NewClientPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
          <p className="text-muted-foreground">
            Enter client information to add them to your system
          </p>
        </div>
      </div>

      {/* Client Form */}
      <div className="mx-auto w-full max-w-3xl">
        <ClientFormEnhanced mode="create" />
      </div>
    </div>
  );
}
