import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'Senha precisa ter ao menos 6 caracteres.'),
});

const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: '8h',
  });

export const login = async (req: Request, res: Response): Promise<Response> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Credenciais inválidas.', issues: parsed.error.flatten() });
  }

  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  }

  const passwordMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  }

  const token = signToken(user.id);

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const getProfile = (req: Request, res: Response): Response => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  return res.json({ data: req.user });
};
