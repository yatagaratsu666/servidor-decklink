import { Router } from 'express';
import { authMiddleware } from '../../../middleware/AuthMiddleware';
import * as loteController from '../controllers/LotesController';

const router = Router();

router.post('/create', authMiddleware, loteController.crearLote);
router.get('/list', authMiddleware, loteController.listarLotes);
router.delete('/delete/:id', authMiddleware, loteController.eliminarLote);

router.post('/agregar', authMiddleware, loteController.agregarCarta);
router.post('/quitar', authMiddleware, loteController.quitarCarta);

router.get('/:id/cartas', authMiddleware, loteController.verCartasLote);

export default router;