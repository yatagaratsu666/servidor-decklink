import { RequestHandler, Response } from 'express';
import { AuthRequest } from '../../../middleware/AuthMiddleware';
import * as cartaModel from '../models/CartaModel';

export const crearCarta = async (req: AuthRequest, res: Response) => {
  try {
    const nuevaCarta = {
      ...req.body,
      id_usuario: req.user.id
    };

    const result = await cartaModel.createCarta(nuevaCarta);
    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear carta' });
  }
};

export const listarCartas = async (req: AuthRequest, res: Response) => {
  try {
    const cartas = await cartaModel.getCartasInventario(req.user.id);
    res.json(cartas);

  } catch (error) {
    res.status(500).json({ message: 'Error al listar cartas' });
  }
};

export const actualizarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await cartaModel.updateCarta(
      Number(id),
      req.body
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar carta' });
  }
};

export const eliminarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await cartaModel.deleteCarta(Number(id));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar carta' });
  }
};

export const publicarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await cartaModel.publicarCarta(Number(id));

    return res.json({
      message: 'Carta publicada'
    });

  } catch {
    return res.status(500).json({ message: 'Error al publicar carta' });
  }
};

export const verCartasPublicadas: RequestHandler = async (_req, res) => {
  const data = await cartaModel.getCartasPublicadas();
  res.json(data);
};

export const despublicarCarta: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await cartaModel.despublicarCarta(Number(id));

    return res.json({
      message: 'Carta despublicada'
    });

  } catch {
    return res.status(500).json({ message: 'Error al despublicar' });
  }
};

export const obtenerCartaPorId: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const carta = await cartaModel.getCartaById(
      Number(id),
      req.user.id
    );

    return res.json(carta);

  } catch (error: any) {
    return res.status(404).json({
      message: error.message || 'Error al obtener carta'
    });
  }
};