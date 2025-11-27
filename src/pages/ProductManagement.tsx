import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddProductModal } from "@/components/AddProductModal";
import { ProductStockAlert } from "@/components/ProductStockAlert";
import { Plus, Package, TrendingUp, AlertCircle, Loader2, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const ProductManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, addProduct, updateProduct, deleteProduct } = useDatabase();
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAddProduct = async (productData: any) => {
    if (!user?.id) return;
    try {
      await addProduct(productData, user.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete this product? All associated sales will also be deleted.")) {
      try {
        await deleteProduct(id);
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

  const totalProducts = data.products.length;
  const totalStock = data.products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockProducts = data.products.filter(p => (p.stock || 0) <= (p.minStock || 0));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory and products</p>
        </div>
        <Button onClick={() => setShowAddProduct(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Stock</p>
              <p className="text-2xl font-bold">{totalStock}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-warning/10">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-2xl font-bold">{lowStockProducts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <ProductStockAlert products={data.products} />

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.products.map(product => (
            <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${product.color}20` }}
                  >
                    <Package className="h-6 w-6" style={{ color: product.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      PKR {product.costPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock:</span>
                  <Badge variant={(product.stock || 0) <= (product.minStock || 0) ? "destructive" : "secondary"}>
                    {product.stock || 0} units
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{product.category || 'General'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sales:</span>
                  <span className="font-semibold">{product.sales.length}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <AddProductModal
        open={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onSubmit={handleAddProduct}
      />
    </div>
  );
};

export default ProductManagement;
