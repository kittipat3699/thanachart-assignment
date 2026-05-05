"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine, Item } from "@/lib/types";

const CART_STORAGE_KEY = "shopping-cart";

interface CartContextValue {
  lines: CartLine[];
  isReady: boolean;
  addItem: (item: Item) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartLine[];
        setLines(parsed);
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      }
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }, [isReady, lines]);

  const addItem = (item: Item): void => {
    if (item.stock <= 0 || !item.isActive) {
      return;
    }

    setLines((previous) => {
      const exists = previous.find((line) => line.itemId === item.id);
      if (!exists) {
        return [
          ...previous,
          {
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            imageUrl: item.imageUrl,
          },
        ];
      }

      return previous.map((line) =>
        line.itemId === item.id
          ? { ...line, quantity: Math.min(line.quantity + 1, item.stock) }
          : line,
      );
    });
  };

  const updateQuantity = (itemId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setLines((previous) =>
      previous.map((line) =>
        line.itemId === itemId
          ? {
              ...line,
              quantity,
            }
          : line,
      ),
    );
  };

  const removeItem = (itemId: string): void => {
    setLines((previous) => previous.filter((line) => line.itemId !== itemId));
  };

  const clear = (): void => {
    setLines([]);
  };

  const value = useMemo(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalPrice = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );

    return {
      lines,
      isReady,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      itemCount,
      totalPrice,
    };
  }, [isReady, lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
