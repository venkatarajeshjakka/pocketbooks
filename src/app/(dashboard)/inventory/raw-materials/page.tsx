import { RawMaterialsList } from '@/components/inventory/raw-materials-list';

export default function RawMaterialsPage() {
  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <RawMaterialsList />
      </div>
    </div>
  );
}
