import { Product } from "@/types/sales";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RemindersProps {
  products: Product[];
}

export const Reminders = ({ products }: RemindersProps) => {
  const overdueReminders: { customer: string; product: string; days: number; remaining: number }[] = [];

  products.forEach((product) => {
    product.sales.forEach((sale) => {
      if (sale.status !== "Paid") {
        const daysSinceSale = Math.floor(
          (Date.now() - new Date(sale.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceSale >= 3) {
          overdueReminders.push({
            customer: sale.customer,
            product: product.name,
            days: daysSinceSale,
            remaining: sale.remaining,
          });
        }
      }
    });
  });

  if (overdueReminders.length === 0) return null;

  return (
    <div className="space-y-2">
      {overdueReminders.map((reminder, index) => (
        <Alert key={index} variant="destructive" className="bg-warning/10 border-warning text-warning-foreground">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{reminder.customer}</strong> has not paid for {reminder.product} ({reminder.days}+ days). 
            Remaining: <strong>PKR {reminder.remaining.toLocaleString()}</strong>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
