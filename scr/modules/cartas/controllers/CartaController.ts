import { RequestHandler, Response } from "express";
import { AuthRequest } from "../../../middleware/AuthMiddleware";
import * as cartaModel from "../models/CartaModel";
import { Request} from "express";
import { getCartaMongoById } from "../models/CartaModel";
import { getCartaById } from "../models/CartaModel";
import { getCartasPublicadas } from "../models/CartaModel";

export const crearCarta = async (req: AuthRequest, res: Response) => {
  try {
    const nuevaCarta = {
      ...req.body,
      id_usuario: req.user.id,
    };

    const result = await cartaModel.createCarta(nuevaCarta);
    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al crear carta" });
  }
};

export const listarCartas = async (req: AuthRequest, res: Response) => {
  try {
    const cartas = await cartaModel.getCartasInventario(req.user.id);
    res.json(cartas);
  } catch {
    res.status(500).json({ message: "Error al listar cartas" });
  }
};

export const actualizarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await cartaModel.updateCarta(Number(id), req.body);
    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al actualizar carta" });
  }
};

export const eliminarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await cartaModel.deleteCarta(Number(id));
    res.json(result);
  } catch {
    res.status(500).json({ message: "Error al eliminar carta" });
  }
};

export const publicarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;

    if (!precio) {
      return res.status(400).json({
        message: "El precio es obligatorio"
      });
    }

    const result = await cartaModel.publicarCarta(
      Number(id),
      req.user.id,
      precio
    );

    return res.json({
      message: "Carta publicada",
      result,
    });

  } catch {
    return res.status(500).json({
      message: "Error al publicar carta"
    });
  }
};

export const verCartasPublicadas: RequestHandler = async (_req, res) => {
  try {
    const data = await getCartasPublicadas();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error al obtener publicaciones" });
  }
};

export const despublicarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await cartaModel.despublicarCarta(
      Number(id),
      req.user.id
    );

    return res.json({
      message: "Carta despublicada"
    });

  } catch {
    return res.status(500).json({
      message: "Error al despublicar carta"
    });
  }
};

export const obtenerCartaPorId: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    const { id } = req.params;

    const carta = await getCartaById(
      Number(id),
      req.user.id
    );

    res.json(carta);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Error al obtener carta",
    });
  }
};

export const buscarCartasMongoController = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.query;

    if (!nombre || typeof nombre !== "string") {
      return res.status(400).json({
        message: "El parámetro 'nombre' es obligatorio"
      });
    }

    const cartas = await cartaModel.buscarCartasMongo(nombre);

    return res.json({
      total: cartas.length,
      resultados: cartas
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error al buscar cartas en Mongo"
    });
  }
};

export const obtenerCartaMongoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "El id es obligatorio"
      });
    }

    const carta = await getCartaMongoById(id);

    return res.json(carta);

  } catch (error: any) {
    return res.status(404).json({
      message: error.message || "Carta no encontrada"
    });
  }
};