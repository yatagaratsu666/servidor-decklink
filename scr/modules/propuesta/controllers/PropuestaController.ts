import {
  confirmarIntercambio,
  crearPropuesta,
  rechazarPropuesta,
  solicitarConfirmacion,
  getPropuestas,
} from "../modules/PropuestaModule";
import { io } from "../../../index";
import { Request, Response } from "express";

export const crearPropuestaController = async (req: any, res: any) => {
  try {
    const { id_publicacion, id_carta_propone, id_lote_propone, mensaje } =
      req.body;

    const result: any = await crearPropuesta(
      id_publicacion,
      req.user.id,
      id_carta_propone,
      id_lote_propone,
      mensaje,
    );

    if (result?.chatId) {
      io.to(`chat_${result.chatId}`).emit("chatCreado", {
        chatId: result.chatId,
      });
    }

    return res.json({
      message: "Propuesta creada",
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const aceptarPropuestaController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const result = await confirmarIntercambio(Number(id), (req as any).user.id);

    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Error al aceptar propuesta",
    });
  }
};

export const getPropuestasController = async (req: any, res: any) => {
  try {
    const propuestas = await getPropuestas(req.user.id);
    res.json(propuestas);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const rechazarPropuestaController = async (req: any, res: any) => {
  try {
    const { id_propuesta } = req.params;

    const id_usuario = req.user?.id_usuario ?? req.user?.id;

    if (!id_usuario) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const result = await rechazarPropuesta(Number(id_propuesta), id_usuario);

    res.json(result);
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return res.status(403).json({ message: error.message });
    }

    if (error.message === "Propuesta no encontrada") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

export const solicitarConfirmacionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id_propuesta } = req.body;

    const result = await solicitarConfirmacion(
      id_propuesta,
      (req as any).user.id,
      io,
    );

    res.json(result);
  } catch (error: any) {
    console.log("ERROR solicitarConfirmacion:", error);

    res.status(500).json({
      message: error.message || "Error al solicitar confirmación",
    });
  }
};
