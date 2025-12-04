"use client";

import {
  Home,
  TrendingUp,
  Users,
  Building2,
  Package,
  ShoppingCart,
  CreditCard,
  Receipt,
  Landmark,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  items?: Array<{ title: string; url: string }>;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Vendors",
    url: "/vendors",
    icon: Building2,
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { title: "Raw Materials", url: "/inventory/raw-materials" },
      { title: "Trading Goods", url: "/inventory/trading-goods" },
      { title: "Finished Goods", url: "/inventory/finished-goods" },
    ],
  },
  {
    title: "Procurement",
    icon: ShoppingCart,
    items: [
      { title: "Raw Materials", url: "/procurement/raw-materials" },
      { title: "Trading Goods", url: "/procurement/trading-goods" },
    ],
  },
  {
    title: "Sales",
    icon: TrendingUp,
    items: [
      { title: "New Sale", url: "/sales/new" },
      { title: "Sales History", url: "/sales" },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    items: [
      { title: "Record Payment", url: "/payments/new" },
      { title: "Payment History", url: "/payments" },
    ],
  },
  {
    title: "Expenses",
    icon: Receipt,
    items: [
      { title: "Add Expense", url: "/expenses/new" },
      { title: "Expense History", url: "/expenses" },
    ],
  },
  {
    title: "Interest Payments",
    url: "/interest-payments",
    icon: Landmark,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    items: [
      { title: "Sales Analytics", url: "/analytics/sales" },
      { title: "AR Report", url: "/analytics/accounts-receivable" },
      { title: "AP Report", url: "/analytics/accounts-payable" },
      { title: "P&L Statement", url: "/analytics/profit-loss" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Pocket Books</span>
            <span className="text-xs text-muted-foreground">
              Business Management
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) =>
              item.items ? (
                <Collapsible key={item.title} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url!}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
      </SidebarFooter>
    </Sidebar>
  );
}
