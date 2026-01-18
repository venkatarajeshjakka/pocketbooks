import { StatCard } from "@/components/shared/stats/stat-card";
import { GradientCard } from "@/components/shared/ui/gradient-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  AlertCircle,
  Package,
  Search,
  FileText
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { AnalyticsService } from "@/lib/services/analytics-service";
import { connectToDatabase } from "@/lib/api-helpers";

export default async function DashboardPage() {
  await connectToDatabase();
  const metricsData = await AnalyticsService.getDashboardMetrics();

  const metrics = {
    totalSales: metricsData.totalSales,
    pendingReceivables: metricsData.pendingReceivables,
    pendingPayables: metricsData.pendingPayables,
    netProfit: metricsData.netProfit,
    salesChange: 0, // In a real app, you'd calc trend
    arChange: 0,
    apChange: 0,
    profitChange: 0,
    totalAssets: metricsData.totalAssets,
    outstandingLoans: metricsData.outstandingLoans,
    assetsChange: 0,
    loansChange: 0,
  };

  const recentSales = metricsData.recentSales.map((s: any) => ({
    id: s.id,
    client: s.client,
    amount: s.amount,
    date: new Date(s.date).toLocaleDateString(),
    status: s.status
  }));

  const pendingPayments: any[] = []; // Need to add logic to AnalyticsService for this if needed

  const lowStockItems = metricsData.lowStockItems;

  return (
    <div className="flex flex-1 flex-col gap-6 sm:gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-title text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time business intelligence and operations overview
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search..."
              className="pl-9"
            />
          </div>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
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
        <StatCard
          title="Total Assets"
          value={`\u20B9${metrics.totalAssets.toLocaleString()}`}
          trend={{ value: metrics.assetsChange, isPositive: true }}
          icon="Monitor"
          gradient="primary"
          delay={0.5}
        />
        <StatCard
          title="Outstanding Loans"
          value={`\u20B9${metrics.outstandingLoans.toLocaleString()}`}
          trend={{ value: Math.abs(metrics.loansChange), isPositive: false }}
          icon="CreditCard"
          gradient="warning"
          delay={0.6}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Sales Section */}
        <GradientCard className="lg:col-span-2">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-border/50 p-5">
              <div>
                <h3 className="text-section-title">Recent Transactions</h3>
                <p className="text-sm text-muted-foreground">Latest activity in the last 24h</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sales">View All</Link>
              </Button>
            </div>

            <div className="flex-1 divide-y divide-border/30">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                      {sale.id.split('-')[1]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{sale.client}</p>
                      <p className="text-xs text-muted-foreground">{sale.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-sm font-semibold tabular-nums text-foreground">{`\u20B9`}{sale.amount.toLocaleString()}</p>
                      <Badge variant={sale.status === "Paid" ? "paid" : "pending"} className="mt-0.5">
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
          <GradientCard gradient="warning" className="h-fit">
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <h3 className="text-card-title">Pending Payables</h3>
              </div>

              <div className="space-y-3">
                {pendingPayments.map((payment, index) => (
                  <div key={index} className="flex items-start justify-between border-b border-border/30 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{payment.client}</p>
                      <p className="text-xs text-muted-foreground">Due {payment.dueDate}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-foreground">{`\u20B9`}{payment.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href="/payments">View All Payments</Link>
              </Button>
            </div>
          </GradientCard>

          {/* Low Stock Alerts */}
          <GradientCard className="h-fit">
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <Package className="h-4 w-4" />
                </div>
                <h3 className="text-card-title">Low Stock Alerts</h3>
              </div>

              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-sm text-foreground">{item.name}</p>
                    <Badge variant="overdue">
                      {item.quantity} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
                <Link href="/inventory/raw-materials">Manage Inventory</Link>
              </Button>
            </div>
          </GradientCard>
        </div>
      </div>
    </div>
  );
}
