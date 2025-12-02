import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { serializeMenuItem } from '../utils/serializers.js';

const optionSchema = z.object({
  label: z.string().min(1),
  values: z.array(z.string().min(1)).min(1),
});

const baseSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(4),
  ingredients: z.array(z.string().min(1)).min(1),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional().default(true),
  baseSize: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  categoryId: z.string().min(1),
  options: z.array(optionSchema).optional(),
});

const buildOptionPayload = (options?: z.infer<typeof optionSchema>[]):
  | {
      create: {
        label: string;
        values: string[];
      }[];
      deleteMany: Record<string, never>;
    }
  | undefined => {
  if (!options) {
    return undefined;
  }

  return {
    deleteMany: {},
    create: options.map((option) => ({
      label: option.label,
      values: option.values,
    })),
  };
};

const buildMenuItemData = (payload: z.infer<typeof baseSchema>) => ({
  name: payload.name,
  description: payload.description,
  ingredients: payload.ingredients,
  price: new Prisma.Decimal(payload.price.toFixed(2)),
  imageUrl: payload.imageUrl,
  isAvailable: payload.isAvailable ?? true,
  baseSize: payload.baseSize,
  tags: payload.tags ?? [],
  categoryId: payload.categoryId,
  options: payload.options
    ? {
        create: payload.options.map((option) => ({
          label: option.label,
          values: option.values,
        })),
      }
    : undefined,
});

export const createMenuItem = async (req: Request, res: Response): Promise<Response> => {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos para cadastro.', issues: parsed.error.flatten() });
  }

  const item = await prisma.menuItem.create({
    data: buildMenuItemData(parsed.data),
    include: { options: true },
  });

  const formatted = serializeMenuItem(item);
  req.app.get('io')?.emit('menu:update', { type: 'created', item: formatted });

  return res.status(201).json({ data: formatted });
};

export const updateMenuItem = async (req: Request, res: Response): Promise<Response> => {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos para atualização.', issues: parsed.error.flatten() });
  }

  try {
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: {
        ...buildMenuItemData(parsed.data),
        options: buildOptionPayload(parsed.data.options),
      },
      include: { options: true },
    });

    const formatted = serializeMenuItem(item);
    req.app.get('io')?.emit('menu:update', { type: 'updated', item: formatted });

    return res.json({ data: formatted });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }
    throw error;
  }
};

export const deleteMenuItem = async (req: Request, res: Response): Promise<Response> => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Item não encontrado.' });
      }
      if (error.code === 'P2003') {
        return res.status(409).json({ message: 'Item vinculado a pedidos não pode ser removido.' });
      }
    }
    throw error;
  }

  req.app.get('io')?.emit('menu:update', { type: 'deleted', itemId: req.params.id });
  return res.status(204).send();
};
