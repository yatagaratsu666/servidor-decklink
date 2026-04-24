import { Router } from "express";
import { authMiddleware } from "../../../middleware/AuthMiddleware";
import {
  aceptarPropuestaController,
  crearPropuestaController,
  getPropuestasController,
  rechazarPropuestaController,
  solicitarConfirmacionController,
} from "../controllers/PropuestaController";

const router = Router();

router.post("/propuesta", authMiddleware, crearPropuestaController);

router.post(
  "/propuestas/aceptar/:id",
  authMiddleware,
  aceptarPropuestaController,
);

router.get("/propuestas", authMiddleware, getPropuestasController);

router.post(
  "/propuestas/rechazar/:id_propuesta",
  authMiddleware,
  rechazarPropuestaController,
);

router.post(
  "/propuestas/solicitar-confirmacion",
  authMiddleware,
  solicitarConfirmacionController,
);

export default router;