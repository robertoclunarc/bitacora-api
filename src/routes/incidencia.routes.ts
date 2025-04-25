// routes/incidencia.routes.ts
import express from 'express';
import * as incidenciaController from '../controllers/incidencia.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = express.Router();

// Rutas para incidencias
router.get('/', authenticateJWT, incidenciaController.getAllIncidencias);
router.get('/:id', authenticateJWT, incidenciaController.getIncidenciaById);
router.post('/', authenticateJWT, incidenciaController.createIncidencia);
router.put('/:id', authenticateJWT, incidenciaController.updateIncidencia);
router.patch('/:id/status', authenticateJWT, incidenciaController.updateIncidenciaStatus);
router.post('/:id/cartelera', authenticateJWT, incidenciaController.toggleIncidenciaCartelera);
router.delete('/:id/cartelera', authenticateJWT, incidenciaController.toggleIncidenciaCartelera);

export default router;