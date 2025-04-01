import { Request, Response } from 'express';
import * as minutaModel from '../models/minuta.model';
import * as reunionModel from '../models/reunion.model';
import { Minuta } from '../types/interfaces';
import { RequestWithUser } from '../middlewares/authMiddleware';

export const getAllMinutas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const minutas = await minutaModel.findAll();
    res.status(200).json({ minutas });
  } catch (error) {
    console.error('Error al obtener minutas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMinutaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const minuta = await minutaModel.findById(Number(id));
    
    if (!minuta) {
      res.status(404).json({ message: 'Minuta no encontrada' });
      return;
    }
    
    res.status(200).json({ minuta });
  } catch (error) {
    console.error(`Error al obtener minuta ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMinutasByReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reunionId } = req.params;
    const minutas = await minutaModel.findByReunion(Number(reunionId));
    
    res.status(200).json({ minutas });
  } catch (error) {
    console.error(`Error al obtener minutas por reunión ${req.params.reunionId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createMinuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { fkreunion, descripcionminuta, responsable } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!fkreunion || !descripcionminuta) {
      res.status(400).json({ message: 'Reunión y descripción de la minuta son campos requeridos' });
      return;
    }
    
    // Verificar si existe la reunión
    const reunion = await reunionModel.findById(Number(fkreunion));
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede crear minutas para esa reunión
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para crear minutas para esta reunión' });
      return;
    }
    
    const newMinuta: Minuta = {
      fkreunion: Number(fkreunion),
      descripcionminuta,
      responsable: responsable || null
    };
    
    const id = await minutaModel.create(newMinuta);
    
    res.status(201).json({
      message: 'Minuta creada exitosamente',
      minuta: { idminuta: id, ...newMinuta }
    });
  } catch (error) {
    console.error('Error al crear minuta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateMinuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    const { fkreunion, descripcionminuta, responsable } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!fkreunion || !descripcionminuta) {
      res.status(400).json({ message: 'Reunión y descripción de la minuta son campos requeridos' });
      return;
    }
    
    // Obtener la minuta actual
    const minuta = await minutaModel.findById(Number(id));
    
    if (!minuta) {
      res.status(404).json({ message: 'Minuta no encontrada' });
      return;
    }
    
    // Verificar si existe la reunión
    const reunion = await reunionModel.findById(Number(fkreunion));
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede modificar minutas
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta minuta' });
      return;
    }
    
    const updatedMinuta: Minuta = {
      fkreunion: Number(fkreunion),
      descripcionminuta,
      responsable: responsable || null
    };
    
    const success = await minutaModel.update(Number(id), updatedMinuta);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar la minuta' });
      return;
    }
    
    res.status(200).json({
      message: 'Minuta actualizada exitosamente',
      minuta: { idminuta: Number(id), ...updatedMinuta }
    });
  } catch (error) {
    console.error(`Error al actualizar minuta ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteMinuta = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Obtener la minuta
    const minuta = await minutaModel.findById(Number(id));
    
    if (!minuta) {
      res.status(404).json({ message: 'Minuta no encontrada' });
      return;
    }
    
    // Obtener la reunión asociada
    const reunion = await reunionModel.findById(minuta.fkreunion);
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede eliminar minutas
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta minuta' });
      return;
    }
    
    const success = await minutaModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar la minuta' });
      return;
    }
    
    res.status(200).json({ message: 'Minuta eliminada exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar minuta ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};