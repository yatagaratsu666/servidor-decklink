import { db } from "../../../config/db";
import { User } from "../../../types/UserInterface";
import bcrypt from 'bcrypt';

export const findUserByEmail = (email: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM usuario WHERE email = ?',
      [email],
      (err, results: any) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });
};

export const registerUser = (user: any) => {
  return new Promise(async (resolve, reject) => {
    try {

      const hashedPassword = await bcrypt.hash(user.contrasena, 10);

      db.query(
        `INSERT INTO usuario 
        (nombre_usuario, email, contrasena) 
        VALUES (?, ?, ?)`,
        [user.nombre_usuario, user.email, hashedPassword],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );

    } catch (error) {
      reject(error);
    }
  });
};