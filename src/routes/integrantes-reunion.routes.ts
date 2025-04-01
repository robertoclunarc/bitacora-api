import { Router } from 'express';
import { 
  getAllIntegrantesReunion,
  getIntegranteReunionById,
  getIntegrantesByReunion,
  createIntegranteReunion,
  updateIntegranteReunion,
  deleteIntegranteReunion,
  markAttendance,
  bulkCreateIntegrantes
} from '../controllers/integrantes-reunion.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/', authenticateJWT, getAllIntegrantesReunion);
router.get('/:id', authenticateJWT, getIntegranteReunionById);
router.get('/reunion/:reunionId', authenticateJWT, getIntegrantesByReunion);
router.post('/', authenticateJWT, createIntegranteReunion);
router.put('/:id', authenticateJWT, updateIntegranteReunion);
router.delete('/:id', authenticateJWT, deleteIntegranteReunion);
router.put('/:id/asistencia', authenticateJWT, markAttendance);
router.post('/bulk', authenticateJWT, bulkCreateIntegrantes);

export default router;