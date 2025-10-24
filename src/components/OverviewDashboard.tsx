import { Product } from "@/types/sales";
import { Line, Doughnut } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { ProductsComparisonChart } from "@/components/ProductsComparisonChart";
import { SalesTimelineChart } from "@/components/SalesTimelineChart";
import { StatCard } from "@/components/StatCard";
import { BusinessTips } from "@/components/BusinessTips";
import { ProductStockAlert } from "@/components/ProductStockAlert";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OverviewDashboardProps {
  products: Product[];
}

export const OverviewDashboard = ({ products }: OverviewDashboardProps) => {
  const allSales = products.flatMap((p) => p.sales);
  
  const totalSales = allSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = allSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalReceived = allSales.reduce((sum, sale) => sum + sale.paid, 0);
  const totalRemaining = allSales.reduce((sum, sale) => sum + sale.remaining, 0);

  // Payment methods breakdown
  const paymentMethods = {
    COD: allSales.filter((s) => s.method === "COD").reduce((sum, s) => sum + s.total, 0),
    Installment: allSales.filter((s) => s.method === "Installment").reduce((sum, s) => sum + s.total, 0),
    "Instant Cash": allSales.filter((s) => s.method === "Instant Cash").reduce((sum, s) => sum + s.total, 0),
    "e-Cash": allSales.filter((s) => s.method === "e-Cash").reduce((sum, s) => sum + s.total, 0),
  };

  const doughnutData = {
    labels: Object.keys(paymentMethods),
    datasets: [
      {
        data: Object.values(paymentMethods),
        backgroundColor: ["#007AFF", "#34C759", "#FF9500", "#AF52DE"],
        borderWidth: 0,
      },
    ],
  };

  const sortedSales = [...allSales].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const lineData = {
    labels: sortedSales.map((s) =>
      new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Received (PKR)",
        data: sortedSales.map((s) => s.paid),
        borderColor: "#34C759",
        backgroundColor: "#34C75933",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Remaining (PKR)",
        data: sortedSales.map((s) => s.remaining),
        borderColor: "#FF9500",
        backgroundColor: "#FF950033",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold animate-fade-in">Global Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Sales" value={totalSales} />
        <StatCard 
          label="Total Profit" 
          value={totalProfit} 
          className="bg-success/5" 
          textClassName="text-success"
        />
        <StatCard 
          label="Total Received" 
          value={totalReceived} 
          className="bg-primary/5" 
          textClassName="text-primary"
        />
        <StatCard 
          label="Total Remaining" 
          value={totalRemaining} 
          className="bg-warning/5" 
          textClassName="text-warning"
        />
      </div>

      {/* Stock Alerts */}
      <ProductStockAlert products={products} />

      {/* Sales Timeline Chart */}
      <SalesTimelineChart products={products} />

      {/* Advanced Analytics */}
      <AdvancedAnalytics products={products} />

      {/* Business Tips */}
      <BusinessTips />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-4">Payment Methods Distribution</h3>
          <div className="h-[250px] md:h-[300px] flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-4">Received vs Remaining Over Time</h3>
          <div className="h-[250px] md:h-[300px]">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value: any) => `PKR ${value.toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {/* Products Comparison */}
      {products.length > 0 && <ProductsComparisonChart products={products} />}
    </div>
  );
};
