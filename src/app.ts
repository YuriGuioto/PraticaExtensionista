import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { swaggerDocument } from './docs/swagger.js';
import { apiRouter } from './routes/index.js';
import { notFound } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';

export const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    skip: () => env.nodeEnv === 'test',
  }),
);

app.get('/', (_req, res) => {
  return res.json({
    name: 'Açaí da Família API',
    version: '0.1.0',
    docs: '/docs',
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', apiRouter);
app.use('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);
