import { Router } from 'express';
import { 
  getAllMenus,
  getMenuById,
  getMenusByParent,
  createMenu,
  updateMenu,
  updateMenuStatus,
  deleteMenu,
  getMenusByUser,
  getMenuTree
} from '../controllers/menus.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/user', authenticateJWT, getMenusByUser);

// Rutas protegidas con autenticación y nivel de acceso para administración
router.get('/', [authenticateJWT, checkRole(3)], getAllMenus);
router.get('/tree/:user', /*[authenticateJWT, checkRole(3)],*/ getMenuTree);
router.get('/:id', [authenticateJWT, checkRole(3)], getMenuById);
router.get('/parent/:parentId/:user', [authenticateJWT, checkRole(3)], getMenusByParent);
router.post('/', [authenticateJWT, checkRole(3)], createMenu);
router.put('/:id', [authenticateJWT, checkRole(3)], updateMenu);
router.patch('/:id/estatus', [authenticateJWT, checkRole(3)], updateMenuStatus);
router.delete('/:id', [authenticateJWT, checkRole(3)], deleteMenu);

export default router;