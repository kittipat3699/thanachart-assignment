"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useLocale } from "@/contexts/locale-context";
import { requireAdminAccessToken } from "@/lib/admin-auth";
import { getAdminOrder, getAdminOrders } from "@/lib/api";
import { t } from "@/lib/i18n";
import type { AdminOrderDetail, AdminOrderSummary } from "@/lib/types";
import { formatThb } from "@/lib/utils";

function shortOrderId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

export default function AdminOrdersPage(): React.JSX.Element {
  const { language } = useLocale();
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await requireAdminAccessToken();
      const result = await getAdminOrders(token);
      setOrders(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const openDetail = async (orderId: string): Promise<void> => {
    setDetailOrderId(orderId);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const token = await requireAdminAccessToken();
      const result = await getAdminOrder(token, orderId);
      setDetail(result);
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Failed to load order",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = (): void => {
    setDetailOrderId(null);
    setDetail(null);
    setDetailError(null);
  };

  const orderCountLabel = useMemo(
    () =>
      `${orders.length} ${t(language, "ordersCountSuffix")}`,
    [language, orders.length],
  );

  const formatDate = (dateValue: string): string => {
    return new Date(dateValue).toLocaleString(
      language === "th" ? "th-TH" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );
  };

  const statusBadgeClass = (status: string): string => {
    const normalized = status.toLowerCase();
    if (normalized === "confirmed") {
      return "border-emerald-300/65 bg-emerald-50/85 text-emerald-800";
    }
    if (normalized === "pending") {
      return "border-amber-300/65 bg-amber-50/85 text-amber-900";
    }
    return "";
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="liquid-title text-3xl font-semibold">
            {t(language, "adminOrders")}
          </h2>
          <p className="text-sm text-muted-foreground">{orderCountLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadOrders()}>
            {t(language, "refresh")}
          </Button>
        </div>
      </header>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <p>{t(language, "ordersLoading")}</p>
      ) : null}

      <Card className="rounded-[28px] p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-white/60 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3">{t(language, "orderShortId")}</th>
                <th className="px-4 py-3">{t(language, "customerName")}</th>
                <th className="px-4 py-3">{t(language, "customerEmail")}</th>
                <th className="px-4 py-3">{t(language, "total")}</th>
                <th className="px-4 py-3">{t(language, "orderLinesCol")}</th>
                <th className="px-4 py-3">{t(language, "orderStatus")}</th>
                <th className="px-4 py-3">{t(language, "orderPlaced")}</th>
                <th className="px-4 py-3 w-[120px]" />
              </tr>
            </thead>
            <tbody>
              {!loading && orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-muted-foreground" colSpan={8}>
                    {t(language, "ordersEmpty")}
                  </td>
                </tr>
              ) : null}

              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/45 align-top"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {shortOrderId(order.id)}
                  </td>
                  <td className="px-4 py-3 font-medium">{order.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.customerEmail}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatThb(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{order.lineCount}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusBadgeClass(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void openDetail(order.id)}
                      className="gap-1.5"
                    >
                      <Eye className="h-4 w-4" />
                      {t(language, "orderView")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(detailOrderId)}
        onClose={closeDetail}
        title={t(language, "orderDetail")}
        footer={
          <Button variant="outline" onClick={closeDetail}>
            {t(language, "close")}
          </Button>
        }
      >
        {detailLoading ? (
          <p className="text-sm text-muted-foreground">
            {t(language, "ordersLoading")}
          </p>
        ) : null}

        {detailError ? (
          <p className="text-sm text-destructive">{detailError}</p>
        ) : null}

        {detail && !detailLoading ? (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-2xl border border-white/55 bg-white/35 p-4 text-sm backdrop-blur-md sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  ID
                </p>
                <p className="mt-0.5 font-mono text-xs break-all">{detail.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1">
                  <Badge className={statusBadgeClass(detail.status)}>
                    {detail.status}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t(language, "customerName")}
                </p>
                <p className="mt-0.5 font-medium">{detail.customerName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t(language, "customerEmail")}
                </p>
                <p className="mt-0.5">{detail.customerEmail}</p>
              </div>
              {detail.customerPhone ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t(language, "orderPhone")}
                  </p>
                  <p className="mt-0.5">{detail.customerPhone}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t(language, "total")}
                </p>
                <p className="mt-0.5 text-lg font-semibold">
                  {formatThb(detail.totalAmount)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t(language, "orderPlaced")}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {formatDate(detail.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">
                {t(language, "orderLines")}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-white/55">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-white/50 bg-white/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">
                        {t(language, "orderItemColumn")}
                      </th>
                      <th className="px-3 py-2">{t(language, "qty")}</th>
                      <th className="px-3 py-2">
                        {t(language, "orderUnitPrice")}
                      </th>
                      <th className="px-3 py-2">{t(language, "total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((line, index) => (
                      <tr
                        key={`${line.itemId}-${index}`}
                        className="border-b border-white/40 last:border-0"
                      >
                        <td className="px-3 py-2 font-medium">{line.name}</td>
                        <td className="px-3 py-2 tabular-nums">{line.quantity}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatThb(line.unitPrice)}
                        </td>
                        <td className="px-3 py-2 tabular-nums font-medium">
                          {formatThb(line.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
