import { FinishedGoodDetail } from '@/components/inventory/finished-good-detail';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FinishedGoodDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="mx-auto w-full max-w-4xl">
        <FinishedGoodDetail id={id} />
      </div>
    </div>
  );
}
