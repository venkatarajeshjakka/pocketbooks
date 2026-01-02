"use client";

import { IClient } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/utils/animation-variants";
import { ClientHero } from "./client-hero";
import { ClientTabs } from "./client-tabs";

interface ClientDetailPageProps {
  client: IClient;
}

export function ClientDetailPage({ client }: ClientDetailPageProps) {
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
