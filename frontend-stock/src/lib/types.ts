export type Language = "th" | "en";

export interface Item {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export interface CheckoutResult {
  orderId: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export interface CreateItemPayload {
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface UpdateItemPayload extends CreateItemPayload {}

export interface AdjustStockPayload {
  delta: number;
  reason: string;
}

export interface AdminUser {
  userId: string;
  email: string;
  displayName?: string | null;
  isActive: boolean;
  role: string;
  createdAt: string;
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  displayName?: string;
  emailConfirmed?: boolean;
}

export interface UpdateAdminUserPayload {
  displayName?: string;
  isActive?: boolean;
}

export interface AdminOrderSummary {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  lineCount: number;
}

export interface AdminOrderLine {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrderDetail {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderLine[];
}
