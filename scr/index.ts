import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./modules/auth/routes/authRoutes";
import cartaRoutes from "./modules/cartas/routes/CartaRoutes";
import loteRoutes from "./modules/lotes/routes/LotesRoutes";
import ofertaRoute from "./modules/propuesta/routes/PropuestaRoute";
import chatRoute from "./modules/chat/routes/ChatRoute";

import { connectMongo } from "./config/mongo";
import { db } from "./config/db";

dotenv.config();

const PORT = process.env["PORT"] || 3000;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(`chat-${chatId}`);
  });

  socket.on("sendMessage", (data) => {
    db.query(
      "INSERT INTO mensaje (id_chat, id_emisor, mensaje) VALUES (?, ?, ?)",
      [data.chatId, data.userId, data.message],
      (err, result: any) => {
        if (err) {
          console.error("Error guardando mensaje:", err);
          return;
        }

        io.to(`chat-${data.chatId}`).emit("newMessage", {
          id_mensaje: result.insertId,
          id_emisor: data.userId,
          mensaje: data.message,
        });
      },
    );
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

app.use(cors({ origin: "http://localhost:8081" }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

connectMongo();

app.use("/api/auth", authRoutes);
app.use("/api/cartas", cartaRoutes);
app.use("/api/lotes", loteRoutes);
app.use("/api/ofertas", ofertaRoute);
app.use("/api/chat", chatRoute);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export { io };
