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
    <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
      {/* Page Header */}
      <div className="mx-auto w-full max-w-4xl mb-10">
        <Link
          href="/clients"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
        >
          <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Clients
        </Link>
        <div className='relative'>
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">Add New Client</h1>
          <p className="text-base text-muted-foreground mt-3 font-medium max-w-2xl leading-relaxed">
            Onboard a new client to your system. Fill in their business and contact information to begin collaboration.
          </p>
        </div>
      </div>

      {/* Client Form */}
      <div className="mx-auto w-full max-w-4xl">
        <ClientForm mode="create" />
      </div>
    </div>
  );
}
