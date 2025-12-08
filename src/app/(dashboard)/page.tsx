import {
  TrendingUp,
  DollarSign,
  CreditCard,
  PiggyBank,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Business Tracker Dashboard Page
 *
 * This is the main landing page for Business Tracker users.
 * It provides an overview of key business metrics and recent activity.
 *
 * Features:
 * - Key metrics cards (Sales, AR, AP, Net Profit)
 * - Recent sales transactions table
 * - Pending payments requiring attention
 * - Low stock alerts for inventory management
 * - Quick action buttons for common tasks
 *
 * Metrics Displayed:
 * - Total Sales (current month)
 * - Pending Receivables (AR)
 * - Pending Payables (AP)
 * - Net Profit (current month)
 *
 * Accessibility:
 * - Semantic HTML structure
 * - Proper heading hierarchy
 * - ARIA labels for icon-only elements
 * - Color-coded indicators with text labels
 * - Keyboard accessible interactive elements
 */
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
      date: "2024-12-01",
      status: "Paid",
    },
    {
      id: "S-002",
      client: "TechStart Inc.",
      amount: 1850.0,
      date: "2024-12-02",
      status: "Pending",
    },
    {
      id: "S-003",
      client: "Global Solutions",
      amount: 3200.0,
      date: "2024-12-03",
      status: "Paid",
    },
  ];

  const pendingPayments = [
    { client: "Acme Corporation", amount: 2500.0, dueDate: "2024-12-10" },
    { client: "TechStart Inc.", amount: 1850.0, dueDate: "2024-12-05" },
  ];

  const lowStockItems = [
    { name: "Raw Material A", quantity: 5, unit: "kg" },
    { name: "Trading Product B", quantity: 12, unit: "units" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your business performance and activities
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalSales.toLocaleString()}
            </div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+{metrics.salesChange}%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Receivables */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Receivables
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.pendingReceivables.toLocaleString()}
            </div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">{metrics.arChange}%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Payables */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payables
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.pendingPayables.toLocaleString()}
            </div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-accent-foreground" />
              <span className="text-accent-foreground">+{metrics.apChange}%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.netProfit.toLocaleString()}
            </div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+{metrics.profitChange}%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Sales */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Latest sales transactions from the past week
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/sales">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {sale.client}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.id} • {sale.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ${sale.amount.toLocaleString()}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs transition-colors duration-200 ${
                        sale.status === "Paid"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-accent-foreground" />
              Pending Payments
            </CardTitle>
            <CardDescription>Payments requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((payment, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {payment.client}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-accent-foreground">
                    Due: {payment.dueDate}
                  </p>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/payments">View All Payments</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-destructive" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items requiring reorder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.name}</p>
                  <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs text-destructive transition-colors duration-200">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/inventory/raw-materials">View Inventory</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
