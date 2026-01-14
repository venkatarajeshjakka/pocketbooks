import { FinishedGoodEditWrapper } from '@/components/inventory/finished-good-edit-wrapper';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFinishedGoodPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 p-6 md:p-10 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        <FinishedGoodEditWrapper id={id} />
      </div>
    </div>
  );
}
