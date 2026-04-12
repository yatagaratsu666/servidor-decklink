import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export const generateToken = (user: any): string => {
  return jwt.sign(
    { id: user.id_usuario, email: user.email},
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );
};