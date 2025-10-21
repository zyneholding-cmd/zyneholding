import { Bar } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Product } from "@/types/sales";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProductsComparisonChartProps {
  products: Product[];
}

export const ProductsComparisonChart = ({ products }: ProductsComparisonChartProps) => {
  const topProducts = products
    .map((p) => ({
      name: p.name,
      color: p.color,
      total: p.sales.reduce((sum, s) => sum + s.total, 0),
      profit: p.sales.reduce((sum, s) => sum + s.profit, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const data = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        label: "Total Sales (PKR)",
        data: topProducts.map((p) => p.total),
        backgroundColor: topProducts.map((p) => p.color),
        borderRadius: 8,
      },
      {
        label: "Total Profit (PKR)",
        data: topProducts.map((p) => p.profit),
        backgroundColor: "#34C759",
        borderRadius: 8,
      },
    ],
  };

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-4">Top Products Performance</h3>
      <div className="h-[250px] md:h-[300px]">
        <Bar
          data={data}
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
  );
};
