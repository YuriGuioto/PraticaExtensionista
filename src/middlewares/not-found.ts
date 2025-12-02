import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response): Response => {
  return res.status(404).json({
    message: `Rota ${req.originalUrl} não encontrada no serviço de cardápio digital.`,
  });
};
