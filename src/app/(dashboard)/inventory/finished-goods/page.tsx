import { FinishedGoodsList } from '@/components/inventory/finished-goods-list';

export default function FinishedGoodsPage() {
  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <FinishedGoodsList />
      </div>
    </div>
  );
}
