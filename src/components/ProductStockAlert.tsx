import { Product } from "@/types/sales";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductStockAlertProps {
  products: Product[];
}

export const ProductStockAlert = ({ products }: ProductStockAlertProps) => {
  const lowStockProducts = products.filter(
    (p) => (p.stock || 0) <= (p.minStock || 5) && (p.stock || 0) > 0
  );

  const outOfStockProducts = products.filter((p) => (p.stock || 0) === 0);

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {outOfStockProducts.length > 0 && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Out of Stock!</AlertTitle>
          <AlertDescription>
            {outOfStockProducts.map((p) => p.name).join(", ")} - Restock immediately
          </AlertDescription>
        </Alert>
      )}

      {lowStockProducts.length > 0 && (
        <Alert className="border-warning text-warning animate-fade-in">
          <Package className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(", ")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
