import { Response } from 'express';
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

// LISTAR
export const listarCartas = async (req: AuthRequest, res: Response) => {
  try {
    const cartas = await cartaModel.getCartasInventario(req.user.id);
    res.json(cartas);

  } catch (error) {
    res.status(500).json({ message: 'Error al listar cartas' });
  }
};

// ACTUALIZAR
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

// ELIMINAR
export const eliminarCarta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await cartaModel.deleteCarta(Number(id));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar carta' });
  }
};