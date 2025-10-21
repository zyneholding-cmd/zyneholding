import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, Sale } from "@/types/sales";
import { toast } from "sonner";

export const useDatabase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products with their sales
  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Fetch sales for each product
      const productsWithSales = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: salesData, error: salesError } = await supabase
            .from("sales")
            .select("*")
            .eq("product_id", product.id)
            .order("date", { ascending: false });

          if (salesError) throw salesError;

          return {
            id: product.id,
            name: product.name,
            costPrice: Number(product.cost_price),
            color: product.color,
            image: product.image || "",
            sales: (salesData || []).map((sale) => ({
              id: sale.id,
              customer: sale.customer,
              contact: sale.contact || "",
              address: sale.address || "",
              quantity: Number(sale.quantity),
              salePrice: Number(sale.sale_price),
              total: Number(sale.total),
              paid: Number(sale.paid),
              remaining: Number(sale.remaining),
              paymentType: sale.payment_type as "full" | "partial",
              method: sale.method as "COD" | "Installment" | "Instant Cash" | "e-Cash",
              date: sale.date,
              dueDate: sale.due_date,
              status: sale.status as "Paid" | "Partial" | "Pending",
              profit: Number(sale.profit),
              notes: sale.notes,
            })),
          };
        })
      );

      setProducts(productsWithSales);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, "id" | "sales">) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          cost_price: product.costPrice,
          color: product.color,
          image: product.image,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        costPrice: Number(data.cost_price),
        color: data.color,
        image: data.image || "",
        sales: [],
      };

      setProducts((prev) => [newProduct, ...prev]);
      toast.success("Product added successfully");
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.image !== undefined) dbUpdates.image = updates.image;

      const { error } = await supabase
        .from("products")
        .update(dbUpdates)
        .eq("id", id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
      throw error;
    }
  };

  const addSale = async (productId: string, sale: Omit<Sale, "id">) => {
    try {
      const { data, error } = await supabase
        .from("sales")
        .insert({
          product_id: productId,
          customer: sale.customer,
          contact: sale.contact,
          address: sale.address,
          quantity: sale.quantity,
          sale_price: sale.salePrice,
          total: sale.total,
          paid: sale.paid,
          remaining: sale.remaining,
          profit: sale.profit,
          payment_type: sale.paymentType,
          method: sale.method,
          status: sale.status,
          date: sale.date,
          due_date: sale.dueDate,
          notes: sale.notes,
        })
        .select()
        .single();

      if (error) throw error;

      const newSale: Sale = {
        id: data.id,
        customer: data.customer,
        contact: data.contact || "",
        address: data.address || "",
        quantity: Number(data.quantity),
        salePrice: Number(data.sale_price),
        total: Number(data.total),
        paid: Number(data.paid),
        remaining: Number(data.remaining),
        paymentType: data.payment_type as "full" | "partial",
        method: data.method as "COD" | "Installment" | "Instant Cash" | "e-Cash",
        date: data.date,
        dueDate: data.due_date,
        status: data.status as "Paid" | "Partial" | "Pending",
        profit: Number(data.profit),
        notes: data.notes,
      };

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, sales: [newSale, ...p.sales] } : p
        )
      );
      toast.success("Sale added successfully");
      return newSale;
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Failed to add sale");
      throw error;
    }
  };

  const updateSale = async (
    productId: string,
    saleId: string,
    updates: Partial<Sale>
  ) => {
    try {
      const dbUpdates: any = {};
      if (updates.customer !== undefined) dbUpdates.customer = updates.customer;
      if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
      if (updates.total !== undefined) dbUpdates.total = updates.total;
      if (updates.paid !== undefined) dbUpdates.paid = updates.paid;
      if (updates.remaining !== undefined) dbUpdates.remaining = updates.remaining;
      if (updates.profit !== undefined) dbUpdates.profit = updates.profit;
      if (updates.paymentType !== undefined) dbUpdates.payment_type = updates.paymentType;
      if (updates.method !== undefined) dbUpdates.method = updates.method;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from("sales")
        .update(dbUpdates)
        .eq("id", saleId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                sales: p.sales.map((s) =>
                  s.id === saleId ? { ...s, ...updates } : s
                ),
              }
            : p
        )
      );
      toast.success("Sale updated successfully");
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error("Failed to update sale");
      throw error;
    }
  };

  const deleteSale = async (productId: string, saleId: string) => {
    try {
      const { error } = await supabase.from("sales").delete().eq("id", saleId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, sales: p.sales.filter((s) => s.id !== saleId) }
            : p
        )
      );
      toast.success("Sale deleted successfully");
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale");
      throw error;
    }
  };

  return {
    data: { products },
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    updateSale,
    deleteSale,
  };
};
