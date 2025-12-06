/**
 * Edit Client Page
 *
 * Page for editing an existing client
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientFormEnhanced } from '@/components/clients/client-form-enhanced';
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
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/clients/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
          <p className="text-muted-foreground">
            Update {client.name}&apos;s information
          </p>
        </div>
      </div>

      {/* Client Form */}
      <div className="mx-auto w-full max-w-3xl">
        <ClientFormEnhanced mode="edit" clientId={id} initialData={client} />
      </div>
    </div>
  );
}
