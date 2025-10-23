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
  
  // Generate daily date range from first sale to today
  const generateDateRange = () => {
    if (allSales.length === 0) return [];
    
    const dates = allSales.map(s => new Date(s.date).getTime());
    const minDate = new Date(Math.min(...dates));
    const today = new Date();
    
    const dateArray = [];
    let currentDate = new Date(minDate);
    
    while (currentDate <= today) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateArray;
  };

  const allDates = generateDateRange();
  
  // Group sales by date
  const salesByDate = allSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric"
    });
    
    if (!acc[date]) {
      acc[date] = { revenue: 0, profit: 0 };
    }
    
    acc[date].revenue += sale.total;
    acc[date].profit += sale.profit;
    
    return acc;
  }, {} as Record<string, { revenue: number; profit: number }>);

  // Create labels with all dates (including zeros)
  const labels = allDates.map(date => 
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  // Fill in data with zeros for missing dates
  const revenueData = labels.map(label => salesByDate[label]?.revenue || 0);
  const profitData = labels.map(label => salesByDate[label]?.profit || 0);

  // Calculate performance metrics
  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);
  const avgDailyRevenue = totalRevenue / labels.length;
  const lastWeekRevenue = revenueData.slice(-7).reduce((a, b) => a + b, 0);
  const prevWeekRevenue = revenueData.slice(-14, -7).reduce((a, b) => a + b, 0);
  const growthRate = prevWeekRevenue > 0 
    ? ((lastWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100 
    : 0;

  const performanceMessage = 
    growthRate > 20 ? "🚀 Exceptional Growth! Your sales are soaring!" :
    growthRate > 10 ? "📈 Great Performance! Keep up the momentum!" :
    growthRate > 0 ? "✅ Steady Progress! You're on the right track!" :
    growthRate > -10 ? "⚡ Room for Improvement. Try new strategies!" :
    "💪 Performance is Weak. Time to boost your sales game!";

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Revenue (PKR)",
        data: revenueData,
        borderColor: "hsl(211, 100%, 50%)",
        backgroundColor: "hsl(211, 100%, 50%, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 7,
        pointBackgroundColor: "hsl(211, 100%, 50%)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 3,
      },
      {
        label: "Profit (PKR)",
        data: profitData,
        borderColor: "hsl(142, 76%, 36%)",
        backgroundColor: "hsl(142, 76%, 36%, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 7,
        pointBackgroundColor: "hsl(142, 76%, 36%)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 3,
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
    animation: {
      duration: 1500,
      easing: "easeInOutQuart" as const,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        padding: 12,
        cornerRadius: 8,
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
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 10,
          callback: (value: any) => `PKR ${value.toLocaleString()}`,
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h3 className="text-base md:text-lg font-semibold">Sales & Earnings Timeline</h3>
        <div className={`text-xs md:text-sm font-medium px-3 py-1.5 rounded-full ${
          growthRate > 10 ? "bg-success/10 text-success" :
          growthRate > 0 ? "bg-primary/10 text-primary" :
          "bg-warning/10 text-warning"
        }`}>
          {performanceMessage}
        </div>
      </div>
      <div className="h-[300px] md:h-[400px]">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="p-2 rounded-lg bg-primary/5">
          <p className="text-xs text-muted-foreground">Avg Daily Revenue</p>
          <p className="text-sm font-semibold text-primary">PKR {Math.round(avgDailyRevenue).toLocaleString()}</p>
        </div>
        <div className="p-2 rounded-lg bg-success/5">
          <p className="text-xs text-muted-foreground">Last 7 Days</p>
          <p className="text-sm font-semibold text-success">PKR {Math.round(lastWeekRevenue).toLocaleString()}</p>
        </div>
        <div className="p-2 rounded-lg bg-warning/5">
          <p className="text-xs text-muted-foreground">Growth Rate</p>
          <p className={`text-sm font-semibold ${growthRate >= 0 ? 'text-success' : 'text-warning'}`}>
            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </p>
        </div>
        <div className="p-2 rounded-lg bg-accent/5">
          <p className="text-xs text-muted-foreground">Total Days</p>
          <p className="text-sm font-semibold text-accent">{labels.length} days</p>
        </div>
      </div>
    </Card>
  );
};