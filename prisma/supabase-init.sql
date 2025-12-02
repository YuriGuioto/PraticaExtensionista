
CREATE TYPE "OrderStatus" AS ENUM ('received', 'in_preparation', 'ready', 'delivered');
-- Deprecated enum kept for backwards compatibility; remove if you reset the schema entirely.
CREATE TYPE "OrderItemSize" AS ENUM ('pp', 'p', 'm', 'g', 'gg');

-- Tables
CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "highlight" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "MenuItem" (
  "id" TEXT PRIMARY KEY,
  "sku" TEXT UNIQUE,
  "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "ingredients" TEXT[] NOT NULL,
  "price" DECIMAL(8,2) NOT NULL,
  "imageUrl" TEXT,
  "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
  "baseSize" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "MenuItemOption" (
  "id" TEXT PRIMARY KEY,
  "itemId" TEXT NOT NULL REFERENCES "MenuItem"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL,
  "values" TEXT[] NOT NULL
);

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "customerName" TEXT NOT NULL,
  "tableLabel" TEXT,
  "contact" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'received',
  "total" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "menuItemId" TEXT NOT NULL REFERENCES "MenuItem"("id"),
  "quantity" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "AdminUser" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrderStatusHistory" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "previousStatus" "OrderStatus" NOT NULL,
  "newStatus" "OrderStatus" NOT NULL,
  "note" TEXT,
  "adminUserId" TEXT REFERENCES "AdminUser"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX "MenuItem_category_idx" ON "MenuItem" ("categoryId");
CREATE INDEX "Order_status_idx" ON "Order" ("status");
CREATE INDEX "OrderStatusHistory_order_idx" ON "OrderStatusHistory" ("orderId");
CREATE INDEX "OrderStatusHistory_admin_idx" ON "OrderStatusHistory" ("adminUserId");

-- Seed data
INSERT INTO "Category" ("id","slug","name","description","highlight","sortOrder") VALUES
  ('cat-classicos','classicos','Clássicos','Combinações campeãs de açaí','Melhores vendedores',1),
  ('cat-combos','combos','Combos Família','Açaí + acompanhamentos','Perfeito para compartilhar',2),
  ('cat-bebidas','bebidas','Bebidas','Opções refrescantes','Para acompanhar',3);

INSERT INTO "MenuItem" ("id","categoryId","name","description","ingredients","price","imageUrl","isAvailable","tags")
VALUES
  ('item-super-energia','cat-classicos','Super Energia','Açaí com banana, granola e mel',ARRAY['Açaí','Banana','Granola','Mel'],18.90,'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17',TRUE,ARRAY['popular','energia']),
  ('item-intenso-cupuacu','cat-classicos','Intenso Cupuaçu','Blend de açaí com cupuaçu e rapadura',ARRAY['Açaí','Cupuaçu','Rapadura'],21.50,'https://images.unsplash.com/photo-1430163393927-3dab9af7ea38',TRUE,ARRAY['regional']),
  ('item-combo-do-joao','cat-combos','Combo do Seu João','1 açaí 500ml + 2 toppings + 1 bebida',ARRAY['Açaí 500ml','2 toppings','1 bebida'],32.00,'https://images.unsplash.com/photo-1464306208223-e0b4495a5553',TRUE,ARRAY['combo','promo']);

INSERT INTO "MenuItemOption" ("id","menuItemId","label","values") VALUES
  ('opt-super-energia-toppings','item-super-energia','Toppings Extras',ARRAY['Paçoca','Leite ninho','Ovomaltine']),
  ('opt-combo-bebidas','item-combo-do-joao','Bebida',ARRAY['Suco de laranja','Refrigerante','Água de coco']);

-- bcrypt hash for senha admin123
INSERT INTO "AdminUser" ("id","name","email","passwordHash")
VALUES ('admin-seu-joao','Seu João','admin@acaifamilia.com','$2b$10$7TxBRvPobGaXtH37E8h1lupfCq7ZlQwBhlJ5VTzJZ9iYQ7V9D2aJ2');

INSERT INTO "Order" ("id","code","customerName","tableLabel","contact","status","total") VALUES
  ('ord-001','#A001','Maria Souza','Mesa 3','(11) 99999-1111','in_preparation',42.40),
  ('ord-002','#A002','Carlos Lima',NULL,'(11) 98888-2222','received',18.90);

INSERT INTO "OrderItem" ("id","orderId","itemId","quantity","notes","chosenOptions","unitPrice") VALUES
  ('orditem-001','ord-001','item-combo-do-joao',1,'Sem gelo',jsonb_build_object('Bebida','Suco de laranja'),32.00),
  ('orditem-002','ord-001','item-super-energia',1,'Trocar mel por leite condensado',jsonb_build_object('Toppings Extras','Paçoca'),18.90),
  ('orditem-003','ord-002','item-super-energia',1,NULL,jsonb_build_object('Toppings Extras','Leite ninho'),18.90);

INSERT INTO "OrderStatusHistory" ("id","orderId","previousStatus","newStatus","note","adminId")
VALUES ('hist-001','ord-001','received','in_preparation','Iniciado preparo','admin-seu-joao');
