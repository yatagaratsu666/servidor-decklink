import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { actualizarReputacion, crearCalificacion, findUserByEmail, findUserById, getResenasUsuario } from '../models/UserModel';
import {registerUser } from '../models/UserModel';
import { generateToken } from '../../../utils/jwt';
import { AuthRequest } from '../../../middleware/AuthMiddleware';
import { getCartasPublicadasUsuario } from '../../cartas/models/CartaModel';
import { getLotesPublicadosUsuario } from '../../lotes/modules/LotesModel';

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


export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    return res.json({
      id_usuario: user.id_usuario,
      nombre_usuario: user.nombre_usuario,
      email: user.email,
      foto_perfil: user.foto_perfil,
      reputacion: user.reputacion
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error interno'
    });
  }
};


export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params?.['id']);

    if (!id) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      id_usuario: user.id_usuario,
      nombre_usuario: user.nombre_usuario,
      email: user.email,
      foto_perfil: user.foto_perfil,
      reputacion: user.reputacion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const calificarUsuario = async (req: any, res: Response) => {
  try {
    const { id_usuario_calificado, puntuacion, comentario } = req.body;

    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ message: "Puntuación inválida" });
    }

    await crearCalificacion(
      req.user.id,
      id_usuario_calificado,
      puntuacion,
      comentario || "",
    );

    await actualizarReputacion(id_usuario_calificado);

    return res.json({ message: "Calificación guardada" });
  } catch (error) {
    return res.status(500).json({ message: "Error al calificar" });
  }
};

export const obtenerResenasUsuario = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID requerido" });
    }

    const resenas = await getResenasUsuario(Number(id));

    return res.status(200).json(resenas);
  } catch (error) {
    console.error("Error obteniendo reseñas:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerPublicacionesUsuario = async (
  req: Request,
  res: Response,
) => {
  try {
    const id_usuario = Number(req.params["id"]);

    const [cartas, lotes] = await Promise.all([
      getCartasPublicadasUsuario(id_usuario),
      getLotesPublicadosUsuario(id_usuario),
    ]);

    const data = [...cartas, ...lotes];

    res.json(data);
  } catch (error) {
    console.error("Error obtener publicaciones:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};