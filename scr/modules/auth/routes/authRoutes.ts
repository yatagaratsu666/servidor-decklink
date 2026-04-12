import { Router } from 'express';
import { getProfile, getUserById, login } from '../controllers/authController';
import {register} from '../controllers/authController';
import { authMiddleware } from '../../../middleware/AuthMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile/:id', getUserById);
router.get('/me', authMiddleware, getProfile);

export default router;