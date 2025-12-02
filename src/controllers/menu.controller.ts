import { Request, Response } from 'express';

import { prisma } from '../lib/prisma.js';
import { serializeCategory, serializeMenuItem } from '../utils/serializers.js';

export const getCategories = async (_req: Request, res: Response): Promise<Response> => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return res.json({ data: categories.map(serializeCategory) });
};

export const getItems = async (req: Request, res: Response): Promise<Response> => {
  const { category } = req.query;

  const where =
    typeof category === 'string' && category.length > 0
      ? {
          OR: [
            { categoryId: category },
            { categoryId: `cat-${category}` },
            { category: { slug: category } },
          ],
        }
      : undefined;

  const items = await prisma.menuItem.findMany({
    where,
    include: { options: true },
    orderBy: { name: 'asc' },
  });

  return res.json({ data: items.map(serializeMenuItem) });
};

export const getItemById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { options: true },
  });

  if (!item) {
    return res.status(404).json({ message: 'Item não encontrado.' });
  }

  return res.json({ data: serializeMenuItem(item) });
};
