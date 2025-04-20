import { Router } from 'express';
import { 
  getAllAreas, 
  getAreaById, 
  createArea, 
  updateArea, 
  deleteArea 
} from '../controllers/areasController';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllAreas);
router.get('/:id', authenticateJWT, getAreaById);

// Rutas protegidas con autenticación y nivel de acceso
router.post('/', [authenticateJWT, checkRole(1)], createArea);
router.put('/:id', [authenticateJWT, checkRole(1)], updateArea);
router.delete('/:id', [authenticateJWT, checkRole(1)], deleteArea); // Solo nivel alto puede eliminar

export default router;