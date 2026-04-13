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

          // relacionar carta - tipo
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
          numero: row.numero,
          rareza: row.rareza,
          imagen_url: row.imagen_url,
          descripcion: row.descripcion,
          precio: row.precio,
          fecha_publicacion: row.fecha_publicacion,
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

export const despublicarCarta = (id_carta: number, id_usuario: number) => {
  return new Promise((resolve, reject) => {

    db.query(
      `DELETE p FROM publicacion p
       INNER JOIN publicacion_carta pc 
       ON p.id_publicacion = pc.id_publicacion
       WHERE pc.id_carta = ? AND p.id_usuario = ?`,
      [id_carta, id_usuario],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

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