import { Router } from 'express';
import { 
  getAllSenalesForce,
  getSenalForceById,
  createSenalForce,
  updateSenalForce,
  deleteSenalForce,
  searchSenalesForce
} from '../controllers/senales-force.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllSenalesForce);
router.get('/search', authenticateJWT, searchSenalesForce);
router.get('/:id', authenticateJWT, getSenalForceById);

// Rutas protegidas con autenticación y nivel de acceso
router.post('/', [authenticateJWT, checkRole(1)], createSenalForce);
router.put('/:id', [authenticateJWT, checkRole(1)], updateSenalForce);
router.delete('/:id', [authenticateJWT, checkRole(1)], deleteSenalForce);

export default router;