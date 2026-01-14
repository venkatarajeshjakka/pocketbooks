import { TradingGoodsList } from '@/components/inventory/trading-goods-list';

export default function TradingGoodsPage() {
  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <TradingGoodsList />
      </div>
    </div>
  );
}
