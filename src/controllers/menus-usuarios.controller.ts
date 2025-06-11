import { Request, Response } from 'express';
import * as menuUsuarioModel from '../models/menu-usuario.model';
import * as menuModel from '../models/menu.model';
import * as usuarioModel from '../models/usuario.model';
import { MenuUsuario } from '../types/interfaces';
import { RequestWithUser } from '../types/interfaces';

export const getAllMenusUsuarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const menusUsuarios = await menuUsuarioModel.findAll();
    res.status(200).json({ menusUsuarios });
  } catch (error) {
    console.error('Error al obtener permisos de menús para usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMenuUsuarioByIdAndLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`Obteniendo permiso de menú para usuario idmenu=${req.params.idmenu}, login=${req.params.login}`);
    const { idmenu, login } = req.params;
    const menuUsuario = await menuUsuarioModel.findByIdAndLogin(Number(idmenu), login);
    
    if (!menuUsuario) {
      res.status(404).json({ message: 'Permiso de menú para usuario no encontrado' });
      return;
    }
    
    res.status(200).json({ menuUsuario });
  } catch (error) {
    console.error(`Error al obtener permiso de menú para usuario idmenu=${req.params.idmenu}, login=${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMenuUsuariosByMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idmenu } = req.params;
    
    // Verificar si existe el menú
    const menu = await menuModel.findById(Number(idmenu));
    
    if (!menu) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }
    
    const menusUsuarios = await menuUsuarioModel.findByMenu(Number(idmenu));
    res.status(200).json({ menusUsuarios });
  } catch (error) {
    console.error(`Error al obtener permisos de menú para usuarios por menú ${req.params.idmenu}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMenuUsuariosByLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login } = req.params;
    
    // Verificar si existe el usuario
    const usuario = await usuarioModel.findById(login);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    const menusUsuarios = await menuUsuarioModel.findByLogin(login);
    res.status(200).json({ menusUsuarios });
  } catch (error) {
    console.error(`Error al obtener permisos de menú para el usuario ${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUserMenusWithDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login } = req.params;
    
    // Verificar si existe el usuario
    const usuario = await usuarioModel.findById(login);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    const menuDetails = await menuUsuarioModel.getUserMenusWithDetails(login);
    res.status(200).json({ menuDetails });
  } catch (error) {
    console.error(`Error al obtener detalles de menús para el usuario ${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createMenuUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede crear permisos de menú)
    if (user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para asignar permisos de menú' });
      return;
    }
    
    const { idmenu, login, pupdate, pinsert, pdelete, pselect, export: exportPermission, estatus } = req.body;
    
    if (!idmenu || !login) {
      res.status(400).json({ message: 'El ID del menú y el login del usuario son campos requeridos' });
      return;
    }
    
    // Verificar si existe el menú
    const menu = await menuModel.findById(Number(idmenu));
    
    if (!menu) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }
    
    // Verificar si existe el usuario
    const usuario = await usuarioModel.findById(login);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Verificar si ya existe la asignación
    const existingMenuUsuario = await menuUsuarioModel.findByIdAndLogin(Number(idmenu), login);
    
    if (existingMenuUsuario) {
      res.status(400).json({ message: 'Ya existe una asignación para este menú y usuario' });
      return;
    }
    
    const newMenuUsuario: MenuUsuario = {
      idmenu: Number(idmenu),
      login,
      pupdate: pupdate !== undefined ? pupdate : false,
      pinsert: pinsert !== undefined ? pinsert : false,
      pdelete: pdelete !== undefined ? pdelete : false,
      pselect: pselect !== undefined ? pselect : true,
      export: exportPermission !== undefined ? exportPermission : false,
      estatus: estatus || 'ACTIVO'
    };
    
    await menuUsuarioModel.create(newMenuUsuario);
    
    res.status(201).json({
      message: 'Permiso de menú asignado exitosamente',
      menuUsuario: newMenuUsuario
    });
  } catch (error) {
    console.error('Error al crear permiso de menú para usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateMenuUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { idmenu, login } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede modificar permisos de menú)
    if (user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar permisos de menú' });
      return;
    }
    
    // Verificar si existe la asignación
    const menuUsuario = await menuUsuarioModel.findByIdAndLogin(Number(idmenu), login);
    
    if (!menuUsuario) {
      res.status(404).json({ message: 'Permiso de menú para usuario no encontrado' });
      return;
    }
    
    const { pupdate, pinsert, pdelete, pselect, export: exportPermission, estatus } = req.body;
    
    const updatedMenuUsuario: MenuUsuario = {
      idmenu: Number(idmenu),
      login,
      pupdate: pupdate !== undefined ? pupdate : menuUsuario.pupdate,
      pinsert: pinsert !== undefined ? pinsert : menuUsuario.pinsert,
      pdelete: pdelete !== undefined ? pdelete : menuUsuario.pdelete,
      pselect: pselect !== undefined ? pselect : menuUsuario.pselect,
      export: exportPermission !== undefined ? exportPermission : menuUsuario.export,
      estatus: estatus || menuUsuario.estatus
    };
    
    const success = await menuUsuarioModel.update(Number(idmenu), login, updatedMenuUsuario);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el permiso de menú para usuario' });
      return;
    }
    
    res.status(200).json({
      message: 'Permiso de menú para usuario actualizado exitosamente',
      menuUsuario: updatedMenuUsuario
    });
  } catch (error) {
    console.error(`Error al actualizar permiso de menú para usuario idmenu=${req.params.idmenu}, login=${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteMenuUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { idmenu, login } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede eliminar permisos de menú)
    if (user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar permisos de menú' });
      return;
    }
    
    // Verificar si existe la asignación
    const menuUsuario = await menuUsuarioModel.findByIdAndLogin(Number(idmenu), login);
    
    if (!menuUsuario) {
      res.status(404).json({ message: 'Permiso de menú para usuario no encontrado' });
      return;
    }
    
    const success = await menuUsuarioModel.remove(Number(idmenu), login);
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar el permiso de menú para usuario' });
      return;
    }
    
    res.status(200).json({ message: 'Permiso de menú para usuario eliminado exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar permiso de menú para usuario idmenu=${req.params.idmenu}, login=${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const bulkAssignMenusToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { login } = req.params;
    const { menuPermissions } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede asignar permisos de menú en masa)
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para asignar permisos de menú en masa' });
      return;
    }
    
    if (!menuPermissions || !Array.isArray(menuPermissions)) {
      res.status(400).json({ message: 'Se requiere un arreglo de permisos de menú' });
      return;
    }
    
    // Verificar si existe el usuario
    const usuario = await usuarioModel.findById(login);
    
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Validar estructura de cada permiso
    for (const permission of menuPermissions) {
      if (!permission.idmenu || typeof permission.idmenu !== 'number') {
        res.status(400).json({ message: 'Cada permiso debe tener un idmenu válido' });
        return;
      }
      
      if (permission.login !== login) {
        res.status(400).json({ message: 'El login en los permisos debe coincidir con el parámetro de la URL' });
        return;
      }
    }
    
    await menuUsuarioModel.bulkAssignWithSpecificPermissions(login, menuPermissions);
    
    res.status(200).json({
      message: 'Permisos de menús asignados exitosamente al usuario',
      login,
      totalPermissions: menuPermissions.length
    });
  } catch (error) {
    console.error(`Error al asignar permisos en masa al usuario ${req.params.login}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};