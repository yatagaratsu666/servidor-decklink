import { Router } from "express";
import { authMiddleware } from "../../../middleware/AuthMiddleware";
import { obtenerMensajesController } from "../controllers/ChatController";

const router = Router();

router.get(
  "/:chatId/mensajes",
  authMiddleware,
  obtenerMensajesController
);

export default router;