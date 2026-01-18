/**
 * Edit Client Page
 *
 * Page for editing an existing client
 */

import { Suspense } from 'react';
import { ClientForm } from '@/components/clients/client-form';
import { Skeleton } from '@/components/ui/skeleton';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Client | PocketBooks',
  description: 'Update client information',
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
      {/* Client Form */}
      <div className="mx-auto w-full max-w-4xl">
        <Suspense
          fallback={
            <div className="space-y-8">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          }
        >
          <ClientForm mode="edit" clientId={id} />
        </Suspense>
      </div>
    </div>
  );
}
