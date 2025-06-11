import { Router, Request } from 'express';
import { 
  getAllMenusUsuarios,
  getMenuUsuarioByIdAndLogin,
  getMenuUsuariosByMenu,
  getMenuUsuariosByLogin,
  getUserMenusWithDetails,
  createMenuUsuario,
  updateMenuUsuario,
  deleteMenuUsuario,
  bulkAssignMenusToUser
} from '../controllers/menus-usuarios.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación
router.get('/my-menus', authenticateJWT, (req, res) => {
  // Redirigir a los detalles de menús del usuario autenticado
  const requestWithUser = req as any;
  if (requestWithUser.user && requestWithUser.user.login) {
    const modifiedRequest = { ...req, params: { login: requestWithUser.user.login } } as unknown as Request;
    getUserMenusWithDetails(modifiedRequest, res);
  } else {
    res.status(401).json({ message: 'Usuario no autenticado' });
  }
});

// Rutas protegidas con autenticación y nivel de acceso para administración
router.get('/', [authenticateJWT, checkRole(1)], getAllMenusUsuarios);
router.get('/menu/:idmenu/:login', [authenticateJWT, checkRole(1)], getMenuUsuarioByIdAndLogin);
router.get('/menu/:idmenu', [authenticateJWT, checkRole(1)], getMenuUsuariosByMenu);
router.get('/usuario/:login', [authenticateJWT, checkRole(1)], getMenuUsuariosByLogin);
router.get('/usuario/:login/details', [authenticateJWT, checkRole(1)], getUserMenusWithDetails);
router.post('/', [authenticateJWT, checkRole(1)], createMenuUsuario);
router.post('/:login/bulk-assign', [authenticateJWT, checkRole(1)], bulkAssignMenusToUser);
router.put('/:idmenu/:login', [authenticateJWT, checkRole(1)], updateMenuUsuario);
router.delete('/:idmenu/:login', [authenticateJWT, checkRole(1)], deleteMenuUsuario);

export default router;