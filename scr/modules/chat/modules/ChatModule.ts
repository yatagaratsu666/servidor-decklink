import { db } from "../../../config/db";

export const obtenerMensajes = (chatId: number) => {
  return new Promise((resolve, reject) => {

    db.query(
`
SELECT 
  m.id_mensaje,
  m.id_chat,
  m.id_emisor,
  m.mensaje,
  m.tipo,
  m.created_at,

  p.id_usuario_propone,

  c.nombre,
  c.juego,
  c.edicion,
  c.numero,
  c.rareza,
  c.imagen_url,
  c.descripcion,

  GROUP_CONCAT(DISTINCT tc.nombre) as tipo_carta,

  l.id_lote,
  l.nombre AS nombre_lote,
  GROUP_CONCAT(DISTINCT c_lote.nombre) AS nombres_cartas,
  GROUP_CONCAT(DISTINCT c_lote.imagen_url) AS imagenes_cartas

FROM mensaje m

JOIN chat ch ON ch.id_chat = m.id_chat
LEFT JOIN propuesta p ON p.id_propuesta = ch.id_propuesta

LEFT JOIN carta c ON c.id_carta = p.id_carta_propone
LEFT JOIN carta_tipo ct ON ct.id_carta = c.id_carta
LEFT JOIN tipo_carta tc ON tc.id_tipo = ct.id_tipo

LEFT JOIN lote l ON l.id_lote = p.id_lote_propone
LEFT JOIN carta_lote cl ON cl.id_lote = l.id_lote
LEFT JOIN carta c_lote ON c_lote.id_carta = cl.id_carta

WHERE m.id_chat = ?

GROUP BY m.id_mensaje

ORDER BY m.created_at ASC
`,
      [chatId],
      (err, results: any[]) => {

        if (err) {
          reject(err);
          return;
        }

        const parsed = results.map((r: any) => {

          let cartas = [];

          if (r.id_lote) {
            const nombres = r.nombres_cartas?.split(",") || [];
            const imagenes = r.imagenes_cartas?.split(",") || [];

            cartas = nombres.map((nombre: string, i: number) => ({
              nombre,
              imagen_url: imagenes[i]
            }));
          }

          return {
            ...r,
            es_lote: !!r.id_lote,
            cartas
          };
        });

        resolve(parsed);
      }
    );

  });
};

export const guardarMensaje = (
  chatId: number,
  userId: number,
  mensaje: string
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      INSERT INTO mensaje 
      (id_chat, id_emisor, mensaje)
      VALUES (?, ?, ?)
      `,
      [chatId, userId, mensaje],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};