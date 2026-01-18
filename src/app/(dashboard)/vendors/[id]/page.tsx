/**
 * Vendor Detail Page
 *
 * Displays detailed information about a single vendor
 */

import { VendorDetailView } from '@/components/vendors/vendor-detail-view';

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { id } = await params;

  return (
    <VendorDetailView id={id} />
  );
}
