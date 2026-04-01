import { Response } from 'express';
import { AuthRequest } from '../../../middleware/AuthMiddleware';
import * as loteModel from '../modules/LotesModel';

// CREAR LOTE
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

// LISTAR LOTES
export const listarLotes = async (req: AuthRequest, res: Response) => {
  try {
    const lotes = await loteModel.getLotesByUser(req.user.id);
    res.json(lotes);

  } catch {
    res.status(500).json({ message: 'Error al listar lotes' });
  }
};

// ELIMINAR LOTE
export const eliminarLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await loteModel.deleteLote(Number(id));
    res.json(result);

  } catch {
    res.status(500).json({ message: 'Error al eliminar lote' });
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

// VER CARTAS DEL LOTE
export const verCartasLote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cartas = await loteModel.getCartasFromLote(Number(id));
    res.json(cartas);

  } catch {
    res.status(500).json({ message: 'Error al obtener cartas del lote' });
  }
};