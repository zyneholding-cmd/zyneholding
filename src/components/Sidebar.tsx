import { Product } from "@/types/sales";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SidebarProps {
  products: Product[];
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}

export const Sidebar = ({
  products,
  selectedProductId,
  onSelectProduct,
  onDeleteProduct,
}: SidebarProps) => {
  const calculateProductTotal = (product: Product) => {
    return product.sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  return (
    <div className="w-full md:w-64 border-r bg-sidebar h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Products
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {products.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products yet. Add your first product to get started.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className={`relative group rounded-lg p-3 cursor-pointer transition-all animate-fade-in ${
                  selectedProductId === product.id
                    ? "bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/50"
                }`}
                onClick={() => onSelectProduct(product.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: product.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      PKR {calculateProductTotal(product).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProduct(product.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
