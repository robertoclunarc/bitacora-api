import { Router } from 'express';
import { login, updatePassword, getUserProfile } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.put('/change-password', authenticateJWT, updatePassword);
router.get('/profile', authenticateJWT, getUserProfile);

export default router;