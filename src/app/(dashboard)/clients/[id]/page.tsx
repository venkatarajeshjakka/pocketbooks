/**
 * Client Details Page
 *
 * View and edit individual client details
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientDetailsEnhanced } from '@/components/clients/client-details-enhanced';
import { DeleteClientDialog } from '@/components/clients/delete-client-dialog';
import { fetchClient } from '@/lib/api/clients';

interface ClientPageProps {
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

export async function generateMetadata({ params }: ClientPageProps) {
  const { id } = await params;
  const client = await getClient(id);

  return {
    title: client ? `${client.name} | PocketBooks` : 'Client Not Found',
    description: client
      ? `View and manage ${client.name}'s information`
      : 'Client not found',
  };
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clients">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">
              Client details and transaction history
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/clients/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteClientDialog clientId={id} clientName={client.name} />
        </div>
      </div>

      {/* Client Details */}
      <ClientDetailsEnhanced client={client} />
    </div>
  );
}
