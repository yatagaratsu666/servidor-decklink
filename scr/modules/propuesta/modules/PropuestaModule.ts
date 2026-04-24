import { db } from "../../../config/db";

export const crearPropuesta = (
  id_publicacion: number,
  id_usuario: number,
  id_carta_propone?: number,
  id_lote_propone?: number,
  mensaje?: string,
) => {
  return new Promise((resolve, reject) => {
    if (id_carta_propone && id_lote_propone) {
      return reject(new Error("Solo puedes enviar carta o lote"));
    }

    if (!id_carta_propone && !id_lote_propone) {
      return reject(new Error("Debes enviar carta o lote"));
    }

    db.query(
      `SELECT id_usuario, estado 
       FROM publicacion 
       WHERE id_publicacion = ?`,
      [id_publicacion],
      (err, result: any[]) => {
        if (err) return reject(err);
        if (!result.length) return reject(new Error("No existe"));

        const pub = result[0];

        if (pub.estado !== "activa") {
          return reject(new Error("Publicación no activa"));
        }

        if (pub.id_usuario === id_usuario) {
          return reject(new Error("No puedes proponerte a ti mismo"));
        }

        const insertar = (tipo: "carta" | "lote") => {
          db.query(
            `INSERT INTO propuesta 
            (id_publicacion, id_usuario_propone, id_carta_propone, id_lote_propone, mensaje, estado, tipo_oferta)
            VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`,
            [
              id_publicacion,
              id_usuario,
              id_carta_propone || null,
              id_lote_propone || null,
              mensaje,
              tipo,
            ],
            (err2, result2: any) => {
              if (err2) return reject(err2);

              const propuestaId = result2.insertId;
              const duenio = pub.id_usuario;

              db.query(
                `INSERT INTO chat (id_publicacion, id_usuario1, id_usuario2, id_propuesta)
                 VALUES (?, ?, ?, ?)`,
                [id_publicacion, id_usuario, duenio, propuestaId],
                (err3, result3: any) => {
                  if (err3) return reject(err3);

                  const chatId = result3.insertId;

                  db.query(
                    `INSERT INTO mensaje (id_chat, id_emisor, mensaje, tipo)
                     VALUES (?, ?, ?, ?)`,
                    [chatId, id_usuario, mensaje || "Nueva oferta", tipo],
                    (err4) => {
                      if (err4) return reject(err4);

                      resolve({ propuestaId, chatId });
                    },
                  );
                },
              );
            },
          );
        };

        if (id_carta_propone) {
          db.query(
            `SELECT id_usuario FROM carta WHERE id_carta=?`,
            [id_carta_propone],
            (err2, carta: any[]) => {
              if (err2) return reject(err2);
              if (!carta.length) return reject(new Error("Carta no existe"));

              if (carta[0].id_usuario !== id_usuario) {
                return reject(new Error("No es tu carta"));
              }

              insertar("carta");
            },
          );
        }

        if (id_lote_propone) {
          db.query(
            `SELECT id_usuario FROM lote WHERE id_lote=?`,
            [id_lote_propone],
            (err3, lote: any[]) => {
              if (err3) return reject(err3);
              if (!lote.length) return reject(new Error("Lote no existe"));

              if (lote[0].id_usuario !== id_usuario) {
                return reject(new Error("No es tu lote"));
              }

              insertar("lote");
            },
          );
        }
      },
    );
  });
};

const updateCarta = (id_carta: number, nuevoUsuario: number) => {
  return new Promise((res, rej) => {
    db.query(
      `UPDATE carta SET id_usuario=? WHERE id_carta=?`,
      [nuevoUsuario, id_carta],
      (err) => (err ? rej(err) : res(true)),
    );
  });
};

const updateLote = (id_lote: number, nuevoUsuario: number) => {
  return new Promise((res, rej) => {
    db.query(
      `UPDATE lote SET id_usuario=? WHERE id_lote=?`,
      [nuevoUsuario, id_lote],
      (err) => {
        if (err) return rej(err);

        db.query(
          `UPDATE carta 
           SET id_usuario=? 
           WHERE id_carta IN (
             SELECT id_carta FROM carta_lote WHERE id_lote=?
           )`,
          [nuevoUsuario, id_lote],
          (err2) => {
            if (err2) return rej(err2);

            res(true);
          },
        );
      },
    );
  });
};

export const confirmarIntercambio = (
  id_propuesta: number,
  id_usuario: number,
): Promise<{ message: string }> => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) return reject(err);

      db.query(
        `SELECT 
          p.*,
          pub.id_usuario AS duenio_publicacion,
          pc.id_carta AS carta_publicacion,
          pl.id_lote AS lote_publicacion
        FROM propuesta p
        JOIN publicacion pub 
          ON p.id_publicacion = pub.id_publicacion
        LEFT JOIN publicacion_carta pc 
          ON pc.id_publicacion = pub.id_publicacion
        LEFT JOIN publicacion_lote pl 
          ON pl.id_publicacion = pub.id_publicacion
        WHERE p.id_propuesta = ?`,
        [id_propuesta],
        (err2, results: any[]) => {
          if (err2) return db.rollback(() => reject(err2));
          if (!results.length)
            return db.rollback(() => reject(new Error("No existe")));

          const p = results[0];

          if (
            p.id_usuario_propone !== id_usuario &&
            p.duenio_publicacion !== id_usuario
          ) {
            return db.rollback(() => reject(new Error("No autorizado")));
          }

          if (p.estado !== "confirmacion") {
            return db.rollback(() =>
              reject(new Error("Debe estar en confirmación")),
            );
          }

          const queries: Promise<any>[] = [];

          if (p.id_carta_propone && p.carta_publicacion) {
            queries.push(updateCarta(p.id_carta_propone, p.duenio_publicacion));
            queries.push(
              updateCarta(p.carta_publicacion, p.id_usuario_propone),
            );
          }

          if (p.id_carta_propone && p.lote_publicacion) {
            queries.push(updateCarta(p.id_carta_propone, p.duenio_publicacion));
            queries.push(updateLote(p.lote_publicacion, p.id_usuario_propone));
          }

          if (p.id_lote_propone && p.carta_publicacion) {
            queries.push(updateLote(p.id_lote_propone, p.duenio_publicacion));
            queries.push(
              updateCarta(p.carta_publicacion, p.id_usuario_propone),
            );
          }

          if (p.id_lote_propone && p.lote_publicacion) {
            queries.push(updateLote(p.id_lote_propone, p.duenio_publicacion));
            queries.push(updateLote(p.lote_publicacion, p.id_usuario_propone));
          }

          Promise.all(queries)
            .then(() => {
              db.query(
                `DELETE FROM mensaje WHERE id_chat IN 
                 (SELECT id_chat FROM chat WHERE id_propuesta=?)`,
                [id_propuesta],
                () => {
                  db.query(
                    `DELETE FROM chat WHERE id_propuesta=?`,
                    [id_propuesta],
                    () => {
                      db.query(
                        `DELETE FROM propuesta WHERE id_publicacion=?`,
                        [p.id_publicacion],
                        () => {
                          db.query(
                            `DELETE FROM publicacion WHERE id_publicacion=?`,
                            [p.id_publicacion],
                            () => {
                              db.commit((err) => {
                                if (err) {
                                  return db.rollback(() => reject(err));
                                }

                                resolve({
                                  message:
                                    "Intercambio realizado correctamente",
                                });
                              });
                            },
                          );
                        },
                      );
                    },
                  );
                },
              );
            })
            .catch((error) => {
              db.rollback(() => reject(error));
            });
        },
      );
    });
  });
};

export const getPropuestas = (id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        p.id_propuesta,
        p.estado,
        p.mensaje,
        p.id_usuario_propone,
        p.id_publicacion,
        p.tipo_oferta,

        c.id_chat,

        u.nombre_usuario,
        u.foto_perfil,

        pub.id_usuario AS id_usuario_dueno,

        ca.id_carta AS id_carta_propone,
        ca.nombre AS nombre,
        ca.juego,
        ca.edicion,
        ca.numero,
        ca.rareza,
        ca.imagen_url,

        lo.id_lote AS id_lote_propone,
        lo.nombre AS nombre_lote_propone,

        pc.id_carta AS carta_publicacion,
        cp.nombre AS nombre_carta_pub,
        cp.juego AS juego_pub,
        cp.rareza AS rareza_pub,

        pl.id_lote AS lote_publicacion,
        lp.nombre AS nombre_lote_pub

      FROM propuesta p

      JOIN usuario u 
        ON p.id_usuario_propone = u.id_usuario

      JOIN publicacion pub 
        ON p.id_publicacion = pub.id_publicacion

      LEFT JOIN chat c 
        ON c.id_propuesta = p.id_propuesta

      LEFT JOIN carta ca 
        ON p.id_carta_propone = ca.id_carta

      LEFT JOIN lote lo
        ON p.id_lote_propone = lo.id_lote

      LEFT JOIN publicacion_carta pc 
        ON pc.id_publicacion = p.id_publicacion

      LEFT JOIN carta cp 
        ON cp.id_carta = pc.id_carta

      LEFT JOIN publicacion_lote pl 
        ON pl.id_publicacion = p.id_publicacion

      LEFT JOIN lote lp 
        ON lp.id_lote = pl.id_lote

      WHERE 
        pub.id_usuario = ?
        OR p.id_usuario_propone = ?

      ORDER BY p.id_propuesta DESC
      `,
      [id_usuario, id_usuario],
      (err, results) => {
        if (err) return reject(err);

        resolve(results);
      },
    );
  });
};

export const rechazarPropuesta = (id_propuesta: number, id_usuario: number) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        p.id_propuesta,
        p.id_publicacion,
        p.id_usuario_propone,
        pub.id_usuario AS duenio_publicacion
      FROM propuesta p
      JOIN publicacion pub 
        ON p.id_publicacion = pub.id_publicacion
      WHERE p.id_propuesta = ?`,
      [id_propuesta],
      (err, results: any[]) => {
        if (err) return reject(err);

        if (!results.length) {
          return reject(new Error("Propuesta no encontrada"));
        }

        const propuesta = results[0];

        if (propuesta.duenio_publicacion !== id_usuario) {
          return reject(new Error("No autorizado"));
        }

        db.query(
          `DELETE FROM mensaje 
           WHERE id_chat IN (
             SELECT id_chat FROM chat 
             WHERE id_publicacion = ?
             AND (
               (id_usuario1 = ? AND id_usuario2 = ?)
               OR
               (id_usuario1 = ? AND id_usuario2 = ?)
             )
           )`,
          [
            propuesta.id_publicacion,
            propuesta.id_usuario_propone,
            propuesta.duenio_publicacion,
            propuesta.duenio_publicacion,
            propuesta.id_usuario_propone,
          ],
          (err2) => {
            if (err2) return reject(err2);

            db.query(
              `DELETE FROM chat 
               WHERE id_publicacion = ?
               AND (
                 (id_usuario1 = ? AND id_usuario2 = ?)
                 OR
                 (id_usuario1 = ? AND id_usuario2 = ?)
               )`,
              [
                propuesta.id_publicacion,
                propuesta.id_usuario_propone,
                propuesta.duenio_publicacion,
                propuesta.duenio_publicacion,
                propuesta.id_usuario_propone,
              ],
              (err3) => {
                if (err3) return reject(err3);

                db.query(
                  `DELETE FROM propuesta WHERE id_propuesta=?`,
                  [id_propuesta],
                  (err4) => {
                    if (err4) return reject(err4);

                    resolve({ message: "Propuesta rechazada" });
                  },
                );
              },
            );
          },
        );
      },
    );
  });
};

export const solicitarConfirmacion = (
  id_propuesta: number,
  id_usuario: number,
  io: any,
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        p.id_propuesta,
        c.id_chat,
        pub.id_usuario as duenio
      FROM propuesta p
      JOIN publicacion pub 
        ON p.id_publicacion = pub.id_publicacion
      LEFT JOIN chat c 
        ON c.id_propuesta = p.id_propuesta
      WHERE p.id_propuesta = ?`,
      [id_propuesta],
      (err, results: any[]) => {
        if (err) return reject(err);
        if (!results.length) return reject(new Error("No encontrada"));

        const data = results[0];

        if (!data.id_chat) {
          return reject(new Error("Chat no encontrado"));
        }

        if (data.duenio !== id_usuario) {
          return reject(new Error("No autorizado"));
        }

        db.query(
          `UPDATE propuesta SET estado='confirmacion' WHERE id_propuesta=?`,
          [id_propuesta],
          (err2) => {
            if (err2) return reject(err2);

            const mensaje = "El dueño quiere aceptar el trato, confirmas?";

            db.query(
              `INSERT INTO mensaje (id_chat, id_emisor, mensaje, tipo)
               VALUES (?, ?, ?, ?)`,
              [data.id_chat, id_usuario, mensaje, "confirmacion"],
              (err3, result: any) => {
                if (err3) return reject(err3);

                io.to(`chat-${data.id_chat}`).emit("newMessage", {
                  id_mensaje: result.insertId,
                  id_chat: data.id_chat,
                  id_emisor: id_usuario,
                  mensaje,
                  tipo: "confirmacion",
                });

                resolve({ message: "Confirmación enviada" });
              },
            );
          },
        );
      },
    );
  });
};