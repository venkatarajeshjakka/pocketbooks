import { StatCard } from "@/components/shared/stats/stat-card";
import { GradientCard } from "@/components/shared/ui/gradient-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  IndianRupee,
  CreditCard,
  PiggyBank,
  AlertCircle,
  Package
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  // Mock data - replace with actual data fetching
  const metrics = {
    totalSales: 45230.5,
    pendingReceivables: 12340.0,
    pendingPayables: 8560.0,
    netProfit: 18920.5,
    salesChange: 12.5,
    arChange: -5.2,
    apChange: 8.3,
    profitChange: 15.8,
  };

  const recentSales = [
    {
      id: "S-001",
      client: "Acme Corporation",
      amount: 2500.0,
      date: "2 min ago",
      status: "Paid",
    },
    {
      id: "S-002",
      client: "TechStart Inc.",
      amount: 1850.0,
      date: "15 min ago",
      status: "Pending",
    },
    {
      id: "S-003",
      client: "Global Solutions",
      amount: 3200.0,
      date: "1 hour ago",
      status: "Paid",
    },
  ];

  const pendingPayments = [
    { client: "Acme Corporation", amount: 2500.0, dueDate: "Dec 10, 2024" },
    { client: "TechStart Inc.", amount: 1850.0, dueDate: "Dec 05, 2024" },
    { client: "Beta Labs", amount: 950.0, dueDate: "Dec 12, 2024" },
  ];

  const lowStockItems = [
    { name: "Raw Material A", quantity: 5, unit: "kg" },
    { name: "Trading Product B", quantity: 12, unit: "units" },
    { name: "Packaging Box", quantity: 45, unit: "pcs" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-1 sm:p-2">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
            Command Center
          </h2>
          <p className="text-sm font-medium text-muted-foreground/60">
            Real-time business intelligence and operations overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-9 rounded-xl px-4 font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
            <TrendingUp className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`\u20B9${metrics.totalSales.toLocaleString()}`}
          trend={{ value: metrics.salesChange, isPositive: true }}
          icon="TrendingUp"
          gradient="primary"
          delay={0.1}
        />
        <StatCard
          title="Pending Receivables"
          value={`\u20B9${metrics.pendingReceivables.toLocaleString()}`}
          trend={{ value: Math.abs(metrics.arChange), isPositive: false }}
          icon="IndianRupee"
          gradient="warning"
          delay={0.2}
        />
        <StatCard
          title="Pending Payables"
          value={`\u20B9${metrics.pendingPayables.toLocaleString()}`}
          trend={{ value: metrics.apChange, isPositive: false }}
          icon="CreditCard"
          gradient="secondary"
          delay={0.3}
        />
        <StatCard
          title="Net Profit"
          value={`\u20B9${metrics.netProfit.toLocaleString()}`}
          trend={{ value: metrics.profitChange, isPositive: true }}
          icon="PiggyBank"
          gradient="success"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Sales Section */}
        <GradientCard className="lg:col-span-2">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-border/10 p-6 px-7">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Recent Velocity</h3>
                <p className="text-xs font-medium text-muted-foreground/50">Latest transactions in the last 24h</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-xl font-bold text-primary hover:bg-primary/5">
                <Link href="/sales">Explore All</Link>
              </Button>
            </div>

            <div className="flex-1 space-y-1 p-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="group flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:bg-accent/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-accent-foreground font-bold text-[10px]">
                      {sale.id.split('-')[1]}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight text-foreground/90">{sale.client}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{sale.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-black tracking-tight text-foreground">{`\u20B9`}{sale.amount.toLocaleString()}</p>
                      <Badge variant="secondary" className={cn(
                        "rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-widest transition-all",
                        sale.status === "Paid" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                      )}>
                        {sale.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GradientCard>

        <div className="space-y-6">
          {/* Pending Alerts */}
          <GradientCard gradient="accent" className="h-fit">
            <div className="p-6 px-7">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold tracking-tight">Urgent Payables</h3>
                </div>
              </div>

              <div className="space-y-4">
                {pendingPayments.map((payment, index) => (
                  <div key={index} className="flex items-start justify-between border-b border-border/10 pb-4 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-foreground/90">{payment.client}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">Due {payment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{`\u20B9`}{payment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild variant="outline" size="sm" className="mt-6 w-full rounded-xl font-bold border-border/50 hover:bg-accent/50">
                <Link href="/payments">Operations Desk</Link>
              </Button>
            </div>
          </GradientCard>

          {/* Logistics Health */}
          <GradientCard gradient="subtle" className="h-fit">
            <div className="p-6 px-7">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <Package className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold tracking-tight">Stock Warnings</h3>
                </div>
              </div>

              <div className="space-y-4">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground/80">{item.name}</p>
                    <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border-destructive/20">
                      {item.quantity} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button asChild variant="ghost" size="sm" className="mt-6 w-full rounded-xl font-bold hover:bg-destructive/5 hover:text-destructive transition-all">
                <Link href="/inventory/raw-materials">Manage Logistics</Link>
              </Button>
            </div>
          </GradientCard>
        </div>
      </div>
    </div>
  );
}
