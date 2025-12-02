import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

interface TokenPayload extends JwtPayload {
  sub: string;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ message: 'Autenticação requerida.' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    if (!decoded?.sub) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.warn('[auth] Token inválido', error);
    return res.status(401).json({ message: 'Sessão expirada ou inválida.' });
  }
};
