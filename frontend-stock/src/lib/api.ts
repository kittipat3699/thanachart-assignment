import type {
  AdminOrderDetail,
  AdminOrderSummary,
  AdminUser,
  AdjustStockPayload,
  CheckoutPayload,
  CheckoutResult,
  CreateAdminUserPayload,
  CreateItemPayload,
  Item,
  UpdateAdminUserPayload,
  UpdateItemPayload
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string; detail?: string };
      message = payload.error ?? payload.detail ?? message;
    } catch {
      return undefined as T;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function authorizedFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });

  return parseResponse<T>(response);
}

export async function getPublicItems(): Promise<Item[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/items`, {
    method: "GET",
    cache: "no-store"
  });
  return parseResponse<Item[]>(response);
}

export async function checkoutOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<CheckoutResult>(response);
}

export function getAdminItems(token: string): Promise<Item[]> {
  return authorizedFetch<Item[]>("/api/v1/admin/items", token);
}

export function createAdminItem(token: string, payload: CreateItemPayload): Promise<Item> {
  return authorizedFetch<Item>("/api/v1/admin/items", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAdminItem(
  token: string,
  itemId: string,
  payload: UpdateItemPayload
): Promise<Item> {
  return authorizedFetch<Item>(`/api/v1/admin/items/${itemId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteAdminItem(token: string, itemId: string): Promise<void> {
  return authorizedFetch<void>(`/api/v1/admin/items/${itemId}`, token, {
    method: "DELETE"
  });
}

export function adjustAdminItemStock(
  token: string,
  itemId: string,
  payload: AdjustStockPayload
): Promise<Item> {
  return authorizedFetch<Item>(`/api/v1/admin/items/${itemId}/adjust-stock`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAdminUsers(token: string): Promise<AdminUser[]> {
  return authorizedFetch<AdminUser[]>("/api/v1/admin/users", token);
}

export function createAdminUser(
  token: string,
  payload: CreateAdminUserPayload
): Promise<AdminUser> {
  return authorizedFetch<AdminUser>("/api/v1/admin/users", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAdminUser(
  token: string,
  userId: string,
  payload: UpdateAdminUserPayload
): Promise<AdminUser> {
  return authorizedFetch<AdminUser>(`/api/v1/admin/users/${userId}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteAdminUser(token: string, userId: string): Promise<void> {
  return authorizedFetch<void>(`/api/v1/admin/users/${userId}`, token, {
    method: "DELETE"
  });
}

export function getAdminOrders(token: string): Promise<AdminOrderSummary[]> {
  return authorizedFetch<AdminOrderSummary[]>("/api/v1/admin/orders", token);
}

export function getAdminOrder(
  token: string,
  orderId: string
): Promise<AdminOrderDetail> {
  return authorizedFetch<AdminOrderDetail>(`/api/v1/admin/orders/${orderId}`, token);
}
