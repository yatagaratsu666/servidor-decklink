import { RequestHandler, Response } from "express";
import { AuthRequest } from "../../../middleware/AuthMiddleware";
import { Request } from "express";
import * as loteModel from "../modules/LotesModel";
import { buscarLotesPublicados } from "../modules/LotesModel";

export const crearLote = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre } = req.body;

    const result = await loteModel.createLote(nombre, req.user.id);

    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al crear lote" });
  }
};

export const listarLotes = async (req: AuthRequest, res: Response) => {
  try {
    const lotes = await loteModel.getLotesByUser(req.user.id);
    res.json(lotes);
  } catch {
    res.status(500).json({ message: "Error al listar lotes" });
  }
};

export const eliminarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await loteModel.deleteLote(Number(id));
    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al eliminar lote" });
  }
};

export const actualizarLote: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    await loteModel.actualizarNombreLote(Number(id), req.user.id, nombre);

    res.json({ message: "Lote actualizado" });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Error al actualizar lote",
    });
  }
};

export const agregarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id_lote, id_carta } = req.body;

    const result = await loteModel.moverCartaALote(id_carta, id_lote);

    res.json({ message: "Carta agregada al lote", result });
  } catch {
    res.status(500).json({ message: "Error al mover carta" });
  }
};

export const quitarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id_lote, id_carta } = req.body;

    const result = await loteModel.sacarCartaDeLote(id_lote, id_carta);

    res.json({ message: "Carta removida del lote", result });
  } catch {
    res.status(500).json({ message: "Error al quitar carta" });
  }
};

export const verCartasLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cartas = await loteModel.getCartasFromLote(Number(id));
    res.json(cartas);
  } catch {
    res.status(500).json({ message: "Error al obtener cartas" });
  }
};

export const publicarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;

    await loteModel.publicarLote(Number(id), req.user.id, precio);

    res.json({ message: "Lote publicado correctamente" });
  } catch {
    res.status(500).json({ message: "Error al publicar lote" });
  }
};

export const verLotesPublicados: RequestHandler = async (_req, res) => {
  try {
    const data = await loteModel.getLotesPublicados();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error al obtener publicaciones" });
  }
};

export const despublicarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await loteModel.despublicarLote(Number(id), req.user.id);

    return res.json({ message: "Lote despublicado" });
  } catch {
    return res.status(500).json({
      message: "Error al despublicar lote",
    });
  }
};

export const obtenerLotePorId: RequestHandler = async (
  req: AuthRequest,
  res,
) => {
  try {
    const { id } = req.params;

    const lote = await loteModel.getLoteById(Number(id), req.user.id);

    res.json(lote);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Error al obtener lote",
    });
  }
};

export const getLotePublicadoDetalleController = async (
  req: Request<{ id_publicacion: string }>,
  res: Response,
) => {
  try {
    const { id_publicacion } = req.params;

    if (!id_publicacion) {
      return res.status(400).json({
        message: "Falta id_publicacion",
      });
    }

    const data = await loteModel.getLotePublicadoDetalle(
      Number(id_publicacion),
    );

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al obtener detalle del lote",
    });
  }
};

export const buscarLotes = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Query inválida" });
    }

    const data = await buscarLotesPublicados(q);

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error buscando lotes" });
  }
};

export const obtenerPublicacionesLoteUsuario = async (
  req: Request,
  res: Response,
) => {
  try {
    const id_usuario = Number(req.params["id"]);

    const data = await loteModel.getLotesPublicadosUsuario(id_usuario);

    res.json(data);
  } catch (error) {
    console.error("Error obtener lotes:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
