import { Request, Response } from 'express';
import * as sistemaForceModel from '../models/sistema-force.model';
import { SistemaForce } from '../types/interfaces';
import { RequestWithUser } from '../types/interfaces';

export const getAllSistemasForce = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sistemas = await sistemaForceModel.findAll();
    res.status(200).json({ sistemas });
  } catch (error) {
    console.error('Error al obtener sistemas force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getSistemaForceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sistema = await sistemaForceModel.findById(Number(id));
    
    if (!sistema) {
      res.status(404).json({ message: 'Sistema force no encontrado' });
      return;
    }
    
    res.status(200).json({ sistema });
  } catch (error) {
    console.error(`Error al obtener sistema force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createSistemaForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para crear sistemas force' });
      return;
    }
    
    const { descripcion } = req.body;
    
    if (!descripcion) {
      res.status(400).json({ message: 'La descripción es un campo requerido' });
      return;
    }
    
    const newSistema: SistemaForce = {
      descripcion
    };
    
    const id = await sistemaForceModel.create(newSistema);
    
    res.status(201).json({
      message: 'Sistema force creado exitosamente',
      sistema: { idsistema: id, ...newSistema }
    });
  } catch (error) {
    console.error('Error al crear sistema force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateSistemaForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para actualizar sistemas force' });
      return;
    }
    
    const { descripcion } = req.body;
    
    if (!descripcion) {
      res.status(400).json({ message: 'La descripción es un campo requerido' });
      return;
    }
    
    // Verificar si existe el sistema
    const sistema = await sistemaForceModel.findById(Number(id));
    
    if (!sistema) {
      res.status(404).json({ message: 'Sistema force no encontrado' });
      return;
    }
    
    const updatedSistema: SistemaForce = {
      descripcion
    };
    
    const success = await sistemaForceModel.update(Number(id), updatedSistema);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el sistema force' });
      return;
    }
    
    res.status(200).json({
      message: 'Sistema force actualizado exitosamente',
      sistema: { idsistema: Number(id), ...updatedSistema }
    });
  } catch (error) {
    console.error(`Error al actualizar sistema force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteSistemaForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede eliminar)
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para eliminar sistemas force' });
      return;
    }
    
    // Verificar si existe el sistema
    const sistema = await sistemaForceModel.findById(Number(id));
    
    if (!sistema) {
      res.status(404).json({ message: 'Sistema force no encontrado' });
      return;
    }
    
    try {
      const success = await sistemaForceModel.remove(Number(id));
      
      if (!success) {
        res.status(500).json({ message: 'Error al eliminar el sistema force' });
        return;
      }
      
      res.status(200).json({ message: 'Sistema force eliminado exitosamente' });
    } catch (error: any) {
      if (error.message.includes('está siendo utilizado')) {
        res.status(400).json({ message: error.message });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error al eliminar sistema force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchSistemasForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const { descripcion } = req.query;
    
    if (!descripcion) {
      res.status(400).json({ message: 'Se requiere un término de búsqueda' });
      return;
    }
    
    const sistemas = await sistemaForceModel.search(descripcion as string);
    
    res.status(200).json({ sistemas });
  } catch (error) {
    console.error('Error al buscar sistemas force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};