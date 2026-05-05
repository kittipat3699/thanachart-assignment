"use client";

import { CartProvider } from "@/contexts/cart-context";
import { LocaleProvider } from "@/contexts/locale-context";

export function AppProviders({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <LocaleProvider>
      <CartProvider>{children}</CartProvider>
    </LocaleProvider>
  );
}
