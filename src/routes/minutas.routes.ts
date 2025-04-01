import { Router } from 'express';
import { 
  getAllMinutas,
  getMinutaById,
  getMinutasByReunion,
  createMinuta,
  updateMinuta,
  deleteMinuta
} from '../controllers/minutas.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllMinutas);
router.get('/:id', authenticateJWT, getMinutaById);
router.get('/reunion/:reunionId', authenticateJWT, getMinutasByReunion);
router.post('/', authenticateJWT, createMinuta);
router.put('/:id', authenticateJWT, updateMinuta);
router.delete('/:id', authenticateJWT, deleteMinuta);

export default router;