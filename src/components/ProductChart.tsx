import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Product } from "@/types/sales";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProductChartProps {
  product: Product;
}

export const ProductChart = ({ product }: ProductChartProps) => {
  const sortedSales = [...product.sales].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const labels = sortedSales.map((sale) =>
    new Date(sale.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const salesData = sortedSales.map((sale) => sale.total);
  const profitData = sortedSales.map((sale) => sale.profit);

  const data = {
    labels,
    datasets: [
      {
        label: "Sales (PKR)",
        data: salesData,
        borderColor: product.color,
        backgroundColor: `${product.color}33`,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: product.color,
      },
      {
        label: "Profit (PKR)",
        data: profitData,
        borderColor: "#34C759",
        backgroundColor: "#34C75933",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#34C759",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "#ddd",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: PKR ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value: any) => `PKR ${value.toLocaleString()}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-[300px] md:h-[400px] w-full">
      <Line data={data} options={options} />
    </div>
  );
};
