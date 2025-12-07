"use client";

import { motion } from "framer-motion";
import { Building2, DollarSign, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IClient } from "@/types";
import { fadeInUp } from "@/lib/utils/animation-variants";
import { OverviewTab } from "./overview/overview-tab";
import { FinancialTab } from "./financial/financial-tab";
import { ActivityTab } from "./activity/activity-tab";

interface ClientTabsProps {
  client: IClient;
}

export function ClientTabs({ client }: ClientTabsProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Tabs defaultValue="overview" className="w-full">
        {/* Underline Style Tabs */}
        <TabsList className="bg-transparent p-0 h-auto w-full justify-start rounded-none">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:shadow-none data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg border-transparent px-4 py-3"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="data-[state=active]:shadow-none data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg border-transparent px-4 py-3"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:shadow-none data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg border-transparent px-4 py-3"
          >
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <OverviewTab client={client} />
          </TabsContent>

          <TabsContent value="financial" className="mt-0">
            <FinancialTab client={client} />
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivityTab client={client} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
