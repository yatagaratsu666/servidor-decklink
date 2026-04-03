import { db } from "../../../config/db";

export const createLote = (nombre: string, id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO lote (nombre, id_usuario) VALUES (?, ?)',
      [nombre, id_usuario],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const getLotesByUser = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM lote WHERE id_usuario = ?',
      [id_usuario],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};


export const deleteLote = (id_lote: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM lote WHERE id_lote = ?',
      [id_lote],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const actualizarNombreLote = (id_lote: number, id_usuario: number, nombre: string) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE lote 
       SET nombre = ? 
       WHERE id_lote = ? AND id_usuario = ?`,
      [nombre, id_lote, id_usuario],
      (err, result: any) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) {
          return reject(new Error('No autorizado o lote no existe'));
        }

        resolve(result);
      }
    );
  });
};

export const moverCartaALote = (id_carta: number, id_lote: number) => {
  return new Promise((resolve, reject) => {

    db.query(
      'DELETE FROM carta_lote WHERE id_carta = ?',
      [id_carta],
      (err) => {
        if (err) return reject(err);

        db.query(
          'INSERT INTO carta_lote (id_carta, id_lote) VALUES (?, ?)',
          [id_carta, id_lote],
          (err2, result) => {
            if (err2) return reject(err2);
            resolve(result);
          }
        );
      }
    );

  });
};

export const sacarCartaDeLote = (id_carta: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM carta_lote WHERE id_carta = ?',
      [id_carta],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const getCartasFromLote = (id_lote: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT c.* FROM carta c
       INNER JOIN carta_lote cl ON c.id_carta = cl.id_carta
       WHERE cl.id_lote = ?`,
      [id_lote],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const publicarLote = (id_lote: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE lote SET publicado = true WHERE id_lote = ?',
      [id_lote],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const getLotesPublicados = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT l.*, u.nombre_usuario
       FROM lote l
       JOIN usuario u ON l.id_usuario = u.id_usuario
       WHERE l.publicado = true`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const despublicarLote = (id_lote: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE lote SET publicado = false WHERE id_lote = ?',
      [id_lote],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};