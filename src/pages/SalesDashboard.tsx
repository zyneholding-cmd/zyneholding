import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddSaleModal } from "@/components/AddSaleModal";
import { SalesHistory } from "@/components/SalesHistory";
import { CustomerDetailModal } from "@/components/CustomerDetailModal";
import { StatCard } from "@/components/StatCard";
import { Plus, TrendingUp, DollarSign, Users, Clock, Loader2 } from "lucide-react";
import { Sale } from "@/types/sales";
import { useAuth } from "@/contexts/AuthContext";

const SalesDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, addSale, updateSale, deleteSale } = useDatabase();
  const [showAddSale, setShowAddSale] = useState(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const allSales = data.products.flatMap(p => p.sales);
  const totalSales = allSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = allSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalReceived = allSales.reduce((sum, sale) => sum + sale.paid, 0);
  const totalRemaining = allSales.reduce((sum, sale) => sum + sale.remaining, 0);

  const recentSales = [...allSales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const handleAddSale = async (saleData: any) => {
    if (user?.id && data.products.length > 0) {
      try {
        await addSale(data.products[0].id, saleData, user.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleUpdateSale = async (updates: Partial<Sale>) => {
    if (editingSale) {
      const product = data.products.find(p => 
        p.sales.some(s => s.id === editingSale.id)
      );
      if (product) {
        try {
          await updateSale(product.id, editingSale.id, updates);
        } catch (error) {
          // Error handled by hook
        }
      }
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const product = data.products.find(p => p.sales.some(s => s.id === saleId));
    if (product && confirm("Delete this sale?")) {
      try {
        await deleteSale(product.id, saleId);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  if (authLoading || !user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and track all sales activity</p>
        </div>
        <Button onClick={() => setShowAddSale(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Sales" value={totalSales} />
        <StatCard 
          label="Total Profit" 
          value={totalProfit}
          className="bg-success/5"
          textClassName="text-success"
        />
        <StatCard 
          label="Received" 
          value={totalReceived}
          className="bg-primary/5"
          textClassName="text-primary"
        />
        <StatCard 
          label="Pending" 
          value={totalRemaining}
          className="bg-warning/5"
          textClassName="text-warning"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Sales</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <SalesHistory
            sales={allSales}
            product={null}
            onEditSale={(sale) => {
              setEditingSale(sale);
              setShowCustomerDetail(true);
            }}
            onDeleteSale={handleDeleteSale}
            onViewCustomer={(sale) => {
              setEditingSale(sale);
              setShowCustomerDetail(true);
            }}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <SalesHistory
            sales={recentSales}
            product={null}
            onEditSale={(sale) => {
              setEditingSale(sale);
              setShowCustomerDetail(true);
            }}
            onDeleteSale={handleDeleteSale}
            onViewCustomer={(sale) => {
              setEditingSale(sale);
              setShowCustomerDetail(true);
            }}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <SalesHistory
            sales={allSales.filter(s => s.remaining > 0)}
            product={null}
            onEditSale={(sale) => {
              setEditingSale(sale);
              setShowCustomerDetail(true);
            }}
            onDeleteSale={handleDeleteSale}
            onViewCustomer={(sale) => {
              setEditingSale(sale);
              setShowCustomerDetail(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <AddSaleModal
        open={showAddSale}
        onClose={() => setShowAddSale(false)}
        onSubmit={handleAddSale}
        product={data.products[0] || null}
      />

      <CustomerDetailModal
        open={showCustomerDetail}
        onClose={() => {
          setShowCustomerDetail(false);
          setEditingSale(null);
        }}
        sale={editingSale}
        onUpdate={handleUpdateSale}
      />
    </div>
  );
};

export default SalesDashboard;
