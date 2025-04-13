import { Request, Response } from 'express';
import { loginUser, changePassword } from '../services/authService';
import { RequestWithUser } from '../middlewares/authMiddleware';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ message: 'Se requieren login y contraseña' });
      return;
    }

    const result = await loginUser(login, password);

    if (!result) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    res.status(200).json({
      message: 'Login exitoso',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Error en controlador de login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { currentPassword, newPassword } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Se requieren la contraseña actual y la nueva' });
      return;
    }

    const success = await changePassword(user.login, currentPassword, newPassword);

    if (!success) {
      res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      return;
    }

    res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;

    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};