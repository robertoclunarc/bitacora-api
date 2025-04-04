import { Router } from 'express';
import { 
  getAllBitacoras, 
  getBitacoraById, 
  createBitacora, 
  updateBitacora, 
  deleteBitacora,
  searchBitacoras
} from '../controllers/bitacoras.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', /*authenticateJWT,*/ getAllBitacoras);
router.get('/search', authenticateJWT, searchBitacoras);
router.get('/:id', authenticateJWT, getBitacoraById);
router.post('/', authenticateJWT, createBitacora);
router.put('/:id', authenticateJWT, updateBitacora);
router.delete('/:id', authenticateJWT, deleteBitacora);

export default router;