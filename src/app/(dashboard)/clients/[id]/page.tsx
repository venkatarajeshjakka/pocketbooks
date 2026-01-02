/**
 * Client Details Page
 *
 * Modern SaaS-style client view with Bento grid layout
 */

import { notFound } from 'next/navigation';
import { fetchClient } from '@/lib/api/clients';
import { ClientDetailPage } from '@/components/clients/detail-view';

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
    <div className="flex flex-1 flex-col saas-canvas -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      <ClientDetailPage client={client} />
    </div>
  );
}
