import { TradingGoodEditWrapper } from '@/components/inventory/trading-good-edit-wrapper';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTradingGoodPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 p-6 md:p-10 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        <TradingGoodEditWrapper id={id} />
      </div>
    </div>
  );
}
