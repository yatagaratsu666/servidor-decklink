import { db } from "../../../config/db";

export const createLote = (nombre: string, id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO lote (nombre, id_usuario)
       VALUES (?, ?)`,
      [nombre, id_usuario],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
  });
};

export const getLotesByUser = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT 
        l.id_lote,
        l.nombre,
        l.id_usuario,
        l.fecha_publicacion,

        COUNT(cl.id_carta) AS total_cartas

      FROM lote l

      LEFT JOIN carta_lote cl 
        ON cl.id_lote = l.id_lote

      WHERE l.id_usuario = ?

      GROUP BY l.id_lote
      `,
      [id_usuario],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
  });
};

export const deleteLote = (id_lote: number) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) return reject(err);

      db.query("DELETE FROM carta_lote WHERE id_lote = ?", [id_lote], (err) => {
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
          },
        );
      });
    });
  });
};

export const actualizarNombreLote = (
  id_lote: number,
  id_usuario: number,
  nombre: string,
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
      },
    );
  });
};

export const moverCartaALote = (id_carta: number, id_lote: number) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM carta_lote WHERE id_carta = ?", [id_carta], (err) => {
      if (err) return reject(err);

      db.query(
        "INSERT INTO carta_lote (id_carta, id_lote) VALUES (?, ?)",
        [id_carta, id_lote],
        (err2, result) => {
          if (err2) return reject(err2);
          resolve(result);
        },
      );
    });
  });
};

export const sacarCartaDeLote = (id_lote: number, id_carta: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM carta_lote WHERE id_carta = ? AND id_lote = ?",
      [id_carta, id_lote],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
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
      },
    );
  });
};

export const publicarLote = (
  id_lote: number,
  id_usuario: number,
  precio: number,
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      INSERT INTO publicacion (precio, id_usuario)
       VALUES (?, ?)`,
      [precio, id_usuario],
      (err, result: any) => {
        if (err) return reject(err);

        const id_publicacion = result.insertId;

        db.query(
          `INSERT INTO publicacion_lote (id_publicacion, id_lote)
           VALUES (?, ?)`,
          [id_publicacion, id_lote],
          (err2, result2) => {
            if (err2) return reject(err2);
            resolve(result2);
          },
        );
      },
    );
  });
};

export const getLotesPublicados = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        l.id_lote,
        l.nombre,
        p.id_publicacion,
        p.estado,
        p.precio,
        p.fecha_publicacion,

        u.id_usuario,
        u.nombre_usuario,
        u.foto_perfil,
        COALESCE(u.reputacion, 0) AS reputacion,

        (SELECT c.imagen_url
         FROM carta c
         INNER JOIN carta_lote cl ON c.id_carta = cl.id_carta
         WHERE cl.id_lote = l.id_lote
         LIMIT 1) AS imagen_preview,

        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'nombre', c.nombre
            )
         )
         FROM carta c
         INNER JOIN carta_lote cl ON c.id_carta = cl.id_carta
         WHERE cl.id_lote = l.id_lote
        ) AS cartas

      FROM publicacion p
      JOIN publicacion_lote pl ON p.id_publicacion = pl.id_publicacion
      JOIN lote l ON pl.id_lote = l.id_lote
      JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.estado IN ('activa', 'aceptada')`,
      (err, result: any[]) => {
        if (err) return reject(err);

        const parsed = result.map((row) => ({
          id_publicacion: row.id_publicacion,
          id_lote: row.id_lote,
          nombre: row.nombre,
          precio: row.precio,
          estado: row.estado,
          fecha_creacion: row.fecha_publicacion,
          imagen_preview: row.imagen_preview,

          usuario: {
            id_usuario: row.id_usuario,
            nombre_usuario: row.nombre_usuario,
            foto_perfil: row.foto_perfil,
            reputacion: row.reputacion,
          },

          cartas:
            typeof row.cartas === "string"
              ? JSON.parse(row.cartas)
              : row.cartas || [],
        }));

        resolve(parsed);
      },
    );
  });
};

export const despublicarLote = (id_publicacion: number, id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) return reject(err);

      db.query(
        `
        DELETE FROM publicacion_lote WHERE id_publicacion = ?`,
        [id_publicacion],
        (err) => {
          if (err) return db.rollback(() => reject(err));

          db.query(
            `DELETE FROM publicacion WHERE id_publicacion = ? AND id_usuario = ?`,
            [id_publicacion, id_usuario],
            (err, result) => {
              if (err) return db.rollback(() => reject(err));

              db.commit((err) => {
                if (err) return db.rollback(() => reject(err));
                resolve(result);
              });
            },
          );
        },
      );
    });
  });
};

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
      },
    );
  });
};

export const getLotePublicadoDetalle = (id_publicacion: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        l.id_lote,
        l.nombre,
        p.id_publicacion,
        p.precio,
        p.fecha_publicacion,

        JSON_OBJECT(
          'id_usuario', u.id_usuario,
          'nombre_usuario', u.nombre_usuario,
          'foto_perfil', u.foto_perfil,
          'reputacion', COALESCE(u.reputacion, 0)
        ) AS usuario

      FROM publicacion p
      JOIN publicacion_lote pl ON p.id_publicacion = pl.id_publicacion
      JOIN lote l ON pl.id_lote = l.id_lote
      JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_publicacion = ?`,
      [id_publicacion],
      async (err, result: any[]) => {
        if (err) return reject(err);
        if (result.length === 0) return reject("No encontrado");

        const lote = result[0];

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
          [lote.id_lote],
          (err2, cartas: any[]) => {
            if (err2) return reject(err2);

            const cartasParseadas = cartas.map((c) => ({
              ...c,
              tipo: c.tipo ? c.tipo.split(",") : [],
            }));

            resolve({
              ...lote,
              cartas: cartasParseadas,
            });
          },
        );
      },
    );
  });
};

export const buscarLotesPublicados = (texto: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const q = `%${texto.substring(0, 4).toLowerCase()}%`;

    db.query(
      `
      SELECT DISTINCT p.*, l.nombre, l.id_lote
      FROM publicacion p
      JOIN publicacion_lote pl ON pl.id_publicacion = p.id_publicacion
      JOIN lote l ON l.id_lote = pl.id_lote
      LEFT JOIN carta_lote cl ON cl.id_lote = l.id_lote
      LEFT JOIN carta c ON c.id_carta = cl.id_carta
      WHERE 
        LOWER(l.nombre) LIKE ?
        OR LOWER(c.nombre) LIKE ?
      ORDER BY p.fecha_publicacion DESC
      `,
      [q, q],
      (err, results: any[]) => {
        if (err) return reject(err);
        resolve(results || []);
      },
    );
  });
};

export const getLotesPublicadosUsuario = (
  id_usuario: number,
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        p.id_publicacion,
        p.estado,
        p.fecha_publicacion,

        l.id_lote,
        l.nombre,

        (SELECT c.imagen_url
         FROM carta c
         INNER JOIN carta_lote cl ON c.id_carta = cl.id_carta
         WHERE cl.id_lote = l.id_lote
         LIMIT 1) AS imagen_preview

       FROM publicacion p
       JOIN publicacion_lote pl ON p.id_publicacion = pl.id_publicacion
       JOIN lote l ON pl.id_lote = l.id_lote

       WHERE p.id_usuario = ?`,
      [id_usuario],
      (err, result: any[]) => {
        if (err) return reject(err);

        const parsed = result.map((row) => ({
          id_publicacion: row.id_publicacion,
          estado: row.estado,
          tipo_publicacion: "lote",

          nombre: row.nombre,
          imagen_url: row.imagen_preview,
        }));

        resolve(parsed);
      },
    );
  });
};