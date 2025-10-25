import { Button } from "@/components/ui/button";
import { Package, BarChart3, Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { playSound } from "@/utils/sounds";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  onAddProduct: () => void;
  onShowOverview: () => void;
  totalSales: number;
  totalProfit: number;
  totalReceived: number;
  totalRemaining: number;
}

export const TopBar = ({
  onAddProduct,
  onShowOverview,
  totalSales,
  totalProfit,
  totalReceived,
  totalRemaining,
}: TopBarProps) => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });

  return (
    <div className="h-14 md:h-16 border-b bg-card px-3 md:px-6 flex items-center justify-between card-shadow">
      <div className="flex items-center gap-2 md:gap-3">
        <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <h1 className="text-sm md:text-xl font-semibold truncate">Sales Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden lg:flex items-center gap-6 text-sm">
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
        
        <div className="flex gap-1 md:gap-2">
          <CurrencySwitcher onCurrencyChange={setCurrency} />
          
          <Button 
            onClick={() => {
              playSound('click');
              setTheme(theme === "dark" ? "light" : "dark");
            }} 
            variant="outline" 
            size="sm"
            className="text-xs md:text-sm"
          >
            {theme === "dark" ? (
              <Sun className="h-3 w-3 md:h-4 md:w-4" />
            ) : (
              <Moon className="h-3 w-3 md:h-4 md:w-4" />
            )}
          </Button>
          <Button 
            onClick={() => {
              playSound('click');
              onShowOverview();
            }} 
            variant="outline" 
            size="sm" 
            className="text-xs md:text-sm"
          >
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Overview</span>
          </Button>
          <Button 
            onClick={() => {
              playSound('click');
              onAddProduct();
            }} 
            size="sm" 
            className="text-xs md:text-sm"
          >
            <Package className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                <User className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-xs">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  playSound('click');
                  signOut();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
