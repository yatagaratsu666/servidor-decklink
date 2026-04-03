import { RequestHandler, Response } from 'express';
import { AuthRequest } from '../../../middleware/AuthMiddleware';
import * as loteModel from '../modules/LotesModel';

export const crearLote = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre } = req.body;

    const result = await loteModel.createLote(
      nombre,
      req.user.id
    );

    res.json(result);

  } catch {
    res.status(500).json({ message: 'Error al crear lote' });
  }
};

export const listarLotes = async (req: AuthRequest, res: Response) => {
  try {
    const lotes = await loteModel.getLotesByUser(req.user.id);
    res.json(lotes);

  } catch {
    res.status(500).json({ message: 'Error al listar lotes' });
  }
};

export const eliminarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await loteModel.deleteLote(Number(id));
    res.json(result);

  } catch {
    res.status(500).json({ message: 'Error al eliminar lote' });
  }
};

export const actualizarLote: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        message: 'El nombre es obligatorio'
      });
    }

    await loteModel.actualizarNombreLote(
      Number(id),
      req.user.id,
      nombre
    );

    return res.json({
      message: 'Nombre del lote actualizado correctamente'
    });

  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Error al actualizar lote'
    });
  }
};

export const agregarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id_lote, id_carta } = req.body;

    const result = await loteModel.moverCartaALote(
      id_carta,
      id_lote
    );

    res.json({ message: 'Carta movida al lote', result });

  } catch {
    res.status(500).json({ message: 'Error al mover carta' });
  }
};

export const quitarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id_carta } = req.body;

    const result = await loteModel.sacarCartaDeLote(id_carta);

    res.json({ message: 'Carta devuelta al inventario', result });

  } catch {
    res.status(500).json({ message: 'Error al devolver carta' });
  }
};

export const verCartasLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cartas = await loteModel.getCartasFromLote(Number(id));
    res.json(cartas);

  } catch {
    res.status(500).json({ message: 'Error al obtener cartas del lote' });
  }
};

export const publicarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await loteModel.publicarLote(Number(id));

    return res.json({
      message: 'Lote publicado'
    });

  } catch {
    return res.status(500).json({ message: 'Error al publicar lote' });
  }
};

export const verLotesPublicados: RequestHandler = async (_req, res) => {
  const data = await loteModel.getLotesPublicados();
  res.json(data);
};

export const despublicarLote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await loteModel.despublicarLote(Number(id));

    return res.json({
      message: 'Lote despublicado'
    });

  } catch {
    return res.status(500).json({ message: 'Error al despublicar' });
  }
};