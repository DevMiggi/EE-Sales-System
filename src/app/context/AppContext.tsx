import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
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
  confirmPurchase: (amountPaid: number) => Promise<{ receipt_number: string } | undefined>;
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
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();

      setProducts(
        data.map((item: any) => ({
          id: item.product_id,
          name: item.display_name,
          category: item.group_name,
          price: Number(item.price || 0),
          stock: Number(item.stock_qty || 0),
        }))
      );
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  async function refreshTransactions() {
    try {
      const res = await fetch(`${API_URL}/transactions`);
      const data = await res.json();

      setTransactions(
        data.map((row: any) => ({
          id: row.receipt_number,
          customerName: row.customer_name || 'Guest',
          amount: Number(row.total_amount || 0),
          amountPaid: Number(row.amount_paid || 0),
          changeAmount: Number(row.change_amount || 0),
          date: row.sale_datetime,
          status: row.status === 'completed' ? 'Confirm' : row.status,
          items: Array.isArray(row.items)
            ? row.items.map((item: any) => ({
                productName: item.product_name,
                quantity: Number(item.quantity || 0),
                unitPrice: Number(item.unit_price || 0),
                lineTotal: Number(item.line_total || 0),
              }))
            : [],
        }))
      );
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  function addToCart(product: Product, quantity: number) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      return [...prev, { product, quantity }];
    });
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  function updateCartQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(quantity, item.product.stock),
            }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  async function confirmPurchase(amountPaid: number) {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    if (amountPaid < totalAmount) {
      alert('Amount paid is not enough.');
      return;
    }

    try {
      const payload = {
        customerName: 'Guest',
        amount_paid: amountPaid,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save sale');
      }

      clearCart();
      await refreshProducts();
      await refreshTransactions();

      return { receipt_number: data.receipt_number };
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to complete transaction.');
    }
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
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}