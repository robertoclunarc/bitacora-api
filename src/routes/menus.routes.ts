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
router.get('/', [authenticateJWT, checkRole(1)], getAllMenus);
router.get('/tree', [authenticateJWT/*, checkRole(1)*/], getMenuTree);
router.get('/:id', [authenticateJWT, checkRole(1)], getMenuById);
router.get('/parent/:parentId/:user', [authenticateJWT, checkRole(1)], getMenusByParent);
router.post('/', [authenticateJWT, checkRole(1)], createMenu);
router.put('/:id', [authenticateJWT, checkRole(1)], updateMenu);
router.patch('/:id/estatus', [authenticateJWT, checkRole(1)], updateMenuStatus);
router.delete('/:id', [authenticateJWT, checkRole(1)], deleteMenu);

export default router;