import { Router } from 'express';
import { 
  getAllTiposBitacora
} from '../controllers/tiposbitacoras.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllTiposBitacora);

export default router;