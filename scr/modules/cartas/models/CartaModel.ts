import { db } from "../../../config/db";
import { CartaMongo } from "../../../config/mongo/CartasMongoModel";
import { Carta } from "../../../types/CartaInterface";

export const createCarta = (carta: Carta) => {
  return new Promise((resolve, reject) => {

    const { id_carta, tipo, ...cartaData } = carta;

    const tipos = tipo || [];

    const procesarTipos = (callback: (ids: number[]) => void) => {

      if (tipos.length === 0) return callback([]);

      const insertPromises = tipos.map((nombre: string) => {
        return new Promise<void>((res, rej) => {
          db.query(
            "INSERT IGNORE INTO tipo_carta (nombre) VALUES (?)",
            [nombre],
            (err) => {
              if (err) rej(err);
              else res();
            }
          );
        });
      });

      Promise.all(insertPromises)
        .then(() => {
          db.query(
            "SELECT id_tipo FROM tipo_carta WHERE nombre IN (?)",
            [tipos],
            (err, results: any[]) => {
              if (err) return reject(err);

              const ids = results.map(t => t.id_tipo);
              callback(ids);
            }
          );
        })
        .catch(reject);
    };

    procesarTipos((idsTipos) => {

      db.query(
        "INSERT INTO carta SET ?",
        cartaData,
        (err, result: any) => {
          if (err) return reject(err);

          const idNuevaCarta = result.insertId;

          if (idsTipos.length === 0) {
            return resolve(result);
          }

          const valores = idsTipos.map(id_tipo => [idNuevaCarta, id_tipo]);

          db.query(
            "INSERT INTO carta_tipo (id_carta, id_tipo) VALUES ?",
            [valores],
            (err2) => {
              if (err2) reject(err2);
              else resolve(result);
            }
          );
        }
      );
    });
  });
};

export const getCartasInventario = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        c.*,
        GROUP_CONCAT(tc.nombre) AS tipos
       FROM carta c
       LEFT JOIN carta_tipo ct ON c.id_carta = ct.id_carta
       LEFT JOIN tipo_carta tc ON ct.id_tipo = tc.id_tipo
       WHERE c.id_usuario = ?
       GROUP BY c.id_carta`,
      [id_usuario],
      (err, result: any[]) => {
        if (err) return reject(err);

        const cartas = result.map(({ tipos, ...carta }) => ({
          ...carta,
          tipo: tipos ? tipos.split(",") : []
        }));

        resolve(cartas);
      }
    );
  });
};

export const updateCarta = (id: number, carta: Carta) => {
  return new Promise((resolve, reject) => {
    const { tipo, ...cartaData } = carta;

    db.query(
      "UPDATE carta SET ? WHERE id_carta = ?",
      [cartaData, id],
      (err) => {
        if (err) return reject(err);

        db.query(
          "DELETE FROM carta_tipo WHERE id_carta = ?",
          [id],
          (err2) => {
            if (err2) return reject(err2);

            if (tipo && tipo.length > 0) {
              const values = tipo.map((id_tipo) => [id, id_tipo]);

              db.query(
                "INSERT INTO carta_tipo (id_carta, id_tipo) VALUES ?",
                [values],
                (err3) => {
                  if (err3) reject(err3);
                  else resolve(true);
                }
              );
            } else {
              resolve(true);
            }
          }
        );
      }
    );
  });
};

export const deleteCarta = (id: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM carta WHERE id_carta = ?",
      [id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

export const getCartaById = (id_carta: number, id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM carta 
       WHERE id_carta = ? AND id_usuario = ?`,
      [id_carta, id_usuario],
      (err, result: any) => {
        if (err) return reject(err);
        if (result.length === 0) {
          return reject(new Error("Carta no encontrada"));
        }
        resolve(result[0]);
      }
    );
  });
};

export const publicarCarta = (
  id_carta: number,
  id_usuario: number,
  precio: number
) => {
  return new Promise((resolve, reject) => {

    db.query(
      `INSERT INTO publicacion (precio, id_usuario)
       VALUES (?, ?)`,
      [precio, id_usuario],
      (err, result: any) => {
        if (err) return reject(err);

        const id_publicacion = result.insertId;

        db.query(
          `INSERT INTO publicacion_carta (id_publicacion, id_carta)
           VALUES (?, ?)`,
          [id_publicacion, id_carta],
          (err2) => {
            if (err2) return reject(err2);

            resolve({
              message: "Carta publicada correctamente",
              id_publicacion
            });
          }
        );
      }
    );

  });
};

export const getCartasPublicadas = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT
        p.id_publicacion,
        p.estado,
        p.fecha_publicacion,
        c.id_carta,
        c.nombre,
        c.juego,
        c.edicion,
        c.numero,
        c.rareza,
        c.imagen_url,
        c.descripcion,
        p.precio,
        p.fecha_publicacion,
        u.id_usuario,
        u.nombre_usuario,
        u.foto_perfil,
        u.reputacion,
        GROUP_CONCAT(DISTINCT tc.nombre) AS tipo
      FROM publicacion p
      JOIN publicacion_carta pc ON p.id_publicacion = pc.id_publicacion
      JOIN carta c ON pc.id_carta = c.id_carta
      JOIN usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN carta_tipo ct ON c.id_carta = ct.id_carta
      LEFT JOIN tipo_carta tc ON ct.id_tipo = tc.id_tipo
      WHERE p.estado IN ('activa', 'aceptada')
      GROUP BY 
        p.id_publicacion,
        c.id_carta,
        u.id_usuario`,
      (err, result: any[]) => {
        if (err) return reject(err);

        const publicaciones = result.map((row) => ({
          id_publicacion: row.id_publicacion,
          id_carta: row.id_carta,
          nombre: row.nombre,
          juego: row.juego,
          edicion: row.edicion,
          estado: row.estado,
          numero: row.numero,
          rareza: row.rareza,
          imagen_url: row.imagen_url,
          descripcion: row.descripcion,
          precio: row.precio,
          fecha_creacion: row.fecha_publicacion,
          usuario: {
            id_usuario: row.id_usuario,
            nombre_usuario: row.nombre_usuario,
            foto_perfil: row.foto_perfil,
            reputacion: row.reputacion,
          },
          tipo: row.tipo ? row.tipo.split(",") : [],
        }));

        resolve(publicaciones);
      }
    );
  });
};

export const despublicarCarta = (id_publicacion: number, id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) return reject(err);

      db.query(
        `DELETE FROM publicacion_carta WHERE id_publicacion = ?`,
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
            }
          );
        }
      );
    });
  });
};

const escapeRegex = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const buscarCartasMongo = async (nombre: string) => {
  const prefijo = escapeRegex(nombre.substring(0, 4));

  const cartas = await CartaMongo.find({
    nombre: { $regex: prefijo, $options: "i" }
  });

  return cartas;
};

export const getCartaMongoById = async (id_carta: string) => {
  const carta = await CartaMongo.findOne({ id_carta }, { _id: 0, __v: 0 });

  if (!carta) {
    throw new Error("Carta no encontrada");
  }

  return carta;
};

export const obtenerPublicacionesUsuario = (id_usuario: number) => {
  return new Promise((resolve, reject) => {

    db.query(
      `
      SELECT 
        p.id_publicacion,
        p.id_usuario,
        p.precio,
        p.fecha_publicacion AS fecha_creacion,

        u.nombre_usuario,
        u.foto_perfil,
        u.reputacion,

        c.id_carta,
        c.nombre,
        c.juego,
        c.edicion,
        c.numero,
        c.rareza,
        c.imagen_url,
        c.descripcion,

        GROUP_CONCAT(DISTINCT tc.nombre) as tipo

      FROM publicacion p

      JOIN usuario u 
        ON p.id_usuario = u.id_usuario

      JOIN publicacion_carta pc 
        ON p.id_publicacion = pc.id_publicacion

      JOIN carta c 
        ON pc.id_carta = c.id_carta

      LEFT JOIN carta_tipo ct 
        ON c.id_carta = ct.id_carta

      LEFT JOIN tipo_carta tc 
        ON ct.id_tipo = tc.id_tipo

      WHERE p.id_usuario = ?
      AND p.estado = 'activa'

      GROUP BY 
        p.id_publicacion,
        c.id_carta

      ORDER BY p.fecha_publicacion DESC
      `,
      [id_usuario],
      (err, results: any[]) => {

        if (err) {
          console.log("Error SQL:", err);
          reject(err);
          return;
        }

        const formateado = results.map((item) => ({
          id_publicacion: item.id_publicacion,
          precio: item.precio,
          fecha_creacion: item.fecha_creacion,

          id_carta: item.id_carta,
          nombre: item.nombre,
          juego: item.juego,
          edicion: item.edicion,
          numero: item.numero,
          rareza: item.rareza,
          imagen_url: item.imagen_url,
          descripcion: item.descripcion,

          tipo: item.tipo ? item.tipo.split(",") : [],

          usuario: {
            id_usuario: item.id_usuario,
            nombre_usuario: item.nombre_usuario,
            foto_perfil: item.foto_perfil,
            reputacion: item.reputacion,
          },
        }));

        resolve(formateado);
      }
    );

  });
};

export const buscarCartasPublicadas = (texto: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const q = `%${texto.substring(0, 4).toLowerCase()}%`;

    db.query(
      `
      SELECT p.*, c.nombre, c.imagen_url
      FROM publicacion p
      JOIN publicacion_carta pc ON pc.id_publicacion = p.id_publicacion
      JOIN carta c ON c.id_carta = pc.id_carta
      WHERE LOWER(c.nombre) LIKE ?
      ORDER BY p.fecha_publicacion DESC
      `,
      [q],
      (err, results: any[]) => {
        if (err) return reject(err);
        resolve(results || []);
      }
    );
  });
};

export const getCartasPublicadasUsuario = (
  id_usuario: number
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        p.id_publicacion,
        p.estado,
        p.fecha_publicacion,

        c.id_carta,
        c.nombre,
        c.imagen_url,
        c.juego,
        c.rareza,

        GROUP_CONCAT(DISTINCT tc.nombre) AS tipo

       FROM publicacion p
       JOIN publicacion_carta pc ON p.id_publicacion = pc.id_publicacion
       JOIN carta c ON pc.id_carta = c.id_carta
       LEFT JOIN carta_tipo ct ON c.id_carta = ct.id_carta
       LEFT JOIN tipo_carta tc ON ct.id_tipo = tc.id_tipo

       WHERE p.id_usuario = ?

       GROUP BY p.id_publicacion, c.id_carta`,
      [id_usuario],
      (err, result: any[]) => {
        if (err) return reject(err);

        const parsed = result.map((row) => ({
          id_publicacion: row.id_publicacion,
          estado: row.estado,
          tipo_publicacion: "carta",

          nombre: row.nombre,
          imagen_url: row.imagen_url,
          juego: row.juego,
          rareza: row.rareza,

          tipo: row.tipo ? row.tipo.split(",") : [],
        }));

        resolve(parsed);
      }
    );
  });
};