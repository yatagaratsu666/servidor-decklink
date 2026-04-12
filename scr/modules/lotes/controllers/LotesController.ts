import { RequestHandler, Response } from "express";
import { AuthRequest } from "../../../middleware/AuthMiddleware";
import * as loteModel from "../modules/LotesModel";

// ✅ CREAR LOTE
export const crearLote = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre} = req.body;

    const result = await loteModel.createLote(
      nombre,
      req.user.id
    );

    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al crear lote" });
  }
};

// ✅ LISTAR LOTES
export const listarLotes = async (req: AuthRequest, res: Response) => {
  try {
    const lotes = await loteModel.getLotesByUser(req.user.id);
    res.json(lotes);
  } catch {
    res.status(500).json({ message: "Error al listar lotes" });
  }
};

// ✅ ELIMINAR
export const eliminarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await loteModel.deleteLote(Number(id));
    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al eliminar lote" });
  }
};

// ✅ ACTUALIZAR
export const actualizarLote: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    await loteModel.actualizarNombreLote(
      Number(id),
      req.user.id,
      nombre
    );

    res.json({ message: "Lote actualizado" });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Error al actualizar lote",
    });
  }
};

// ✅ AGREGAR CARTA
export const agregarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id_lote, id_carta } = req.body;

    const result = await loteModel.moverCartaALote(
      id_carta,
      id_lote
    );

    res.json({ message: "Carta agregada al lote", result });
  } catch {
    res.status(500).json({ message: "Error al mover carta" });
  }
};

// ✅ QUITAR CARTA
export const quitarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id_lote, id_carta } = req.body;

    const result = await loteModel.sacarCartaDeLote(id_lote, id_carta);

    res.json({ message: "Carta removida del lote", result });
  } catch {
    res.status(500).json({ message: "Error al quitar carta" });
  }
};

// ✅ VER CARTAS
export const verCartasLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cartas = await loteModel.getCartasFromLote(Number(id));
    res.json(cartas);
  } catch {
    res.status(500).json({ message: "Error al obtener cartas" });
  }
};

// 🔥 PUBLICAR LOTE
export const publicarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await loteModel.publicarLote(
      Number(id),
      req.user.id,
      req.body // titulo, descripcion, precio
    );

    res.json({ message: "Lote publicado correctamente" });
  } catch {
    res.status(500).json({ message: "Error al publicar lote" });
  }
};

// 🔥 VER PUBLICADOS
export const verLotesPublicados: RequestHandler = async (_req, res) => {
  try {
    const data = await loteModel.getLotesPublicados();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error al obtener publicaciones" });
  }
};

// 🔥 DESPUBLICAR
export const despublicarLote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await loteModel.despublicarLote(Number(id));

    res.json({ message: "Publicación pausada" });
  } catch {
    res.status(500).json({ message: "Error al despublicar" });
  }
};

// ✅ OBTENER POR ID
export const obtenerLotePorId: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const lote = await loteModel.getLoteById(
      Number(id),
      req.user.id
    );

    res.json(lote);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Error al obtener lote",
    });
  }
};