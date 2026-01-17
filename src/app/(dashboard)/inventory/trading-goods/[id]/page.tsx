import { TradingGoodDetail } from '@/components/inventory/trading-good-detail';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TradingGoodDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="mx-auto w-full max-w-4xl">
        <TradingGoodDetail id={id} />
      </div>
    </div>
  );
}
