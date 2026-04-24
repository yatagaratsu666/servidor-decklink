import { Server } from "socket.io";
import { guardarMensaje } from "../modules/ChatModule";

export const chatSocket = (io: Server) => {

  io.on("connection", (socket) => {

    console.log("Usuario conectado");

    socket.on("joinChat", (chatId) => {
      socket.join(`chat-${chatId}`);
    });

    socket.on("sendMessage", async (data) => {
      const { chatId, userId, message } = data;

      try {
        const result: any = await guardarMensaje(chatId, userId, message);

        io.to(`chat-${chatId}`).emit("newMessage", {
          id_mensaje: result.insertId,
          id_emisor: userId,
          mensaje: message,
        });

      } catch (error) {
        console.log("Error enviando mensaje", error);
      }
    });

  });

};