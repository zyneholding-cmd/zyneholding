import { Bar, Doughnut } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Product } from "@/types/sales";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface ProductStatsChartsProps {
  product: Product;
}

export const ProductStatsCharts = ({ product }: ProductStatsChartsProps) => {
  // Payment status breakdown
  const paidSales = product.sales.filter((s) => s.status === "Paid").length;
  const partialSales = product.sales.filter((s) => s.status === "Partial").length;
  const pendingSales = product.sales.filter((s) => s.status === "Pending").length;

  const statusData = {
    labels: ["Paid", "Partial", "Pending"],
    datasets: [
      {
        data: [paidSales, partialSales, pendingSales],
        backgroundColor: ["#34C759", "#FF9500", "#FF3B30"],
        borderWidth: 0,
      },
    ],
  };

  // Monthly sales comparison (last 6 sales)
  const recentSales = [...product.sales].slice(0, 6).reverse();
  const monthlyData = {
    labels: recentSales.map((s) =>
      new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Sale Amount (PKR)",
        data: recentSales.map((s) => s.total),
        backgroundColor: product.color,
        borderRadius: 8,
      },
      {
        label: "Profit (PKR)",
        data: recentSales.map((s) => s.profit),
        backgroundColor: "#34C759",
        borderRadius: 8,
      },
    ],
  };

  // Payment method breakdown for this product
  const paymentMethods = {
    COD: product.sales.filter((s) => s.method === "COD").reduce((sum, s) => sum + s.total, 0),
    Installment: product.sales
      .filter((s) => s.method === "Installment")
      .reduce((sum, s) => sum + s.total, 0),
    "Instant Cash": product.sales
      .filter((s) => s.method === "Instant Cash")
      .reduce((sum, s) => sum + s.total, 0),
    "e-Cash": product.sales
      .filter((s) => s.method === "e-Cash")
      .reduce((sum, s) => sum + s.total, 0),
  };

  const methodData = {
    labels: Object.keys(paymentMethods),
    datasets: [
      {
        data: Object.values(paymentMethods),
        backgroundColor: ["#007AFF", "#34C759", "#FF9500", "#AF52DE"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <Card className="p-4 md:p-6">
        <h3 className="font-semibold mb-4 text-sm md:text-base">Payment Status</h3>
        <div className="h-[200px] md:h-[250px] flex items-center justify-center">
          <Doughnut
            data={statusData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    font: { size: 11 },
                  },
                },
              },
            }}
          />
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="font-semibold mb-4 text-sm md:text-base">Recent Sales Comparison</h3>
        <div className="h-[200px] md:h-[250px]">
          <Bar
            data={monthlyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    font: { size: 11 },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: any) => `${value.toLocaleString()}`,
                    font: { size: 10 },
                  },
                },
                x: {
                  ticks: {
                    font: { size: 10 },
                  },
                },
              },
            }}
          />
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="font-semibold mb-4 text-sm md:text-base">Payment Methods</h3>
        <div className="h-[200px] md:h-[250px] flex items-center justify-center">
          <Doughnut
            data={methodData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    font: { size: 11 },
                  },
                },
              },
            }}
          />
        </div>
      </Card>
    </div>
  );
};
