import { Router } from 'express';
import { 
  getAllReuniones,
  getReunionById,
  getReunionesbyArea,
  createReunion,
  updateReunion,
  deleteReunion,
  searchReuniones
} from '../controllers/reuniones.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllReuniones);
router.get('/search', authenticateJWT, searchReuniones);
router.get('/:id', authenticateJWT, getReunionById);
router.get('/area/:areaId', authenticateJWT, getReunionesbyArea);
router.post('/', authenticateJWT, createReunion);
router.put('/:id', authenticateJWT, updateReunion);
router.delete('/:id', authenticateJWT, deleteReunion);

export default router;