import { Router } from 'express';
import { 
  getAllBitacoras, 
  getBitacoraById, 
  createBitacora, 
  updateBitacora, 
  deleteBitacora,
  searchBitacoras,
  getAllBitacorasWithAuthenticated, updateBitacoraStatus, toggleBitacoraEnCartelera
} from '../controllers/bitacoras.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', getAllBitacoras);
router.get('/authenticated',authenticateJWT, getAllBitacorasWithAuthenticated);
router.get('/search', authenticateJWT, searchBitacoras);
router.get('/:id', authenticateJWT, getBitacoraById);

router.post('/', authenticateJWT, createBitacora);
router.post('/:id/cartelera', authenticateJWT, toggleBitacoraEnCartelera);

router.put('/:id', authenticateJWT, updateBitacora);

router.delete('/:id', authenticateJWT, deleteBitacora);
router.delete('/:id/cartelera', authenticateJWT, toggleBitacoraEnCartelera);

router.patch('/:id/status', authenticateJWT, updateBitacoraStatus);

export default router;