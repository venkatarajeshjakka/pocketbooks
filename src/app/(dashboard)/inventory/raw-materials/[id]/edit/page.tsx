import { RawMaterialEditWrapper } from '@/components/inventory/raw-material-edit-wrapper';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRawMaterialPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 p-6 md:p-10 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        <RawMaterialEditWrapper id={id} />
      </div>
    </div>
  );
}
