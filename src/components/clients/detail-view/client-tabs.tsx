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
        {/* Tab Navigation */}
        <TabsList className="bg-muted/50 p-2.5 h-auto w-full justify-start rounded-lg gap-1 sm:gap-2">
          <TabsTrigger
            value="overview"
            className="bg-background/60 hover:bg-background data-[state=active]:shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 transition-colors"
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Overview</span>
            <span className="xs:hidden sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="bg-background/60 hover:bg-background data-[state=active]:shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 transition-colors"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="bg-background/60 hover:bg-background data-[state=active]:shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 transition-colors"
          >
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-4 sm:mt-6">
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
