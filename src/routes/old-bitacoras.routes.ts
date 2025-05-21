import { Router } from 'express';
import * as oldBitacoraController from '../controllers/old-bitacoras.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas deben estar protegidas
router.get('/', authenticateJWT, oldBitacoraController.getAllOldBitacoras);
router.get('/catalogos', authenticateJWT, oldBitacoraController.getCatalogos);
router.get('/:fecha/:hora', authenticateJWT, oldBitacoraController.getOldBitacoraByFecha);

export default router;