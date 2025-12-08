/**
 * New Client Page
 *
 * Page for creating a new client
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ClientForm } from '@/components/clients/client-form';

export const metadata = {
  title: 'New Client | PocketBooks',
  description: 'Add a new client to your customer base',
};

export default function NewClientPage() {
  return (
    <div className="flex flex-1 flex-col saas-canvas -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Clients
        </Link>
        <div className='mx-auto w-full max-w-3xl mb-4'>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Client</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter client information to add them to your system
          </p>
        </div>
      </div>

      {/* Client Form */}
      <div className="mx-auto w-full max-w-3xl">
        <ClientForm mode="create" />
      </div>
    </div>
  );
}
