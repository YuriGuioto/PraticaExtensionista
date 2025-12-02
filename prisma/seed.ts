import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

import { menuCategories, menuItems } from '../src/data/sampleMenu.js';

const prisma = new PrismaClient();

async function seedCategories() {
  for (const category of menuCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        highlight: category.highlight,
        sortOrder: category.sortOrder,
      },
      create: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        highlight: category.highlight,
        sortOrder: category.sortOrder,
      },
    });
  }
}

async function seedMenuItems() {
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        ingredients: item.ingredients,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        baseSize: item.baseSize,
        tags: item.tags ?? [],
        categoryId: item.categoryId,
      },
      create: {
        id: item.id,
        sku: item.id,
        name: item.name,
        description: item.description,
        ingredients: item.ingredients,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        baseSize: item.baseSize,
        tags: item.tags ?? [],
        categoryId: item.categoryId,
        options: item.options
          ? {
              create: item.options.map((option) => ({
                label: option.label,
                values: option.values,
              })),
            }
          : undefined,
      },
    });
  }
}

async function main() {
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemOption.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();

  await seedCategories();
  await seedMenuItems();
  await seedAdminUser();
}

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@acaifamilia.com' },
    update: {
      name: 'Admin Açaí',
      passwordHash,
    },
    create: {
      name: 'Admin Açaí',
      email: 'admin@acaifamilia.com',
      passwordHash,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🌱 Base populada com o cardápio do açaí da família.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
