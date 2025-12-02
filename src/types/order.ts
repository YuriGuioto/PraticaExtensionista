export type OrderStatus = 'received' | 'in_preparation' | 'ready' | 'delivered';

export interface OrderItemRequest {
  itemId: string;
  quantity: number;
  notes?: string;
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
  createdAt: Date;
  updatedAt: Date;
}
