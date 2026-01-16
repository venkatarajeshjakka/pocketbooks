import { notFound } from "next/navigation";
import { ProcurementForm } from "@/components/procurement/procurement-form";
import { fetchProcurement } from "@/lib/api/procurements";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTradingGoodPage({ params }: PageProps) {
  const { id } = await params;

  let procurement;
  try {
    procurement = await fetchProcurement("trading_good", id);
  } catch (error) {
    console.error("Failed to fetch procurement:", error);
    notFound();
  }

  const serializedProcurement = procurement as any;

  const transformedItems = serializedProcurement.items.map((item: any) => ({
    ...item,
    // Ensure tradingGoodId is just the ID string
    tradingGoodId: item.tradingGoodId?._id || item.tradingGoodId,
    // Add name for display
    name: item.tradingGoodId?.name || "Unknown Item",
  }));

  serializedProcurement.items = transformedItems;

  return (
    <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back Button */}
        <Link
          href={`/procurement/trading-goods/${id}`}
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
        >
          <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Details
        </Link>

        {/* Page Title */}
        <div className="relative mb-12">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">
            Edit Procurement
          </h1>
          <p className="text-base text-muted-foreground mt-3 font-medium max-w-2xl leading-relaxed">
            Update trading good procurement details and items.
          </p>
        </div>

        <ProcurementForm
          type="trading_good"
          mode="edit"
          initialData={serializedProcurement}
          procurementId={id}
        />
      </div>
    </div>
  );
}
