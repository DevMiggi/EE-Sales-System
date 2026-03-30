import { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  cost: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  customer: string;
  items: CartItem[];
  amount: number;
  status: 'Confirm' | 'Pending';
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  confirmPurchase: (customer: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Plastic Folder (A4)', category: 'Offices Supplies', price: 25, stock: 150, cost: 15 },
    { id: '2', name: 'Clear Plastic Envelopes', category: 'Office Supplies', price: 35, stock: 200, cost: 20 },
    { id: '3', name: 'Plastic Binders', category: 'Office Supplies', price: 45, stock: 120, cost: 30 },
    { id: '4', name: 'Plastic Storage', category: 'Storage', price: 150, stock: 80, cost: 100 },
    { id: '5', name: 'Plastic Dividers', category: 'Offices Supplies', price: 30, stock: 180, cost: 18 },
    { id: '6', name: 'Document Organizer', category: 'Office Supplies', price: 85, stock: 60, cost: 55 },
    { id: '7', name: 'File Folders Set', category: 'Offices Supplies', price: 120, stock: 90, cost: 80 },
    { id: '8', name: 'Plastic Sleeves', category: 'Office Supplies', price: 40, stock: 220, cost: 25 },
    { id: '9', name: 'Storage Boxes', category: 'Storage', price: 180, stock: 45, cost: 120 },
    { id: '10', name: 'Index Dividers', category: 'Office Supplies', price: 55, stock: 140, cost: 35 },
    { id: '11', name: 'Expandable Folders', category: 'Offices Supplies', price: 95, stock: 75, cost: 65 },
    { id: '12', name: 'Plastic Clips', category: 'Office Supplies', price: 20, stock: 250, cost: 12 },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: 'TR-001', 
      date: '02-14-2026', 
      customer: 'John Doe', 
      amount: 299, 
      status: 'Confirm', 
      items: []
    },
    { 
      id: 'TR-002', 
      date: '02-14-2026', 
      customer: 'Jane Smith', 
      amount: 450, 
      status: 'Confirm', 
      items: []
    },
    { 
      id: 'TR-003', 
      date: '02-13-2026', 
      customer: 'Bob Wilson', 
      amount: 825, 
      status: 'Pending', 
      items: []
    },
  ]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const confirmPurchase = (customer: string) => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const newTransaction: Transaction = {
      id: `TR-${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      customer,
      items: [...cart],
      amount: total,
      status: 'Confirm',
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update inventory
    setProducts(prevProducts =>
      prevProducts.map(product => {
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      })
    );

    clearCart();
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product => (product.id === id ? { ...product, ...updates } : product))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: String(Date.now()),
    };
    setProducts(prev => [...prev, newProduct]);
  };

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
        updateProduct,
        deleteProduct,
        addProduct,
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