import { RawMaterialDetail } from '@/components/inventory/raw-material-detail';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RawMaterialDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="mx-auto w-full max-w-4xl">
        <RawMaterialDetail id={id} />
      </div>
    </div>
  );
}
