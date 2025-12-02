import { Request, Response } from 'express';

import { env } from '../config/env.js';

export const healthCheck = (_req: Request, res: Response): Response => {
  return res.json({
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
};
