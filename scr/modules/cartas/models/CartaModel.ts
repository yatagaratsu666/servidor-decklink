import { db } from "../../../config/db";
import { Carta } from "../../../types/CartaInterface";


export const createCarta = (carta: Carta) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO carta SET ?',
      carta as any,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const getCartasInventario = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM carta 
       WHERE id_usuario = ?
       AND id_carta NOT IN (
         SELECT id_carta FROM carta_lote
       )`,
      [id_usuario],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const updateCarta = (id: number, carta: Carta) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE carta SET ? WHERE id_carta = ?',
      [carta, id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const deleteCarta = (id: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM carta WHERE id_carta = ?',
      [id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};