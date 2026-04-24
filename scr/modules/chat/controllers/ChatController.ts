import { obtenerMensajes } from "../modules/ChatModule";

export const obtenerMensajesController = async (req: any, res: any) => {
  try {

    const { chatId } = req.params;

    const mensajes = await obtenerMensajes(Number(chatId));

    res.json(mensajes);

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    });

  }
};