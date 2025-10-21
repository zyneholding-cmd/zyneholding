import { useState, useEffect } from "react";
import { AppData, Product, Sale } from "@/types/sales";

const STORAGE_KEY = "sales_dashboard_data";

const getInitialData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
  }
  return { products: [] };
};

export const useLocalStorage = () => {
  const [data, setData] = useState<AppData>(getInitialData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [data]);

  const addProduct = (product: Omit<Product, "id" | "sales">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      sales: [],
    };
    setData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deleteProduct = (id: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  const addSale = (productId: string, sale: Omit<Sale, "id">) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
    };
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, sales: [...p.sales, newSale] } : p
      ),
    }));
    return newSale;
  };

  const updateSale = (productId: string, saleId: string, updates: Partial<Sale>) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              sales: p.sales.map((s) => (s.id === saleId ? { ...s, ...updates } : s)),
            }
          : p
      ),
    }));
  };

  const deleteSale = (productId: string, saleId: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, sales: p.sales.filter((s) => s.id !== saleId) } : p
      ),
    }));
  };

  return {
    data,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    updateSale,
    deleteSale,
  };
};
