# Açaí da Família – Cardápio Digital Distribuído

Aplicação web distribuída para o cardápio digital do açaí do seu João. O objetivo é permitir que clientes consultem o menu, montem pedidos e enviem ao restaurante, enquanto a equipe administrativa mantém o cardápio e monitora pedidos em tempo real.

## Arquitetura Geral

- **Frontend (Cliente + ADM)**: React + Vite, SPA com React Router e Zustand/Context para estado do carrinho e painel administrativo. Comunicação com a API via HTTP e WebSocket/SSE para atualização de pedidos.
- **Backend (API REST)**: Node.js + Express, validação com Zod, documentação Swagger/OpenAPI (via `swagger-ui-express`).
- **Banco de Dados**: PostgreSQL gerenciado pelo Prisma ORM (migrações e seeds para categorias, itens e pedidos do cardápio de açaí).
- **Mensageria em Tempo Real**: Socket.IO ou Server-Sent Events (avaliado na implementação) para atualizações imediatas de pedidos no painel ADM.
- **Infra**: Docker Compose para subir API + banco. Frontend em Vite dev server ou container dedicado.

## Módulos

### Cliente
- Visualização do cardápio por categoria (Bebidas, Combos de Açaí, Toppings, Sobremesas).
- Detalhes do item com descrição, ingredientes, tamanhos e adicionais.
- Carrinho persistente durante a navegação, ajuste de quantidades e observações.
- Envio do pedido com identificação (nome, mesa/retirada) e confirmação do número do pedido.

### Administrativo
- Autenticação com e-mail/senha e JWT para proteger operações.
- CRUD de categorias e itens (nome, descrição, preço, imagem, disponibilidade, destaques promocionais).
- Dashboard de pedidos em tempo real (status: recebido, em preparo, pronto, entregue) com possibilidade de atualizar cada pedido.

## Estrutura Planejada do Repositório

```
/README.md
/frontend/        # SPA em React (Vite)
/backend/         # API Node.js + Express + Prisma
/docker/          # Arquivos auxiliares (ex.: nginx, seeds)
/.vscode/         # Configurações de workspace (opcional)
```

## Como rodar o projeto

### Backend (API + Prisma)
1. `cd backend`
2. `cp .env.example .env` e ajuste `DATABASE_URL`, `JWT_SECRET` e `PORT` conforme necessário.
3. Instale as dependências: `npm install`
4. Gere o client Prisma e rode migrações: `npm run prisma:generate && npm run prisma:migrate`
5. Popule a base com o cardápio do seu João: `npm run prisma:seed`
6. Suba a API em modo desenvolvimento: `npm run dev`
7. Acesse `http://localhost:4000/docs` para visualizar o Swagger.
	- Usuário administrador padrão gerado pelo seed: `admin@acaifamilia.com` / `admin123`

#### Conectando ao Supabase
- Copie a string `DATABASE_URL` do Supabase (ex.: `postgresql://postgres:vera050480osmar@db.gltrwlykkphoqzxzahsn.supabase.co:5432/postgres`) e cole no `.env` do backend.
- Caso prefira provisionar via SQL direto no painel, execute `backend/prisma/supabase-init.sql` no editor SQL do Supabase. O arquivo cria enums, tabelas e dados iniciais equivalentes ao seed Prisma.
- Depois disso, rode `npx prisma generate` e (se desejar manter migrações) `npx prisma migrate deploy` para garantir que o schema esteja sincronizado.
- Lembre-se de atualizar a senha no painel (“Reset database password”) se girar as credenciais – basta editar `DATABASE_URL` novamente.

### Frontend (SPA React)
1. `cd frontend`
2. `cp .env.example .env` e defina `VITE_API_URL`, `VITE_SOCKET_URL` e `VITE_ADMIN_PIN` (PIN deve casar com o backend).
3. Instale as dependências: `npm install`
4. Suba o app: `npm run dev`
5. Acesse `http://localhost:5173` para o Cardápio Digital.

### Fluxo sugerido
- Cliente consome as rotas `GET /api/menu/*` para construir o cardápio e envia pedidos em `POST /api/orders`.
- Painel ADM consome `GET /api/orders` e atualiza status via `PATCH /api/orders/:id/status` utilizando o token JWT do login `/api/auth/login`.
- Eventos `orders:update` via Socket.IO notificam o frontend sempre que um pedido é criado/atualizado.

## Próximos Passos

1. Adicionar autenticação mais robusta para o módulo ADM (JWT ou Auth simplificado).
2. Criar CRUD completo para categorias e itens via painel ADM.
3. Integrar storage de imagens (S3, Supabase ou Cloudinary) para fotos de produtos.
4. Publicar Docker Compose e pipelines de deploy.
