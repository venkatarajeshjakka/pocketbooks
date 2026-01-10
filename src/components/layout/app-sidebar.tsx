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
  Monitor,
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
    title: "Assets",
    url: "/assets",
    icon: Monitor,
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
    title: "Loans",
    icon: Landmark,
    items: [
      { title: "Loan Accounts", url: "/loan-accounts" },
      { title: "Interest Payments", url: "/interest-payments" },
    ],
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
    if (item.url) {
      // Exact match for home page
      if (item.url === "/" && pathname === "/") {
        return true;
      }
      // For other pages, check if pathname starts with the item URL
      if (item.url !== "/" && pathname.startsWith(item.url)) {
        return true;
      }
    }
    if (item.items) {
      return item.items.some((subItem) => pathname.startsWith(subItem.url));
    }
    return false;
  };

  // Helper function to check if a sub-item is active
  const isSubItemActive = (url: string): boolean => {
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="border-b border-border/50 py-3">
        <SidebarMenuButton
          size="lg"
          asChild
          className="hover:bg-accent/50"
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="text-sm font-semibold text-foreground">Pocket Books</span>
              <span className="text-[10px] text-muted-foreground">Financial Suite</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
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
                        className="h-9"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 border-l border-border/40 py-1">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubItemActive(subItem.url)}
                              className="h-8 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                            >
                              <Link href={subItem.url}>
                                <span className="text-sm">{subItem.title}</span>
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
                    className="h-9 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link href={item.url!}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">v1.2.0</span>
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
