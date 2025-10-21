export interface Sale {
  id: string;
  customer: string;
  contact: string;
  address: string;
  quantity: number;
  salePrice: number;
  total: number;
  paid: number;
  remaining: number;
  paymentType: "full" | "partial";
  method: "COD" | "Installment" | "Instant Cash" | "e-Cash";
  date: string;
  dueDate?: string;
  status: "Paid" | "Partial" | "Pending";
  profit: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  color: string;
  image: string;
  sales: Sale[];
}

export interface AppData {
  products: Product[];
}

export const PRODUCT_COLORS = [
  "#007AFF", // iOS Blue
  "#34C759", // Green
  "#FF9500", // Orange
  "#FF3B30", // Red
  "#AF52DE", // Purple
  "#5856D6", // Indigo
  "#FF2D55", // Pink
  "#5AC8FA", // Cyan
  "#FFCC00", // Yellow
  "#FF6482", // Coral
  "#00C7BE", // Teal
  "#30D158", // Mint
];

export const PAYMENT_METHODS = ["COD", "Installment", "Instant Cash", "e-Cash"] as const;
