import { Router } from 'express';
import { 
  getAllForce,
  getForceById,
  getForceBySistema,
  getForceBySenal,
  createForce,
  updateForce,
  updateForceStatus,
  deleteForce,
  searchForce
} from '../controllers/force.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllForce);
router.get('/search', authenticateJWT, searchForce);
router.get('/:id', authenticateJWT, getForceById);
router.get('/sistema/:sistemaId', authenticateJWT, getForceBySistema);
router.get('/senal/:senalId', authenticateJWT, getForceBySenal);
router.post('/', authenticateJWT, createForce);
router.put('/:id', authenticateJWT, updateForce);
router.patch('/:id/estatus', authenticateJWT, updateForceStatus);
router.delete('/:id', authenticateJWT, deleteForce);

export default router;