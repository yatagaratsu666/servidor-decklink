import { db } from "../../../config/db";
import { User } from "../../../types/UserInterface";
import bcrypt from "bcrypt";

export const findUserByEmail = (email: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email],
      (err, results: any) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      },
    );
  });
};

export const registerUser = (user: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await bcrypt.hash(user.contrasena, 10);

      db.query(
        `INSERT INTO usuario 
        (nombre_usuario, email, contrasena, foto_perfil) 
        VALUES (?, ?, ?, ?)`,
        [user.nombre_usuario, user.email, hashedPassword, user.foto_perfil],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const findUserById = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        u.*,

        COUNT(c.id_calificacion) AS total_resenas,
        COALESCE(AVG(c.puntuacion), 0) AS promedio_calificacion

       FROM usuario u
       LEFT JOIN calificacion c 
       ON u.id_usuario = c.id_usuario_calificado

       WHERE u.id_usuario = ?
       GROUP BY u.id_usuario`,
      [id],
      (err, results: any) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      },
    );
  });
};

export const crearCalificacion = (
  id_usuario_califica: number,
  id_usuario_calificado: number,
  puntuacion: number,
  comentario: string,
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO calificacion 
       (id_usuario_califica, id_usuario_calificado, puntuacion, comentario)
       VALUES (?, ?, ?, ?)`,
      [id_usuario_califica, id_usuario_calificado, puntuacion, comentario],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

export const actualizarReputacion = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE usuario u
       SET reputacion = (
         SELECT AVG(puntuacion)
         FROM calificacion
         WHERE id_usuario_calificado = ?
       )
       WHERE u.id_usuario = ?`,
      [id_usuario, id_usuario],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

export const getResenasUsuario = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        c.*,
        u.nombre_usuario,
        u.foto_perfil

       FROM calificacion c
       JOIN usuario u 
       ON c.id_usuario_califica = u.id_usuario

       WHERE c.id_usuario_calificado = ?
       ORDER BY c.fecha DESC`,
      [id_usuario],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      },
    );
  });
};
