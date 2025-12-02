import type {
  AdminUser,
  Category,
  MenuItem,
  MenuItemOption,
  Order,
  OrderItem,
  OrderStatusHistory,
} from '@prisma/client';

export type MenuItemWithOptions = MenuItem & { options: MenuItemOption[] };

export const serializeCategory = (category: Category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  description: category.description ?? undefined,
  highlight: category.highlight ?? undefined,
  sortOrder: category.sortOrder,
});

export const serializeMenuItem = (item: MenuItemWithOptions) => ({
  id: item.id,
  categoryId: item.categoryId,
  name: item.name,
  description: item.description,
  ingredients: item.ingredients,
  price: Number(item.price),
  imageUrl: item.imageUrl ?? '',
  isAvailable: item.isAvailable,
  baseSize: item.baseSize ?? undefined,
  tags: item.tags ?? undefined,
  options: item.options.map((option) => ({
    label: option.label,
    values: option.values,
  })),
});

export type OrderWithRelations = Order & {
  items: (OrderItem & { menuItem: Pick<MenuItem, 'id' | 'name'> | null })[];
  history: (OrderStatusHistory & {
    adminUser: Pick<AdminUser, 'id' | 'name' | 'email'> | null;
  })[];
};

export const serializeOrder = (order: OrderWithRelations) => ({
  id: order.id,
  code: order.code,
  customerName: order.customerName,
  tableLabel: order.tableLabel ?? undefined,
  contact: order.contact ?? undefined,
  status: order.status,
  total: Number(order.total),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  items: order.items.map((item) => ({
    itemId: item.menuItemId,
    quantity: item.quantity,
    notes: item.notes ?? undefined,
    name: item.menuItem?.name,
  })),
  history: order.history
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((entry) => ({
      id: entry.id,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      note: entry.note ?? undefined,
      createdAt: entry.createdAt,
      admin: entry.adminUser
        ? {
            id: entry.adminUser.id,
            name: entry.adminUser.name,
            email: entry.adminUser.email,
          }
        : undefined,
    })),
});
