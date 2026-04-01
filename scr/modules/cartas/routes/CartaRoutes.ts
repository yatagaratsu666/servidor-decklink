import { Router } from 'express';
import { authMiddleware } from '../../../middleware/AuthMiddleware';
import * as cartaController from '../controllers/CartaController';

const router = Router();

router.post('/create', authMiddleware, cartaController.crearCarta);
router.get('/list', authMiddleware, cartaController.listarCartas);
router.put('/update/:id', authMiddleware, cartaController.actualizarCarta);
router.delete('/delete/:id', authMiddleware, cartaController.eliminarCarta);

export default router;