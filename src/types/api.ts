export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  highlight?: string;
  sortOrder: number;
}

export interface MenuItemOption {
  label: string;
  values: string[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  tags?: string[];
  baseSize?: string;
  options?: MenuItemOption[];
}

export type OrderStatus = 'received' | 'in_preparation' | 'ready' | 'delivered';

export interface OrderItemRequest {
  itemId: string;
  quantity: number;
  notes?: string;
  name?: string;
}

export interface OrderHistoryEntry {
  id: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  note?: string;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface OrderRecord {
  id: string;
  code: string;
  customerName: string;
  tableLabel?: string;
  contact?: string;
  status: OrderStatus;
  items: OrderItemRequest[];
  total: number;
  createdAt: string;
  updatedAt: string;
  history?: OrderHistoryEntry[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
