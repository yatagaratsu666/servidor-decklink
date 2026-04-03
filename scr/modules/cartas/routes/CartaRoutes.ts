import { Router } from 'express';
import { authMiddleware } from '../../../middleware/AuthMiddleware';
import * as cartaController from '../controllers/CartaController';

const router = Router();

router.post('/create', authMiddleware, cartaController.crearCarta);
router.get('/list', authMiddleware, cartaController.listarCartas);
router.put('/update/:id', authMiddleware, cartaController.actualizarCarta);
router.delete('/delete/:id', authMiddleware, cartaController.eliminarCarta);
router.put('/publicar/:id', authMiddleware, cartaController.publicarCarta);
router.get('/publicadas', cartaController.verCartasPublicadas);
router.put('/despublicar/:id', authMiddleware, cartaController.despublicarCarta);
router.get('/detalle/:id', authMiddleware, cartaController.obtenerCartaPorId);

export default router;