/**
 * Edit Client Page
 *
 * Page for editing an existing client
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ClientForm } from '@/components/clients/client-form';
import { fetchClient } from '@/lib/api/clients';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

async function getClient(id: string) {
  try {
    return await fetchClient(id);
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

export async function generateMetadata({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClient(id);

  return {
    title: client ? `Edit ${client.name} | PocketBooks` : 'Client Not Found',
    description: client ? `Edit ${client.name}'s information` : 'Client not found',
  };
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
      {/* Page Header */}
      <div className="mx-auto w-full max-w-4xl mb-10">
        <Link
          href={`/clients/${id}`}
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
        >
          <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to {client.name}
        </Link>
        <div className='relative'>
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">Edit Client</h1>
          <p className="text-base text-muted-foreground mt-3 font-medium max-w-2xl leading-relaxed">
            Update {client.name}&apos;s profile. Refine their business details and contact information to keep your records accurate.
          </p>
        </div>
      </div>

      {/* Client Form */}
      <div className="mx-auto w-full max-w-4xl">
        <ClientForm mode="edit" clientId={id} initialData={client} />
      </div>
    </div>
  );
}
