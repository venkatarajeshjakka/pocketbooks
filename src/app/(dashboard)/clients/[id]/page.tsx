/**
 * Client Details Page
 *
 * Modern SaaS-style client view with Bento grid layout
 */

import { ClientDetailPage } from '@/components/clients/detail-view';

interface ClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col saas-canvas -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      <ClientDetailPage id={id} />
    </div>
  );
}
