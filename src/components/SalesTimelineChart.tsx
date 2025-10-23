import { Product } from "@/types/sales";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
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

interface SalesTimelineChartProps {
  products: Product[];
}

export const SalesTimelineChart = ({ products }: SalesTimelineChartProps) => {
  const allSales = products.flatMap((p) => p.sales);
  
  // Group sales by date and calculate totals
  const salesByDate = allSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric" 
    });
    
    if (!acc[date]) {
      acc[date] = { revenue: 0, profit: 0 };
    }
    
    acc[date].revenue += sale.total;
    acc[date].profit += sale.profit;
    
    return acc;
  }, {} as Record<string, { revenue: number; profit: number }>);

  // Sort dates chronologically
  const sortedDates = Object.keys(salesByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Revenue (PKR)",
        data: sortedDates.map((date) => salesByDate[date].revenue),
        borderColor: "hsl(211, 100%, 50%)",
        backgroundColor: "hsl(211, 100%, 50%, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "hsl(211, 100%, 50%)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Profit (PKR)",
        data: sortedDates.map((date) => salesByDate[date].profit),
        borderColor: "hsl(142, 76%, 36%)",
        backgroundColor: "hsl(142, 76%, 36%, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "hsl(142, 76%, 36%)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: PKR ${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(220, 13%, 91%)",
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

  if (allSales.length === 0) {
    return (
      <Card className="p-6 animate-fade-in">
        <h3 className="text-base md:text-lg font-semibold mb-4">Sales & Earnings Timeline</h3>
        <div className="h-[300px] md:h-[400px] flex items-center justify-center text-muted-foreground">
          No sales data available yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 animate-fade-in">
      <h3 className="text-base md:text-lg font-semibold mb-4">Sales & Earnings Timeline</h3>
      <div className="h-[300px] md:h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
};