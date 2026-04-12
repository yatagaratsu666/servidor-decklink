import { db } from "../../../config/db";

// ✅ CREAR LOTE
export const createLote = (
  nombre: string,
  id_usuario: number
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO lote (nombre, id_usuario)
       VALUES (?, ?)`,
      [nombre, id_usuario],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

// ✅ LISTAR LOTES DEL USUARIO
export const getLotesByUser = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM lote WHERE id_usuario = ?",
      [id_usuario],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

// ✅ ELIMINAR LOTE
export const deleteLote = (id_lote: number) => {
  return new Promise((resolve, reject) => {

    db.beginTransaction((err) => {
      if (err) return reject(err);

      db.query(
        "DELETE FROM carta_lote WHERE id_lote = ?",
        [id_lote],
        (err) => {
          if (err) return db.rollback(() => reject(err));

          db.query(
            "DELETE FROM lote WHERE id_lote = ?",
            [id_lote],
            (err, result) => {
              if (err) return db.rollback(() => reject(err));

              db.commit((err) => {
                if (err) return db.rollback(() => reject(err));
                resolve(result);
              });
            }
          );
        }
      );
    });

  });
};

// ✅ ACTUALIZAR NOMBRE
export const actualizarNombreLote = (
  id_lote: number,
  id_usuario: number,
  nombre: string
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE lote 
       SET nombre = ? 
       WHERE id_lote = ? AND id_usuario = ?`,
      [nombre, id_lote, id_usuario],
      (err, result: any) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) {
          return reject(new Error("No autorizado o lote no existe"));
        }

        resolve(result);
      }
    );
  });
};

// ✅ MOVER CARTA A LOTE (1 lote por carta)
export const moverCartaALote = (id_carta: number, id_lote: number) => {
  return new Promise((resolve, reject) => {

    db.query(
      "DELETE FROM carta_lote WHERE id_carta = ?",
      [id_carta],
      (err) => {
        if (err) return reject(err);

        db.query(
          "INSERT INTO carta_lote (id_carta, id_lote) VALUES (?, ?)",
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

// ✅ SACAR CARTA
export const sacarCartaDeLote = (id_lote: number, id_carta: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM carta_lote WHERE id_carta = ? AND id_lote = ?",
      [id_carta, id_lote],
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
      `SELECT 
        c.id_carta,
        c.nombre,
        c.juego,
        c.edicion,
        c.numero,
        c.rareza,
        c.imagen_url,
        c.descripcion,
        GROUP_CONCAT(DISTINCT tc.nombre) AS tipo
       FROM carta c
       INNER JOIN carta_lote cl ON c.id_carta = cl.id_carta
       LEFT JOIN carta_tipo ct ON c.id_carta = ct.id_carta
       LEFT JOIN tipo_carta tc ON ct.id_tipo = tc.id_tipo
       WHERE cl.id_lote = ?
       GROUP BY c.id_carta`,
      [id_lote],
      (err, result: any[]) => {
        if (err) return reject(err);

        const cartas = result.map((row) => ({
          ...row,
          tipo: row.tipo ? row.tipo.split(",") : [],
        }));

        resolve(cartas);
      }
    );
  });
};

// 🔥 PUBLICAR LOTE (CORRECTO)
export const publicarLote = (
  id_lote: number,
  id_usuario: number,
  data: any
) => {
  return new Promise((resolve, reject) => {

    db.query(
      `INSERT INTO publicacion (titulo, descripcion, precio, id_usuario)
       VALUES (?, ?, ?, ?)`,
      [data.titulo, data.descripcion, data.precio, id_usuario],
      (err, result: any) => {
        if (err) return reject(err);

        const id_publicacion = result.insertId;

        db.query(
          `INSERT INTO publicacion_lote (id_publicacion, id_lote)
           VALUES (?, ?)`,
          [id_publicacion, id_lote],
          (err2, result2) => {
            if (err2) reject(err2);
            else resolve(result2);
          }
        );
      }
    );

  });
};

// 🔥 VER LOTES PUBLICADOS
export const getLotesPublicados = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT l.*, p.precio, p.titulo, u.nombre_usuario
       FROM publicacion p
       JOIN publicacion_lote pl ON p.id_publicacion = pl.id_publicacion
       JOIN lote l ON pl.id_lote = l.id_lote
       JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.estado = 'activa'`,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

// 🔥 DESPUBLICAR
export const despublicarLote = (id_publicacion: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE publicacion 
       SET estado = 'pausada'
       WHERE id_publicacion = ?`,
      [id_publicacion],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

// ✅ OBTENER LOTE POR ID
export const getLoteById = (id_lote: number, id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM lote 
       WHERE id_lote = ? AND id_usuario = ?`,
      [id_lote, id_usuario],
      (err, result: any) => {
        if (err) return reject(err);

        if (result.length === 0) {
          return reject(new Error("Lote no encontrado"));
        }

        resolve(result[0]);
      }
    );
  });
};