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
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
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
  const pathname = usePathname();
  useSidebar();

  // Helper function to check if a menu item or its sub-items are active
  const isMenuItemActive = (item: MenuItem): boolean => {
    if (item.url && pathname === item.url) {
      return true;
    }
    if (item.items) {
      return item.items.some((subItem) => pathname === subItem.url);
    }
    return false;
  };

  // Helper function to check if a sub-item is active
  const isSubItemActive = (url: string): boolean => {
    return pathname === url;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenuButton
          size="lg"
          asChild
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors duration-200"
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-transform duration-200 hover:scale-105">
              <TrendingUp className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold text-sidebar-foreground">Pocket Books</span>
              <span className="text-xs text-sidebar-foreground/70">Business Management</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) =>
              item.items ? (
                <Collapsible
                  key={item.title}
                  className="group/collapsible"
                  defaultOpen={isMenuItemActive(item)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isMenuItemActive(item)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubItemActive(subItem.url)}
                            >
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
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isMenuItemActive(item)}
                  >
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
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/60 transition-colors duration-200">Version 1.0.0</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
