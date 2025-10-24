import { Product } from "@/types/sales";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Award } from "lucide-react";
import { useMemo } from "react";

interface AdvancedAnalyticsProps {
  products: Product[];
}

export const AdvancedAnalytics = ({ products }: AdvancedAnalyticsProps) => {
  const analytics = useMemo(() => {
    const allSales = products.flatMap((p) => p.sales);
    const totalRevenue = allSales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit = allSales.reduce((sum, s) => sum + s.profit, 0);
    const totalCustomers = new Set(allSales.map((s) => s.customer)).size;
    const avgOrderValue = totalRevenue / (allSales.length || 1);
    const profitMargin = (totalProfit / totalRevenue) * 100 || 0;

    const topProduct = products.reduce((top, p) => {
      const revenue = p.sales.reduce((sum, s) => sum + s.total, 0);
      const topRevenue = top.sales.reduce((sum, s) => sum + s.total, 0);
      return revenue > topRevenue ? p : top;
    }, products[0]);

    const topCustomer = allSales.reduce((top: any, sale) => {
      const customerTotal = allSales
        .filter((s) => s.customer === sale.customer)
        .reduce((sum, s) => sum + s.total, 0);
      return customerTotal > (top.total || 0) ? { name: sale.customer, total: customerTotal } : top;
    }, {});

    return {
      totalRevenue,
      totalProfit,
      totalCustomers,
      avgOrderValue,
      profitMargin,
      topProduct,
      topCustomer,
      totalProducts: products.length,
      totalOrders: allSales.length,
    };
  }, [products]);

  const MetricCard = ({ icon: Icon, title, value, subtitle, trend }: any) => (
    <Card className="p-4 hover:shadow-lg transition-shadow animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-success/10' : 'bg-primary/10'}`}>
          <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-success' : 'text-primary'}`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Advanced Business Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingUp}
          title="Profit Margin"
          value={`${analytics.profitMargin.toFixed(1)}%`}
          subtitle="Overall profitability"
          trend="up"
        />
        <MetricCard
          icon={DollarSign}
          title="Avg Order Value"
          value={`PKR ${analytics.avgOrderValue.toLocaleString()}`}
          subtitle="Per transaction"
        />
        <MetricCard
          icon={Users}
          title="Total Customers"
          value={analytics.totalCustomers}
          subtitle={`${analytics.totalOrders} total orders`}
        />
        <MetricCard
          icon={Package}
          title="Product Catalog"
          value={analytics.totalProducts}
          subtitle="Active products"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Award className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Top Performing Product</h4>
          </div>
          {analytics.topProduct && (
            <div>
              <p className="font-medium">{analytics.topProduct.name}</p>
              <p className="text-sm text-muted-foreground">
                {analytics.topProduct.sales.length} sales • PKR{" "}
                {analytics.topProduct.sales.reduce((sum, s) => sum + s.total, 0).toLocaleString()}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Top Customer</h4>
          </div>
          {analytics.topCustomer.name && (
            <div>
              <p className="font-medium">{analytics.topCustomer.name}</p>
              <p className="text-sm text-muted-foreground">
                Total Purchases: PKR {analytics.topCustomer.total.toLocaleString()}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
