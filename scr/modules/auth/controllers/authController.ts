import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail } from '../models/UserModel';
import {registerUser } from '../models/UserModel';
import { generateToken } from '../../../utils/jwt';

export const login = async (req: Request, res: Response) => {
  const { email, contrasena } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(contrasena, user.contrasena);

    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login exitoso',
      token
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error interno' });
  }
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nombre_usuario, email, contrasena } = req.body;

    // 🔴 validación básica
    if (!nombre_usuario || !email || !contrasena) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios'
      });
    }

    const result = await registerUser(req.body);

    return res.json({
      message: 'Usuario registrado correctamente',
      result
    });

  } catch (error: any) {

    // ⚠️ email duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    return res.status(500).json({
      message: 'Error al registrar usuario'
    });
  }
};