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
router.get('/', [authenticateJWT, checkRole(3)], getAllMenusUsuarios);
router.get('/:idmenu/:login', [authenticateJWT, checkRole(3)], getMenuUsuarioByIdAndLogin);
router.get('/menu/:idmenu', [authenticateJWT, checkRole(3)], getMenuUsuariosByMenu);
router.get('/usuario/:login', [authenticateJWT, checkRole(3)], getMenuUsuariosByLogin);
router.get('/usuario/:login/details', [authenticateJWT, checkRole(3)], getUserMenusWithDetails);
router.post('/', [authenticateJWT, checkRole(3)], createMenuUsuario);
router.post('/usuario/:login/bulk-assign', [authenticateJWT, checkRole(3)], bulkAssignMenusToUser);
router.put('/:idmenu/:login', [authenticateJWT, checkRole(3)], updateMenuUsuario);
router.delete('/:idmenu/:login', [authenticateJWT, checkRole(3)], deleteMenuUsuario);

export default router;