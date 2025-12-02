import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { generateOrderCode } from '../utils/order-code.js';
import { serializeOrder } from '../utils/serializers.js';

const orderSchema = z.object({
  customerName: z.string().min(2, 'Informe o nome do cliente.'),
  tableLabel: z.string().optional(),
  contact: z.string().optional(),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
      }),
    )
    .min(1, 'Adicione ao menos um item ao pedido.'),
});

const statusSchema = z.object({
  status: z.enum(['received', 'in_preparation', 'ready', 'delivered']),
});

const orderIncludes = {
  items: {
    include: {
      menuItem: { select: { id: true, name: true } },
    },
  },
  history: {
    include: { adminUser: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  },
};

const allowedStatuses = ['received', 'in_preparation', 'ready', 'delivered'] as const;
type OrderStatusFilter = (typeof allowedStatuses)[number];
const statusSet = new Set<string>(allowedStatuses);

const normalizeStatusFilter = (value: unknown): OrderStatusFilter[] | undefined => {
  if (!value) {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const filtered = values.filter((status): status is OrderStatusFilter =>
    typeof status === 'string' && statusSet.has(status),
  );

  return filtered.length > 0 ? filtered : undefined;
};

export const listOrders = async (req: Request, res: Response): Promise<Response> => {
  const statusFilter = normalizeStatusFilter(req.query.status);

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: { in: statusFilter } } : undefined,
    include: orderIncludes,
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ data: orders.map(serializeOrder) });
};

export const getOrder = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderIncludes,
  });

  if (!order) {
    return res.status(404).json({ message: 'Pedido não encontrado.' });
  }

  return res.json({ data: serializeOrder(order) });
};

export const createOrder = async (req: Request, res: Response): Promise<Response> => {
  const parsed = orderSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Dados inválidos para criação de pedido.',
      issues: parsed.error.flatten(),
    });
  }

  const itemIds = parsed.data.items.map((item) => item.itemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } },
  });

  const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

  const unavailableItems = parsed.data.items.filter((item) => {
    const menuItem = menuItemMap.get(item.itemId);
    return !menuItem || !menuItem.isAvailable;
  });

  if (unavailableItems.length > 0) {
    return res.status(400).json({
      message: 'Um ou mais itens não estão disponíveis ou não existem no cardápio.',
      items: unavailableItems.map((item) => item.itemId),
    });
  }

  const total = parsed.data.items.reduce((acc, item) => {
    const menuItem = menuItemMap.get(item.itemId);
    if (!menuItem) {
      return acc;
    }
    return acc + Number(menuItem.price) * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      customerName: parsed.data.customerName,
      tableLabel: parsed.data.tableLabel,
      contact: parsed.data.contact,
      total: new Prisma.Decimal(total.toFixed(2)),
      items: {
        create: parsed.data.items.map((item) => ({
          menuItemId: item.itemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      },
      history: {
        create: {
          previousStatus: 'received',
          newStatus: 'received',
        },
      },
    },
    include: orderIncludes,
  });

  const formatted = serializeOrder(order);
  const io = req.app.get('io');
  io?.emit('orders:update', formatted);

  return res.status(201).json({ data: formatted });
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Status inválido.',
      issues: parsed.error.flatten(),
    });
  }

  const orderId = req.params.id;

  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!current) {
    return res.status(404).json({ message: 'Pedido não encontrado.' });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: parsed.data.status },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        previousStatus: current.status,
        newStatus: parsed.data.status,
        adminUserId: req.user?.id,
      },
    }),
  ]);

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderIncludes,
  });

  if (!updated) {
    return res.status(404).json({ message: 'Pedido não encontrado.' });
  }

  const formatted = serializeOrder(updated);

  const io = req.app.get('io');
  io?.emit('orders:update', formatted);

  return res.json({ data: formatted });
};
