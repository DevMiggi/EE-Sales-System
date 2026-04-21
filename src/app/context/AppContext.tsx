import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
console.log("APP API URL:", API_URL);

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Transaction {
  id: string;
  customerName: string;
  amount: number;
  amountPaid: number;
  changeAmount: number;
  date: string;
  status: string;
  items: TransactionItem[];
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  confirmPurchase: (
    amountPaid: number
  ) => Promise<{ receipt_number: string } | undefined>;
  refreshProducts: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    refreshProducts();
    refreshTransactions();
  }, []);

  async function refreshProducts() {
  const res = await fetch(`${API_URL}/products?t=${Date.now()}`);

  const data = await res.json();

  console.log("LIVE PRODUCTS:", data);

  setProducts(
    data.map((item: any) => ({
      id: Number(item.product_id),
      name: item.display_name,
      category: item.group_name,
      price: Number(item.price || 0),
      stock: Number(item.stock_qty || 0),
      barcode: item.barcode ? String(item.barcode).trim() : "",
    }))
  );
}

  async function refreshTransactions() {
    const res = await fetch(`${API_URL}/transactions`);
    const data = await res.json();

    setTransactions(
      data.map((row: any) => ({
        id: row.receipt_number,
        customerName: "Guest",
        amount: Number(row.total_amount),
        amountPaid: Number(row.amount_paid),
        changeAmount: Number(row.change_amount),
        date: row.sale_datetime,
        status: row.status,
        items: row.items || [],
      }))
    );
  }

  function addToCart(product: Product, quantity: number) {
    setCart((prev) => {
      const existing = prev.find((x) => x.product.id === product.id);

      if (existing) {
        return prev.map((x) =>
          x.product.id === product.id
            ? { ...x, quantity: x.quantity + quantity }
            : x
        );
      }

      return [...prev, { product, quantity }];
    });
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((x) => x.product.id !== productId));
  }

  function updateCartQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((x) =>
        x.product.id === productId ? { ...x, quantity } : x
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  async function confirmPurchase(amountPaid: number) {
    if (cart.length === 0) return;

    const userRaw = localStorage.getItem("ee_user");

    if (!userRaw) {
      alert("User not logged in.");
      return;
    }

    const user = JSON.parse(userRaw);

    const payload = {
      cashier_id: user.id,
      amount_paid: amountPaid,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    const res = await fetch(`${API_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed sale");
      return;
    }

    clearCart();
    await refreshProducts();
    await refreshTransactions();

    return {
      receipt_number: data.receipt_number,
    };
  }

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        transactions,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        confirmPurchase,
        refreshProducts,
        refreshTransactions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}