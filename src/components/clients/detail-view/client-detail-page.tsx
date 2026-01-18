"use client";

import { IClient } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/utils/animation-variants";
import { useClient } from "@/lib/hooks/use-clients";
import { Loader2 } from "lucide-react";
import { ClientHero } from "./client-hero";
import { ClientTabs } from "./client-tabs";

interface ClientDetailPageProps {
  id: string;
}

export function ClientDetailPage({ id }: ClientDetailPageProps) {
  const { data: clientResponse, isLoading, error } = useClient(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    );
  }

  if (error || !clientResponse) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-muted-foreground">Client not found</h2>
      </div>
    );
  }

  const client = clientResponse; // useClient returns IClient directly usually? Let's check hook.

  return (
    <TooltipProvider>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="min-h-screen space-y-4 sm:space-y-6"
      >
        {/* Hero Section */}
        <ClientHero client={client} />

        {/* Main Content */}
        <div className="w-full">
          <ClientTabs client={client} />
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
