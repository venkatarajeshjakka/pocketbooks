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
        className="min-h-screen"
      >
        {/* Hero Section */}
        <ClientHero client={client} />

        {/* Main Content - Bento Grid Layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Primary Content (2/3 width) */}
          <div className="lg:col-span-3">
            <ClientTabs client={client} />
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
