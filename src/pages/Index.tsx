import { useState } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { ProductChart } from "@/components/ProductChart";
import { AddProductModal } from "@/components/AddProductModal";
import { AddSaleModal } from "@/components/AddSaleModal";
import { SalesHistory } from "@/components/SalesHistory";
import { CustomerDetailModal } from "@/components/CustomerDetailModal";
import { OverviewDashboard } from "@/components/OverviewDashboard";
import { Reminders } from "@/components/Reminders";
import { ProductStatsCharts } from "@/components/ProductStatsCharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Menu } from "lucide-react";
import { Sale } from "@/types/sales";
import { toast } from "sonner";

const Index = () => {
  const { data, isLoading, addProduct, updateProduct, deleteProduct, addSale, updateSale, deleteSale } = useDatabase();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const selectedProduct = data.products.find((p) => p.id === selectedProductId) || null;

  const totalSales = data.products.reduce(
    (sum, p) => sum + p.sales.reduce((s, sale) => s + sale.total, 0),
    0
  );
  const totalProfit = data.products.reduce(
    (sum, p) => sum + p.sales.reduce((s, sale) => s + sale.profit, 0),
    0
  );
  const totalReceived = data.products.reduce(
    (sum, p) => sum + p.sales.reduce((s, sale) => s + sale.paid, 0),
    0
  );
  const totalRemaining = data.products.reduce(
    (sum, p) => sum + p.sales.reduce((s, sale) => s + sale.remaining, 0),
    0
  );

  const handleAddProduct = async (productData: any) => {
    try {
      const newProduct = await addProduct(productData);
      setSelectedProductId(newProduct.id);
    } catch (error) {
      // Error already handled by useDatabase hook
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        if (selectedProductId === id) {
          setSelectedProductId(null);
        }
      } catch (error) {
        // Error already handled by useDatabase hook
      }
    }
  };

  const handleAddSale = async (saleData: any) => {
    if (selectedProduct) {
      try {
        await addSale(selectedProduct.id, saleData);
      } catch (error) {
        // Error already handled by useDatabase hook
      }
    }
  };

  const handleUpdateSale = async (updates: Partial<Sale>) => {
    if (editingSale && selectedProduct) {
      try {
        await updateSale(selectedProduct.id, editingSale.id, updates);
      } catch (error) {
        // Error already handled by useDatabase hook
      }
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (selectedProduct && confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteSale(selectedProduct.id, saleId);
      } catch (error) {
        // Error already handled by useDatabase hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar
        onAddProduct={() => setShowAddProduct(true)}
        onShowOverview={() => setShowOverview(!showOverview)}
        totalSales={totalSales}
        totalProfit={totalProfit}
        totalReceived={totalReceived}
        totalRemaining={totalRemaining}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Menu Button */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar
              products={data.products}
              selectedProductId={selectedProductId}
              onSelectProduct={(id) => {
                setSelectedProductId(id);
                setShowOverview(false);
                setIsMobileSidebarOpen(false);
              }}
              onDeleteProduct={handleDeleteProduct}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            products={data.products}
            selectedProductId={selectedProductId}
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              setShowOverview(false);
            }}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>

        <main className="flex-1 overflow-auto">
          {showOverview ? (
            <OverviewDashboard products={data.products} />
          ) : selectedProduct ? (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
              <Reminders products={data.products} />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 flex-wrap">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedProduct.color }}
                    />
                    <span className="break-words">{selectedProduct.name}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cost Price: PKR {selectedProduct.costPrice.toLocaleString()}
                  </p>
                </div>
                <Button onClick={() => setShowAddSale(true)} className="w-full sm:w-auto flex-shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card className="p-3 md:p-4 text-center">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-lg md:text-2xl font-bold break-all">
                    PKR{" "}
                    {selectedProduct.sales
                      .reduce((sum, s) => sum + s.total, 0)
                      .toLocaleString()}
                  </p>
                </Card>
                <Card className="p-3 md:p-4 text-center bg-success/5">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-lg md:text-2xl font-bold text-success break-all">
                    PKR{" "}
                    {selectedProduct.sales
                      .reduce((sum, s) => sum + s.profit, 0)
                      .toLocaleString()}
                  </p>
                </Card>
                <Card className="p-3 md:p-4 text-center">
                  <p className="text-xs md:text-sm text-muted-foreground">Quantity Sold</p>
                  <p className="text-lg md:text-2xl font-bold">
                    {selectedProduct.sales.reduce((sum, s) => sum + s.quantity, 0)}
                  </p>
                </Card>
                <Card className="p-3 md:p-4 text-center bg-warning/5">
                  <p className="text-xs md:text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-lg md:text-2xl font-bold text-warning break-all">
                    PKR{" "}
                    {selectedProduct.sales
                      .reduce((sum, s) => sum + s.remaining, 0)
                      .toLocaleString()}
                  </p>
                </Card>
              </div>

              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="chart">Performance</TabsTrigger>
                  <TabsTrigger value="stats">Analytics</TabsTrigger>
                  <TabsTrigger value="sales">History</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="mt-4 md:mt-6">
                  <Card className="p-4 md:p-6">
                    {selectedProduct.sales.length > 0 ? (
                      <ProductChart product={selectedProduct} />
                    ) : (
                      <div className="h-[300px] md:h-[400px] flex items-center justify-center text-muted-foreground text-sm md:text-base">
                        No sales data available. Add your first sale to see the chart.
                      </div>
                    )}
                  </Card>
                </TabsContent>
                <TabsContent value="stats" className="mt-4 md:mt-6">
                  {selectedProduct.sales.length > 0 ? (
                    <ProductStatsCharts product={selectedProduct} />
                  ) : (
                    <Card className="p-4 md:p-6">
                      <div className="h-[300px] md:h-[400px] flex items-center justify-center text-muted-foreground text-sm md:text-base">
                        No sales data available. Add your first sale to see analytics.
                      </div>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="sales" className="mt-4 md:mt-6">
                  <SalesHistory
                    sales={selectedProduct.sales}
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
            </div>
          ) : (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center space-y-4 max-w-md">
                <h2 className="text-xl md:text-2xl font-bold text-muted-foreground">
                  Welcome to Sales Dashboard
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Select a product from the menu or add a new one to get started
                </p>
                <Button onClick={() => setShowAddProduct(true)} size="lg" className="w-full sm:w-auto">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <AddProductModal
        open={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onSubmit={handleAddProduct}
      />

      <AddSaleModal
        open={showAddSale}
        onClose={() => setShowAddSale(false)}
        onSubmit={handleAddSale}
        product={selectedProduct}
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

export default Index;
