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
      {/* Responsive grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
