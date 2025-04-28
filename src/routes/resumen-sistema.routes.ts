import { Router } from 'express';
import { 
    obtenerTotalUsuarios,
    obtenerActividadUsuarios, obtenerReunionesPendientes
} from '../controllers/resumen-sistema.controller';

const router = Router();

router.get('/usuarios/total', obtenerTotalUsuarios);
router.get('/usuarios/actividad', obtenerActividadUsuarios);
router.get('/reuniones/pendientes', obtenerReunionesPendientes);

export default router;