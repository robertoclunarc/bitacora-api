import { Router } from 'express';
import { uploadMiddleware, getArchivosByBitacora, uploadArchivo, downloadArchivo, deleteArchivo, getImagenesPublicas
} from '../controllers/archivos.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/:bitacoraId', authenticateJWT, getArchivosByBitacora);
router.get('/imagenes-publicas', getImagenesPublicas);
router.post('/:bitacoraId', authenticateJWT, uploadMiddleware, uploadArchivo);
router.get('/:bitacoraId/:archivoId', authenticateJWT, downloadArchivo);
router.delete('/:bitacoraId/:archivoId', authenticateJWT, deleteArchivo);

export default router;