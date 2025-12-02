import 'express';

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      name: string;
      email: string;
      role: string;
    }

    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
