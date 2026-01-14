'use client';

import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { RawMaterialForm } from './raw-material-form';
import { useRawMaterial } from '@/lib/hooks/use-inventory-items';

interface RawMaterialEditWrapperProps {
  id: string;
}

export function RawMaterialEditWrapper({ id }: RawMaterialEditWrapperProps) {
  const { data: material, isLoading, error } = useRawMaterial(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-destructive/10 p-8 border border-destructive/20">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">Failed to load raw material. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Back Button */}
      <Link
        href={`/inventory/raw-materials/${id}`}
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
          <ChevronLeft className="h-4 w-4" />
        </div>
        Back to Details
      </Link>

      {/* Page Title */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
        <h1 className="text-4xl font-extrabold tracking-tight">Edit Raw Material</h1>
        <p className="text-base text-muted-foreground mt-2">
          Update the details of {material.name}
        </p>
      </div>

      {/* Form */}
      <RawMaterialForm initialData={material} isEdit={true} />
    </div>
  );
}
