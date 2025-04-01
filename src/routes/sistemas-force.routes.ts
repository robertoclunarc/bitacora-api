import { Router } from 'express';
import { 
  getAllSistemasForce,
  getSistemaForceById,
  createSistemaForce,
  updateSistemaForce,
  deleteSistemaForce,
  searchSistemasForce
} from '../controllers/sistemas-force.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllSistemasForce);
router.get('/search', authenticateJWT, searchSistemasForce);
router.get('/:id', authenticateJWT, getSistemaForceById);

// Rutas protegidas con autenticación y nivel de acceso
router.post('/', [authenticateJWT, checkRole(2)], createSistemaForce);
router.put('/:id', [authenticateJWT, checkRole(2)], updateSistemaForce);
router.delete('/:id', [authenticateJWT, checkRole(3)], deleteSistemaForce);

export default router;