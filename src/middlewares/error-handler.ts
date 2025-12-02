import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  console.error('[API] Unhandled error:', err);
  return res.status(500).json({
    message: 'Algo inesperado aconteceu. Tente novamente mais tarde.',
  });
};
