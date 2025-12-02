export const swaggerDocument = {
  openapi: '3.0.1',
  info: {
    title: 'Açaí da Família API',
    version: '0.1.0',
    description:
      'API REST para o cardápio digital do açaí do seu João. Permite consultar menu, registrar pedidos e acompanhar operações administrativas.',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Ambiente local',
    },
  ],
  tags: [
    { name: 'Menu', description: 'Consulta de categorias e itens do cardápio' },
    { name: 'Pedidos', description: 'Criação e acompanhamento de pedidos' },
    { name: 'Admin', description: 'Operações administrativas (status do pedido, saúde da API)' },
    { name: 'Auth', description: 'Autenticação do painel administrativo' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Efetua login e retorna um token JWT',
        responses: {
          '200': { description: 'Login bem-sucedido' },
          '400': { description: 'Payload inválido' },
          '401': { description: 'Credenciais inválidas' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Retorna o usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Perfil retornado' },
          '401': { description: 'Token ausente ou inválido' },
        },
      },
    },
    '/api/menu/categories': {
      get: {
        tags: ['Menu'],
        summary: 'Lista todas as categorias do cardápio',
        responses: {
          '200': {
            description: 'Coleção de categorias',
          },
        },
      },
    },
    '/api/menu/items': {
      get: {
        tags: ['Menu'],
        summary: 'Lista todos os itens do cardápio',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtra itens por categoria (slug)',
          },
        ],
        responses: {
          '200': { description: 'Coleção de itens' },
        },
      },
    },
    '/api/admin/menu/items': {
      post: {
        tags: ['Admin'],
        summary: 'Cadastra um novo item de cardápio',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Item criado' },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Token inválido' },
        },
      },
    },
    '/api/admin/menu/items/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Atualiza um item existente',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Item atualizado' },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Token inválido' },
          '404': { description: 'Item não encontrado' },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Remove um item do cardápio',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '204': { description: 'Item removido' },
          '401': { description: 'Token inválido' },
          '404': { description: 'Item não encontrado' },
          '409': { description: 'Item vinculado a pedidos' },
        },
      },
    },
    '/api/menu/items/{id}': {
      get: {
        tags: ['Menu'],
        summary: 'Detalhes de um item específico',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Item encontrado' },
          '404': { description: 'Item não localizado' },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Pedidos'],
        summary: 'Lista pedidos ativos (uso ADM)',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              oneOf: [
                { type: 'string', enum: ['received', 'in_preparation', 'ready', 'delivered'] },
                {
                  type: 'array',
                  items: { type: 'string', enum: ['received', 'in_preparation', 'ready', 'delivered'] },
                },
              ],
            },
            description: 'Filtra pedidos por status (pode repetir o parâmetro)',
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de pedidos' },
          '401': { description: 'Token inválido' },
        },
      },
      post: {
        tags: ['Pedidos'],
        summary: 'Cria um novo pedido',
        responses: {
          '201': { description: 'Pedido criado' },
          '400': { description: 'Payload inválido' },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Pedidos'],
        summary: 'Obtém um pedido específico',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Pedido encontrado' },
          '401': { description: 'Token inválido' },
          '404': { description: 'Pedido não localizado' },
        },
      },
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Admin'],
        summary: 'Atualiza o status de um pedido',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Status atualizado' },
          '400': { description: 'Payload inválido' },
          '401': { description: 'Token inválido' },
          '404': { description: 'Pedido não localizado' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Admin'],
        summary: 'Status básico da API',
        responses: {
          '200': { description: 'Aplicação saudável' },
        },
      },
    },
  },
};
