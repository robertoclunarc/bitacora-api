import { Router } from 'express';
import { 
  getAllEquipos,
  getEquipoById,
  getEquiposByArea,
  createEquipo,
  updateEquipo,
  deleteEquipo
} from '../controllers/equipos.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllEquipos);
router.get('/:id', authenticateJWT, getEquipoById);
router.get('/area/:areaId', authenticateJWT, getEquiposByArea);

// Rutas protegidas con autenticación y nivel de acceso
router.post('/', [authenticateJWT, checkRole(2)], createEquipo);
router.put('/:id', [authenticateJWT, checkRole(2)], updateEquipo);
router.delete('/:id', [authenticateJWT, checkRole(3)], deleteEquipo);

export default router;