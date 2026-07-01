import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { MenuItem } from '../types/database';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cart';

export interface CartItemLocal {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextValue {
  items: CartItemLocal[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (item: MenuItem) => Promise<void>;
  removeItem: (menuItemId: string) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'ljk_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemLocal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from Supabase when logged in, else from localStorage
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      cartService.getCartItems().then(dbItems => {
        const mapped: CartItemLocal[] = dbItems
          .filter(i => i.menu_items)
          .map(i => ({
            id: i.id,
            menuItem: i.menu_items as MenuItem,
            quantity: i.quantity,
          }));
        setItems(mapped);
      }).catch(console.error).finally(() => setIsLoading(false));
    } else {
      try {
        const stored = localStorage.getItem(CART_KEY);
        setItems(stored ? JSON.parse(stored) : []);
      } catch {
        setItems([]);
      }
    }
  }, [user]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = useCallback(async (menuItem: MenuItem) => {
    const existing = items.find(i => i.menuItem.id === menuItem.id);
    const newQty = (existing?.quantity ?? 0) + 1;

    if (user) {
      await cartService.addToCart(user.id, menuItem.id, newQty);
      if (existing) {
        setItems(prev => prev.map(i =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: newQty } : i
        ));
      } else {
        setItems(prev => [...prev, { id: menuItem.id, menuItem, quantity: 1 }]);
      }
    } else {
      if (existing) {
        setItems(prev => prev.map(i =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: newQty } : i
        ));
      } else {
        setItems(prev => [...prev, { id: menuItem.id, menuItem, quantity: 1 }]);
      }
    }
  }, [items, user]);

  const updateQuantity = useCallback(async (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(menuItemId);
    }
    if (user) {
      await cartService.updateCartQuantity(user.id, menuItemId, quantity);
    }
    setItems(prev => prev.map(i =>
      i.menuItem.id === menuItemId ? { ...i, quantity } : i
    ));
  }, [user]); // eslint-disable-line

  const removeItem = useCallback(async (menuItemId: string) => {
    if (user) {
      await cartService.removeFromCart(user.id, menuItemId);
    }
    setItems(prev => prev.filter(i => i.menuItem.id !== menuItemId));
  }, [user]);

  const clearCart = useCallback(async () => {
    if (user) {
      await cartService.clearCart(user.id);
    }
    setItems([]);
    if (!user) localStorage.removeItem(CART_KEY);
  }, [user]);

  return (
    <CartContext.Provider value={{
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0),
      isLoading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
