import { Router } from 'express';
import { 
  getAllCarteleras,
  getCarteleraById,
  getCartelerasByArea,
  getActiveCarteleras,
  createCartelera,
  updateCartelera,
  deleteCartelera,
  searchCarteleras, updateCarteleraStatus
} from '../controllers/carteleras.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllCarteleras);
router.get('/search', authenticateJWT, searchCarteleras);
router.get('/active/:limit/:offset', getActiveCarteleras);
router.get('/:id', authenticateJWT, getCarteleraById);
router.get('/area/:areaId', authenticateJWT, getCartelerasByArea);
router.post('/', authenticateJWT, createCartelera);
router.put('/:id', authenticateJWT, updateCartelera);
router.delete('/:id', authenticateJWT, deleteCartelera);
router.patch('/:id/status', authenticateJWT, updateCarteleraStatus);

export default router;