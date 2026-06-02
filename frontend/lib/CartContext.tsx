"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = {
  itemType: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type CartCtx = {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemType: string) => void;
  updateQty: (itemType: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "gandom_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        // Drop items from old format that are missing unitPrice
        setCart(parsed.filter((i) => typeof i.unitPrice === "number"));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemType === item.itemType);
      if (existing) {
        return prev.map((i) =>
          i.itemType === item.itemType ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((itemType: string) => {
    setCart((prev) => prev.filter((i) => i.itemType !== itemType));
  }, []);

  const updateQty = useCallback((itemType: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.itemType !== itemType));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.itemType === itemType ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <Ctx.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
