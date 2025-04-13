import { Router } from 'express';
import { 
  getAllUsuarios,
  getUsuarioByLogin,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  updateProfile
} from '../controllers/usuarios.controller';
import { authenticateJWT, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Rutas protegidas con autenticación y nivel de acceso
router.get('/', [authenticateJWT, checkRole(2)], getAllUsuarios);
router.get('/:login', [authenticateJWT/*, checkRole(2)*/], getUsuarioByLogin);
router.post('/', /*[authenticateJWT, checkRole(3)], */createUsuario); // Solo administradores pueden crear usuarios
router.put('/:login', [authenticateJWT, checkRole(3)], updateUsuario); // Solo administradores pueden modificar usuarios
router.delete('/:login', [authenticateJWT, checkRole(3)], deleteUsuario); // Solo administradores pueden eliminar usuarios

// Ruta para actualizar el perfil propio (cualquier usuario autenticado)
router.put('/profile/update', authenticateJWT, updateProfile);

export default router;