import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RawMaterialForm } from '@/components/inventory/raw-material-form';

export default function NewRawMaterialPage() {
  return (
    <div className="flex-1 p-6 md:p-10 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back Button */}
        <Link
          href="/inventory/raw-materials"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground mb-8"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Raw Materials
        </Link>

        {/* Page Title */}
        <div className="relative mb-12">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight">Add Raw Material</h1>
          <p className="text-base text-muted-foreground mt-2">
            Create a new raw material entry in your inventory
          </p>
        </div>

        {/* Form */}
        <RawMaterialForm />
      </div>
    </div>
  );
}
