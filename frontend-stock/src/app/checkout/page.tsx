"use client";

import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import { useLocale } from "@/contexts/locale-context";
import { checkoutOrder } from "@/lib/api";
import { t } from "@/lib/i18n";
import type { CheckoutResult } from "@/lib/types";
import { formatThb } from "@/lib/utils";

export default function CheckoutPage(): React.JSX.Element {
  const { language } = useLocale();
  const { lines, totalPrice, clear, updateQuantity, removeItem } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError(t(language, "emptyCart"));
      return;
    }

    setSubmitting(true);

    try {
      const response = await checkoutOrder({
        customerName,
        customerEmail,
        customerPhone,
        items: lines.map((line) => ({
          itemId: line.itemId,
          quantity: line.quantity,
        })),
      });

      setResult(response);
      clear();
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t(language, "orderError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-enter mx-auto grid max-w-7xl gap-4 px-5 py-6 lg:grid-cols-[1.16fr_0.84fr] lg:gap-6 lg:px-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="liquid-title text-4xl font-semibold">
            {t(language, "checkout")}
          </h1>
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t(language, "store")}
          </Link>
        </div>

        <Card className="space-y-3 rounded-[28px]">
          {lines.length > 0 ? (
            <div className="flex justify-end border-b border-white/55 pb-3">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => clear()}
              >
                {t(language, "clearAllItems")}
              </Button>
            </div>
          ) : null}

          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t(language, "emptyCart")}
            </p>
          ) : null}

          {lines.map((line) => (
            <div
              key={line.itemId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/55 pb-3"
            >
              <div>
                <p className="font-medium">{line.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatThb(line.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuantity(line.itemId, Math.max(1, line.quantity - 1))
                  }
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm">{line.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(line.itemId, line.quantity + 1)}
                >
                  +
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t(language, "delete")}
                  title={t(language, "delete")}
                  onClick={() => removeItem(line.itemId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>{t(language, "total")}</span>
            <span>{formatThb(totalPrice)}</span>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <Card className="rounded-[28px]">
          <form className="space-y-3" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {t(language, "customerName")}
              </span>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {t(language, "customerEmail")}
              </span>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {t(language, "customerPhone")}
              </span>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                maxLength={10}
                minLength={10}
                pattern="^[0-9]{10}$"
                title="Please enter a valid phone number"
              />
            </label>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || lines.length === 0}
            >
              {submitting ? "Processing..." : t(language, "placeOrder")}
            </Button>
          </form>
        </Card>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {result ? (
          <Card className="space-y-2 rounded-[28px] border-primary/30">
            <p className="text-lg font-semibold text-primary">
              {t(language, "orderSuccess")}
            </p>
            <p className="text-sm text-muted-foreground">
              Order ID: {result.orderId}
            </p>
            <p className="text-sm font-medium">
              {formatThb(result.totalAmount)}
            </p>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
