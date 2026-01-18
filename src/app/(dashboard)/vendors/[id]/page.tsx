import { VendorDetailContainer } from '@/components/vendors/vendor-detail-container';

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { id } = await params;

  return (
    <VendorDetailContainer id={id} />
  );
}
