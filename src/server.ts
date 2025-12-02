import http from 'node:http';

import { Server as SocketIOServer } from 'socket.io';

import { app } from './app.js';
import { env } from './config/env.js';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

io.on('connection', (socket) => {
  console.log(`[ws] Cliente conectado: ${socket.id}`);
});

app.set('io', io);

server.listen(env.port, () => {
  console.log(`🚀 API do Amazone Açaí - Mococa rodando na porta ${env.port}`);
});
