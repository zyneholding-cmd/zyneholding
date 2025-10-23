import { Product } from "@/types/sales";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface RemindersProps {
  products: Product[];
}

export const Reminders = ({ products }: RemindersProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const pendingPayments = products.flatMap((product) =>
    product.sales
      .filter((sale) => sale.remaining > 0)
      .map((sale) => ({
        customer: sale.customer,
        amount: sale.remaining,
        dueDate: sale.dueDate,
        product: product.name,
        status: sale.status,
      }))
  );

  useEffect(() => {
    if (pendingPayments.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % pendingPayments.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [pendingPayments.length]);

  if (pendingPayments.length === 0) {
    return null;
  }

  const currentPayment = pendingPayments[currentIndex];

  return (
    <Card className="p-4 bg-warning/10 border-warning/30 animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-warning mb-2 text-sm md:text-base">Payment Reminder</h3>
          <div className="text-sm animate-fade-in" key={currentIndex}>
            <p className="font-medium truncate">
              {currentPayment.customer} - {currentPayment.product}
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-warning">
                PKR {currentPayment.amount.toLocaleString()}
              </span>{" "}
              payment {currentPayment.status === "Partial" ? "remaining" : "pending"}
              {currentPayment.dueDate && (
                <span className="block mt-1 text-xs">
                  Due: {new Date(currentPayment.dueDate).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          {pendingPayments.length > 1 && (
            <div className="flex gap-1 mt-3">
              {pendingPayments.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? "w-8 bg-warning" 
                      : "w-1.5 bg-warning/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
