'use client';

import { IClient } from '@/types';
import { ContactInfoCard } from './contact-info-card';
import { AddressCard } from './address-card';
import { RecordInfoCard } from './record-info-card';

interface OverviewTabProps {
  client: IClient;
}

export function OverviewTab({ client }: OverviewTabProps) {
  const hasAddress =
    client.address?.street ||
    client.address?.city ||
    client.address?.state ||
    client.address?.postalCode;

  return (
    <div className="space-y-6">

      <div className='flex md:flex-row justify-between justify-items-center gap-8'>
        {/* Contact Information */}
        <ContactInfoCard client={client} />

        {/* Address */}
        {hasAddress && <AddressCard client={client} />}

        {/* Record Info */}
      <RecordInfoCard client={client} />
      </div>


      
    </div>
  );
}
