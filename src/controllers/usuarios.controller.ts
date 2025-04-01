import { Request, Response } from 'express';
import * as usuarioModel from '../models/usuario.model';
import { Usuario } from '../types/interfaces';
import { RequestWithUser } from '../middlewares/authMiddleware';

export const getAllUsuarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await usuarioModel.findAll();
    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUsuarioByLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login } = req.params;
    const usuario = await usuarioModel.findById(login);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.status(200).json({ usuario });
  } catch (error) {
    console.error(`Error al obtener usuario ${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, trabajador, estatus, nivel, nombres, fkarea, email, password } = req.body;
    
    if (!login || !trabajador || !estatus || !nivel || !nombres || !email || !password) {
      res.status(400).json({ message: 'Faltan campos requeridos' });
      return;
    }
    
    // Verificar si ya existe un usuario con el mismo login
    const existingUser = await usuarioModel.findById(login);
    
    if (existingUser) {
      res.status(400).json({ message: 'Ya existe un usuario con ese login' });
      return;
    }
    
    // Verificar si ya existe un usuario con el mismo nombre (clave primaria)
    const existingUserByName = await usuarioModel.findByNombres(nombres);
    
    if (existingUserByName) {
      res.status(400).json({ message: 'Ya existe un usuario con ese nombre' });
      return;
    }
    
    const newUsuario: Usuario = {
      login,
      trabajador,
      estatus,
      nivel,
      nombres,
      fkarea,
      email
    };
    
    const success = await usuarioModel.create(newUsuario, password);
    
    if (!success) {
      res.status(500).json({ message: 'Error al crear el usuario' });
      return;
    }
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: newUsuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login } = req.params;
    const { trabajador, estatus, nivel, nombres, fkarea, email } = req.body;
    
    if (!trabajador || !estatus || !nivel || !nombres || !email) {
      res.status(400).json({ message: 'Faltan campos requeridos' });
      return;
    }
    
    // Verificar si existe el usuario
    const usuario = await usuarioModel.findById(login);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Si cambiamos el nombre, verificar que no exista otro usuario con ese nombre
    if (nombres !== usuario.nombres) {
      const existingUserByName = await usuarioModel.findByNombres(nombres);
      
      if (existingUserByName && existingUserByName.login !== login) {
        res.status(400).json({ message: 'Ya existe un usuario con ese nombre' });
        return;
      }
    }
    
    const updatedUsuario: Usuario = {
      login,
      trabajador,
      estatus,
      nivel,
      nombres,
      fkarea,
      email
    };
    
    const success = await usuarioModel.update(login, updatedUsuario);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el usuario' });
      return;
    }
    
    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      usuario: updatedUsuario
    });
  } catch (error) {
    console.error(`Error al actualizar usuario ${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login } = req.params;
    
    // Verificar si existe el usuario
    const usuario = await usuarioModel.findById(login);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    const success = await usuarioModel.remove(login);
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar el usuario' });
      return;
    }
    
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar usuario ${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'El correo electrónico es requerido' });
      return;
    }
    
    // Obtener el usuario actual
    const currentUser = await usuarioModel.findById(user.login);
    
    if (!currentUser) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Actualizar solo el email
    const updatedUsuario: Usuario = {
      ...currentUser,
      email
    };
    
    const success = await usuarioModel.update(user.login, updatedUsuario);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el perfil' });
      return;
    }
    
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      usuario: {
        login: updatedUsuario.login,
        email: updatedUsuario.email,
        nombres: updatedUsuario.nombres
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};