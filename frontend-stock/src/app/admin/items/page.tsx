"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/contexts/locale-context";
import { requireAdminAccessToken } from "@/lib/admin-auth";
import {
  adjustAdminItemStock,
  deleteAdminItem,
  getAdminItems,
  updateAdminItem,
} from "@/lib/api";
import { t } from "@/lib/i18n";
import type { Item } from "@/lib/types";
import { formatThb } from "@/lib/utils";

interface ItemDraft {
  name: string;
  sku: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  isActive: boolean;
}

const emptyDraft: ItemDraft = {
  name: "",
  sku: "",
  description: "",
  price: "",
  stock: "0",
  imageUrl: "",
  isActive: true,
};

function mapItemToDraft(item: Item): ItemDraft {
  return {
    name: item.name,
    sku: item.sku,
    description: item.description,
    price: item.price.toString(),
    stock: item.stock.toString(),
    imageUrl: item.imageUrl ?? "",
    isActive: item.isActive,
  };
}

export default function AdminItemsPage(): React.JSX.Element {
  const { language } = useLocale();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft>(emptyDraft);

  const [stockItem, setStockItem] = useState<Item | null>(null);
  const [stockTarget, setStockTarget] = useState("");
  const [stockReason, setStockReason] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await requireAdminAccessToken();
      const result = await getAdminItems(token);
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const saveEditItem = async (): Promise<void> => {
    if (!editingItem) {
      return;
    }

    setError(null);
    try {
      const token = await requireAdminAccessToken();
      await updateAdminItem(token, editingItem.id, {
        name: editDraft.name,
        sku: editDraft.sku,
        description: editDraft.description,
        price: Number(editDraft.price),
        stock: Number(editDraft.stock),
        imageUrl: editDraft.imageUrl || undefined,
        isActive: editDraft.isActive,
      });

      setEditingItem(null);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update item failed");
    }
  };

  const openStockModal = (item: Item): void => {
    setStockItem(item);
    setStockTarget(item.stock.toString());
    setStockReason("");
  };

  const confirmAdjustStock = async (): Promise<void> => {
    if (!stockItem) {
      return;
    }

    const trimmed = stockTarget.trim();
    if (trimmed === "") {
      setError(t(language, "stockInvalidNumber"));
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      setError(t(language, "stockInvalidNumber"));
      return;
    }
    if (parsed < 0) {
      setError(t(language, "stockNegativeNotAllowed"));
      return;
    }

    const delta = parsed - stockItem.stock;
    if (delta === 0) {
      setStockItem(null);
      return;
    }

    setError(null);
    try {
      const token = await requireAdminAccessToken();
      await adjustAdminItemStock(token, stockItem.id, {
        delta,
        reason: stockReason || "Manual adjustment",
      });

      setStockItem(null);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjust stock failed");
    }
  };

  const deleteItemHandler = async (id: string): Promise<void> => {
    setError(null);
    try {
      const token = await requireAdminAccessToken();
      await deleteAdminItem(token, id);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete item failed");
    }
  };

  const itemCountLabel = useMemo(() => `${items.length} items`, [items.length]);

  const formatDate = (dateValue: string): string => {
    return new Date(dateValue).toLocaleString(
      language === "th" ? "th-TH" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="liquid-title text-3xl font-semibold">
            {t(language, "adminItems")}
          </h2>
          <p className="text-sm text-muted-foreground">{itemCountLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadItems()}>
            Refresh
          </Button>
          {/* <Button onClick={() => setIsCreateOpen(true)}>Add Item</Button> */}
        </div>
      </header>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p>Loading items...</p> : null}

      <Card className="rounded-[28px] p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-white/60 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    No items found.
                  </td>
                </tr>
              ) : null}

              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/45 align-top"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/60 bg-white/40">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.sku}
                        </p>
                        <p className="mt-1 line-clamp-1 max-w-[360px] text-xs text-muted-foreground">
                          {item.description || "-"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatThb(item.price)}
                  </td>
                  <td className="px-4 py-3">{item.stock}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        item.isActive
                          ? ""
                          : "border-red-300/65 bg-red-50/80 text-red-700"
                      }
                    >
                      {item.isActive
                        ? t(language, "active")
                        : t(language, "inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStockModal(item)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Stock
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Item"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={() => void saveEditItem()}>
              {t(language, "save")}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Name"
            value={editDraft.name}
            onChange={(e) =>
              setEditDraft((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            placeholder="SKU"
            value={editDraft.sku}
            onChange={(e) =>
              setEditDraft((prev) => ({ ...prev, sku: e.target.value }))
            }
          />
          <Input
            placeholder="Price"
            type="number"
            value={editDraft.price}
            onChange={(e) =>
              setEditDraft((prev) => ({ ...prev, price: e.target.value }))
            }
          />
          <Input
            placeholder="Stock"
            type="number"
            value={editDraft.stock}
            onChange={(e) =>
              setEditDraft((prev) => ({ ...prev, stock: e.target.value }))
            }
          />
          <Input
            placeholder="Image URL"
            value={editDraft.imageUrl}
            onChange={(e) =>
              setEditDraft((prev) => ({ ...prev, imageUrl: e.target.value }))
            }
            className="md:col-span-2"
          />
          <Textarea
            placeholder="Description"
            value={editDraft.description}
            onChange={(e) =>
              setEditDraft((prev) => ({ ...prev, description: e.target.value }))
            }
            className="md:col-span-2"
          />
          <div className="inline-flex items-center gap-2 text-sm">
            <Switch
              checked={editDraft.isActive}
              onCheckedChange={(checked) =>
                setEditDraft((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <span>{t(language, "active")}</span>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(stockItem)}
        onClose={() => setStockItem(null)}
        title="Adjust Stock"
        footer={
          <>
            <Button variant="outline" onClick={() => setStockItem(null)}>
              Cancel
            </Button>
            <Button onClick={() => void confirmAdjustStock()}>
              {t(language, "stockAdjust")}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {stockItem
              ? `${stockItem.name} (Current stock: ${stockItem.stock})`
              : ""}
          </p>
          <label className="block text-sm font-medium text-foreground">
            {t(language, "stockTargetLabel")}
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={stockTarget}
            onChange={(e) => setStockTarget(e.target.value)}
          />
        </div>
      </Modal>
    </section>
  );
}
