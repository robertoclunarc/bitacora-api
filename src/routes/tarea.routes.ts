// routes/tarea.routes.ts
import express from 'express';
import * as tareaController from '../controllers/tarea.controller';
import * as detalleController from '../controllers/detalleTarea.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// Rutas para tareas
router.get('/', authenticateJWT, tareaController.getAllTareas);
router.get('/:id', authenticateJWT, tareaController.getTareaById);
router.post('/', authenticateJWT, tareaController.createTarea);
router.put('/:id', authenticateJWT, tareaController.updateTarea);
router.patch('/tareas/:id/status', authenticateJWT, tareaController.updateTareaStatus);

// Rutas para detalles de tareas
router.get('/:tareaId/detalles', authenticateJWT, detalleController.getDetallesByTareaId);
router.get('/detalles/:id', authenticateJWT, detalleController.getDetalleById);
router.post('/:tareaId/detalles', authenticateJWT, detalleController.createDetalle);
router.put('/detalles/:id', authenticateJWT, detalleController.updateDetalle);
router.patch('/detalles/:id/status', authenticateJWT, detalleController.updateDetalleStatus);

export default router;