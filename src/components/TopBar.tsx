import { Button } from "@/components/ui/button";
import { Package, BarChart3, LogOut } from "lucide-react";

interface TopBarProps {
  onAddProduct: () => void;
  onShowOverview: () => void;
  totalSales: number;
  totalProfit: number;
  totalReceived: number;
  totalRemaining: number;
  onLogout?: () => void;
  userEmail?: string;
}

export const TopBar = ({
  onAddProduct,
  onShowOverview,
  totalSales,
  totalProfit,
  totalReceived,
  totalRemaining,
  onLogout,
  userEmail,
}: TopBarProps) => {
  return (
    <div className="h-16 border-b bg-card px-6 flex items-center justify-between card-shadow">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">Sales & Customer Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Total Sales</p>
            <p className="font-semibold text-foreground">PKR {totalSales.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Total Profit</p>
            <p className="font-semibold text-success">PKR {totalProfit.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Received</p>
            <p className="font-semibold text-primary">PKR {totalReceived.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Remaining</p>
            <p className="font-semibold text-warning">PKR {totalRemaining.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onShowOverview} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button onClick={onAddProduct} size="sm">
            <Package className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          {onLogout && (
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
