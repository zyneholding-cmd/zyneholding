import { Sale, Product } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { exportSalesToPDF } from "@/utils/pdfExport";

interface SalesHistoryProps {
  sales: Sale[];
  onEditSale: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
  onViewCustomer: (sale: Sale) => void;
  product?: Product;
}

export const SalesHistory = ({ sales, onEditSale, onDeleteSale, onViewCustomer, product }: SalesHistoryProps) => {
  const handleExportPDF = () => {
    if (product) {
      exportSalesToPDF(product);
    }
  };

  const getStatusColor = (status: Sale["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-success/10 text-success border-success/20";
      case "Partial":
        return "bg-warning/10 text-warning border-warning/20";
      case "Pending":
        return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  return (
    <div className="space-y-3">
      {product && sales.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      )}
      {sales.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No sales recorded yet. Add your first sale to get started.
        </div>
      ) : (
        sales.map((sale) => (
          <div
            key={sale.id}
            className="bg-card rounded-lg p-4 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{sale.customer}</h3>
                  <Badge variant="outline" className={getStatusColor(sale.status)}>
                    {sale.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{sale.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sale Price</p>
                    <p className="font-medium">PKR {sale.salePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paid</p>
                    <p className="font-medium text-success">PKR {sale.paid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className="font-medium text-warning">PKR {sale.remaining.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Method: {sale.method}</span>
                  <span>Date: {new Date(sale.date).toLocaleDateString()}</span>
                  {sale.contact && <span>Contact: {sale.contact}</span>}
                </div>
              </div>

              <div className="flex gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewCustomer(sale)}
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditSale(sale)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteSale(sale.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
