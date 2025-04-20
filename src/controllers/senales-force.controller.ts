import { Request, Response } from 'express';
import * as senalForceModel from '../models/senal-force.model';
import { SenalForce } from '../types/interfaces';
import { RequestWithUser } from '../types/interfaces';

export const getAllSenalesForce = async (_req: Request, res: Response): Promise<void> => {
  try {
    const senales = await senalForceModel.findAll();
    res.status(200).json({ senales });
  } catch (error) {
    console.error('Error al obtener señales force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getSenalForceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const senal = await senalForceModel.findById(Number(id));
    
    if (!senal) {
      res.status(404).json({ message: 'Señal force no encontrada' });
      return;
    }
    
    res.status(200).json({ senal });
  } catch (error) {
    console.error(`Error al obtener señal force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createSenalForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para crear señales force' });
      return;
    }
    
    const { descripcion } = req.body;
    
    if (!descripcion) {
      res.status(400).json({ message: 'La descripción es un campo requerido' });
      return;
    }
    
    const newSenal: SenalForce = {
      descripcion
    };
    
    const id = await senalForceModel.create(newSenal);
    
    res.status(201).json({
      message: 'Señal force creada exitosamente',
      senal: { idsenal: id, ...newSenal }
    });
  } catch (error) {
    console.error('Error al crear señal force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateSenalForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para actualizar señales force' });
      return;
    }
    
    const { descripcion } = req.body;
    
    if (!descripcion) {
      res.status(400).json({ message: 'La descripción es un campo requerido' });
      return;
    }
    
    // Verificar si existe la señal
    const senal = await senalForceModel.findById(Number(id));
    
    if (!senal) {
      res.status(404).json({ message: 'Señal force no encontrada' });
      return;
    }
    
    const updatedSenal: SenalForce = {
      descripcion
    };
    
    const success = await senalForceModel.update(Number(id), updatedSenal);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar la señal force' });
      return;
    }
    
    res.status(200).json({
      message: 'Señal force actualizada exitosamente',
      senal: { idsenal: Number(id), ...updatedSenal }
    });
  } catch (error) {
    console.error(`Error al actualizar señal force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteSenalForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar nivel de acceso (solo nivel alto puede eliminar)
    if (user.nivel > 1) {
      res.status(403).json({ message: 'No tienes permiso para eliminar señales force' });
      return;
    }
    
    // Verificar si existe la señal
    const senal = await senalForceModel.findById(Number(id));
    
    if (!senal) {
      res.status(404).json({ message: 'Señal force no encontrada' });
      return;
    }
    
    try {
      const success = await senalForceModel.remove(Number(id));
      
      if (!success) {
        res.status(500).json({ message: 'Error al eliminar la señal force' });
        return;
      }
      
      res.status(200).json({ message: 'Señal force eliminada exitosamente' });
    } catch (error: any) {
      if (error.message.includes('está siendo utilizada')) {
        res.status(400).json({ message: error.message });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error al eliminar señal force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchSenalesForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const { descripcion } = req.query;
    
    if (!descripcion) {
      res.status(400).json({ message: 'Se requiere un término de búsqueda' });
      return;
    }
    
    const senales = await senalForceModel.search(descripcion as string);
    
    res.status(200).json({ senales });
  } catch (error) {
    console.error('Error al buscar señales force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};