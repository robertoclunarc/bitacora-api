import { Router } from 'express';
import { getImagenesPublicas } from '../controllers/archivos-publicos.controller';

const router = Router();

router.get('/imagenes', getImagenesPublicas);


export default router;