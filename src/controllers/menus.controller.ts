import { Request, Response } from 'express';
import * as menuModel from '../models/menu.model';
import { Menu } from '../types/interfaces';
//import { RequestWithUser } from '../types/interfaces';
import { RequestWithUser } from '../middlewares/authMiddleware';

export const getAllMenus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const menus = await menuModel.findAll();
    res.status(200).json({ menus });
  } catch (error) {
    console.error('Error al obtener menús:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMenuById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const menu = await menuModel.findById(Number(id));
    
    if (!menu) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }
    
    res.status(200).json({ menu });
  } catch (error) {
    console.error(`Error al obtener menú ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMenusByParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parentId, user } = req.params;
    const parentIdNumber = parentId === 'null' ? null : Number(parentId);
    
    const menus = await menuModel.findByParent(parentIdNumber, user);
    res.status(200).json({ menus });
  } catch (error) {
    console.error(`Error al obtener menús por padre ${req.params.parentId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede crear menús)
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para crear menús' });
      return;
    }
    
    const newMenu: Menu = req.body;
    
    // Validaciones básicas
    if (newMenu.idpadre !== null && newMenu.idpadre !== undefined) {
      // Verificar que el menú padre exista
      const parentMenu = await menuModel.findById(Number(newMenu.idpadre));
      
      if (!parentMenu) {
        res.status(404).json({ message: 'El menú padre especificado no existe' });
        return;
      }
    }
    
    const id = await menuModel.create(newMenu);
    
    res.status(201).json({
      message: 'Menú creado exitosamente',
      menu: { idmenu: id, ...newMenu }
    });
  } catch (error) {
    console.error('Error al crear menú:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede modificar menús)
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para modificar menús' });
      return;
    }
    
    // Verificar si existe el menú
    const menu = await menuModel.findById(Number(id));
    
    if (!menu) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }
    
    const updatedMenu: Menu = req.body;
    
    try {
      const success = await menuModel.update(Number(id), updatedMenu);
      
      if (!success) {
        res.status(500).json({ message: 'Error al actualizar el menú' });
        return;
      }
      
      res.status(200).json({
        message: 'Menú actualizado exitosamente',
        menu: { idmenu: Number(id), ...updatedMenu }
      });
    } catch (error: any) {
      // Manejar errores específicos
      if (error.message.includes('ciclo') || error.message.includes('propio padre')) {
        res.status(400).json({ message: error.message });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error al actualizar menú ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateMenuStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    const { estatus } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede modificar estatus de menús)
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para modificar el estatus de menús' });
      return;
    }
    
    if (estatus === undefined) {
      res.status(400).json({ message: 'El campo estatus es requerido' });
      return;
    }
    
    // Verificar si existe el menú
    const menu = await menuModel.findById(Number(id));
    
    if (!menu) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }
    
    const success = await menuModel.updateStatus(Number(id), estatus);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el estatus del menú' });
      return;
    }
    
    res.status(200).json({ 
      message: 'Estatus del menú actualizado exitosamente',
      estatus
    });
  } catch (error) {
    console.error(`Error al actualizar estatus del menú ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede eliminar menús)
    if (user.nivel >1) {
      res.status(403).json({ message: 'No tienes permiso para eliminar menús' });
      return;
    }
    
    // Verificar si existe el menú
    const menu = await menuModel.findById(Number(id));
    
    if (!menu) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }
    
    try {
      const success = await menuModel.remove(Number(id));
      
      if (!success) {
        res.status(500).json({ message: 'Error al eliminar el menú' });
        return;
      }
      
      res.status(200).json({ message: 'Menú eliminado exitosamente' });
    } catch (error: any) {
      // Manejar errores específicos
      if (error.message.includes('submenús') || error.message.includes('permisos')) {
        res.status(400).json({ message: error.message });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error al eliminar menú ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMenusByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const menus = await menuModel.getMenusByUser(user.login);
    res.status(200).json({ menus });
  } catch (error) {
    console.error('Error al obtener menús del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMenuTree = async (_req: Request, res: Response): Promise<void> => {
  const user = (_req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    const menuTree = await menuModel.getMenuTree(user.login);
    //console.log('Menú árbol:', menuTree);
    res.status(200).json({ menuTree });
  } catch (error) {
    console.error('Error al obtener árbol de menús:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};