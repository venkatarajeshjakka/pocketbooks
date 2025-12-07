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
    <div className="flex flex-1 flex-col saas-canvas -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <Link
          href={`/clients/${id}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--saas-muted)] hover:text-[var(--saas-heading)] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {client.name}
        </Link>
        <div className='mx-auto w-full max-w-3xl'>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--saas-heading)]">Edit Client</h1>
          <p className="text-sm text-[var(--saas-muted)] mt-1">
            Update {client.name}&apos;s information
          </p>
        </div>
      </div>

      {/* Client Form */}
      <div className="mx-auto w-full max-w-3xl">
        <ClientForm mode="edit" clientId={id} initialData={client} />
      </div>
    </div>
  );
}
