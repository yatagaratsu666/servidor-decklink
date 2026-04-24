import { Router } from 'express';
import { calificarUsuario, getProfile, getUserById, login, obtenerPublicacionesUsuario, obtenerResenasUsuario } from '../controllers/authController';
import {register} from '../controllers/authController';
import { authMiddleware } from '../../../middleware/AuthMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile/:id', getUserById);
router.get('/me', authMiddleware, getProfile);
router.post("/calificar", authMiddleware, calificarUsuario);
router.get("/resenas/:id", authMiddleware, obtenerResenasUsuario);

router.get("/publicaciones/:id", authMiddleware, obtenerPublicacionesUsuario);

export default router;