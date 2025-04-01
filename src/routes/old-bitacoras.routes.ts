import { Router } from 'express';
import { 
  getOldBitacoras,
  getOldBitacoraById,
  searchOldBitacoras
} from '../controllers/old-bitacoras.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas deben estar protegidas
router.get('/', authenticateJWT, getOldBitacoras);
router.get('/search', authenticateJWT, searchOldBitacoras);
router.get('/:fecha/:folio', authenticateJWT, getOldBitacoraById);

export default router;