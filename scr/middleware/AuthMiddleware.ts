import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(403).json({ message: 'Token requerido' });
    return;
  }

  if (!authHeader.startsWith('Bearer ')) {
    res.status(403).json({ message: 'Formato de token inválido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(403).json({ message: 'Token inválido' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env['JWT_SECRET'] as string
    );

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }
};