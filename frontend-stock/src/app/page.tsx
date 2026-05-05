"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { useLocale } from "@/contexts/locale-context";
import { hasAdminSession } from "@/lib/admin-auth";
import { getPublicItems } from "@/lib/api";
import { t } from "@/lib/i18n";
import type { Item } from "@/lib/types";
import { cn, formatThb } from "@/lib/utils";

export default function HomePage(): React.JSX.Element {
  const { language } = useLocale();
  const { addItem, itemCount, lines, totalPrice, updateQuantity } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const quantitiesByItemId = useMemo(() => {
    return new Map(lines.map((line) => [line.itemId, line.quantity]));
  }, [lines]);

  useEffect(() => {
    void (async () => {
      try {
        const result = await getPublicItems();
        setItems(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const isLoggedIn = await hasAdminSession();
        setIsAdminLoggedIn(isLoggedIn);
      } catch {
        setIsAdminLoggedIn(false);
      }
    })();
  }, []);

  return (
    <main className="page-enter mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
      <header className="liquid-shell mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl px-4 py-3 md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {t(language, "brand")}
          </p>
        </div>
        <div className="flex items-center gap-2 max-sm:flex-wrap max-sm:justify-center">
          <LanguageToggle />
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={isAdminLoggedIn ? "/admin/items" : "/admin/login"}
          >
            {isAdminLoggedIn ? t(language, "dashboard") : t(language, "login")}
          </Link>
          <Link
            className={buttonVariants({
              className: "inline-flex items-center gap-2",
            })}
            href="/checkout"
          >
            <ShoppingCart className="h-4 w-4" />
            {t(language, "cart")}
            <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-white/75 bg-white/95 px-1.5 text-xs font-semibold text-slate-900 shadow-[0_10px_20px_-14px_rgba(15,23,42,0.95)]">
              {itemCount}
            </span>
          </Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] p-6 md:p-8">
          <h2 className="liquid-title text-4xl font-semibold leading-tight md:text-6xl">
            Shopping Cart
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link className={buttonVariants({ size: "lg" })} href="/checkout">
              {t(language, "checkout")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[28px]">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {t(language, "cart")}
            </p>
            <p className="mt-2 text-3xl font-semibold">{itemCount}</p>
            <p className="text-sm text-muted-foreground">
              {t(language, "itemsInCart")}
            </p>
          </Card>
          <Card className="rounded-[28px]">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {t(language, "total")}
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {formatThb(totalPrice)}
            </p>
          </Card>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          console.log("🚀 ~ HomePage ~ item:", item);
          const soldOut = item.stock <= 0;
          const inCartQty = quantitiesByItemId.get(item.id) ?? 0;
          const increaseQty = (): void => {
            if (soldOut || inCartQty >= item.stock) {
              return;
            }

            if (inCartQty === 0) {
              addItem(item);
              return;
            }

            updateQuantity(item.id, inCartQty + 1);
          };

          const decreaseQty = (): void => {
            if (inCartQty === 0) {
              return;
            }

            updateQuantity(item.id, inCartQty - 1);
          };

          return (
            <Card
              key={item.id}
              className="group overflow-hidden rounded-[28px] p-0"
            >
              <div className="relative h-52 overflow-hidden border-b border-white/55 bg-gradient-to-br from-slate-100 via-blue-100 to-cyan-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/35 to-transparent" />
                {inCartQty > 0 && (
                  <Badge className="absolute right-3 top-3 border-slate-400/35 bg-white  text-slate-900 shadow-[0_12px_26px_-16px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                    {t(language, "inCart")} {inCartQty}
                  </Badge>
                )}
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-tight">
                    {item.name}
                  </h3>
                  <Badge>{item.sku}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.description || "-"}
                </p>

                <div className="flex items-end justify-between gap-3 pt-1">
                  <div>
                    <p className="text-xl font-bold">{formatThb(item.price)}</p>
                    <p className={cn("text-xs text-muted-foreground")}>
                      {t(language, "inStock")} {item.stock}
                    </p>
                  </div>
                  {soldOut ? (
                    <p
                      className={cn(
                        "text-xs text-muted-foreground",
                        soldOut
                          ? "text-white bg-red-500 rounded-full px-2 py-1"
                          : "",
                      )}
                    >
                      {soldOut
                        ? t(language, "outOfStock")
                        : `${t(language, "inStock")} ${item.stock}`}
                    </p>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/70 bg-white/50 p-1.5 backdrop-blur-lg">
                      <Button
                        className="h-8 w-8 p-0"
                        variant="outline"
                        size="sm"
                        disabled={inCartQty === 0}
                        onClick={decreaseQty}
                      >
                        -
                      </Button>
                      <Badge
                        className={cn(
                          "w-12 justify-center text-lg",
                          soldOut ? "opacity-70" : "",
                        )}
                      >
                        {inCartQty}
                      </Badge>
                      <Button
                        className="h-8 w-8 p-0"
                        variant="outline"
                        size="sm"
                        disabled={soldOut || inCartQty >= item.stock}
                        onClick={increaseQty}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
