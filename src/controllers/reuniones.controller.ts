import { Request, Response } from 'express';
import * as reunionModel from '../models/reunion.model';
import { Reunion } from '../types/interfaces';
import { RequestWithUser } from '../middlewares/authMiddleware';

export const getAllReuniones = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const reuniones = await reunionModel.findAll(limit, offset);
    res.status(200).json({ reuniones });
  } catch (error) {
    console.error('Error al obtener reuniones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getReunionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reunion = await reunionModel.findById(Number(id));
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    res.status(200).json({ reunion });
  } catch (error) {
    console.error(`Error al obtener reunión ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getReunionesbyArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { areaId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const reuniones = await reunionModel.findByArea(Number(areaId), limit, offset);
    res.status(200).json({ reuniones });
  } catch (error) {
    console.error(`Error al obtener reuniones por área ${req.params.areaId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      tema,
      fkarea,
      fecha_inicio,
      hora_inicio,
      fecha_fin,
      horafin,
      estatus,
      lugar,
      responsable,
      tipo
    } = req.body;
    
    if (!tema || !fecha_inicio || !hora_inicio || !tipo) {
      res.status(400).json({ message: 'Tema, fecha de inicio, hora de inicio y tipo son campos requeridos' });
      return;
    }
    
    const newReunion: Reunion = {
      tema,
      fkarea: fkarea || null,
      fecha_inicio: new Date(fecha_inicio),
      hora_inicio,
      fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
      horafin: horafin || null,
      login_registrado: user.login,
      estatus: estatus || 'PROGRAMADA',
      lugar: lugar || null,
      responsable: responsable || null,
      tipo
    };
    
    const id = await reunionModel.create(newReunion);
    
    res.status(201).json({
      message: 'Reunión creada exitosamente',
      reunion: { idreunion: id, ...newReunion }
    });
  } catch (error) {
    console.error('Error al crear reunión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      tema,
      fkarea,
      fecha_inicio,
      hora_inicio,
      fecha_fin,
      horafin,
      estatus,
      lugar,
      responsable,
      tipo
    } = req.body;
    
    if (!tema || !fecha_inicio || !hora_inicio || !tipo) {
      res.status(400).json({ message: 'Tema, fecha de inicio, hora de inicio y tipo son campos requeridos' });
      return;
    }
    
    // Obtener la reunión actual
    const currentReunion = await reunionModel.findById(Number(id));
    
    if (!currentReunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede modificar la reunión
    if (currentReunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta reunión' });
      return;
    }
    
    const updatedReunion: Reunion = {
      tema,
      fkarea: fkarea || null,
      fecha_inicio: new Date(fecha_inicio),
      hora_inicio,
      fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
      horafin: horafin || null,
      login_registrado: currentReunion.login_registrado, // Mantener el usuario original que creó la reunión
      estatus: estatus || 'PROGRAMADA',
      lugar: lugar || null,
      responsable: responsable || null,
      tipo
    };
    
    const success = await reunionModel.update(Number(id), updatedReunion, user.login);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar la reunión' });
      return;
    }
    
    res.status(200).json({
      message: 'Reunión actualizada exitosamente',
      reunion: { idreunion: Number(id), ...updatedReunion }
    });
  } catch (error) {
    console.error(`Error al actualizar reunión ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Obtener la reunión
    const reunion = await reunionModel.findById(Number(id));
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede eliminar la reunión
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta reunión' });
      return;
    }
    
    const success = await reunionModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar la reunión' });
      return;
    }
    
    res.status(200).json({ message: 'Reunión eliminada exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar reunión ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchReuniones = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      tema,
      fkarea,
      fechaInicio,
      fechaFin,
      estatus,
      tipo,
      responsable,
      limit = '100',
      offset = '0'
    } = req.query;
    
    const criteria: any = {};
    
    if (tema) criteria.tema = tema as string;
    if (fkarea) criteria.fkarea = parseInt(fkarea as string);
    if (fechaInicio) criteria.fechaInicio = fechaInicio as string;
    if (fechaFin) criteria.fechaFin = fechaFin as string;
    if (estatus) criteria.estatus = estatus as string;
    if (tipo) criteria.tipo = tipo as string;
    if (responsable) criteria.responsable = responsable as string;
    
    const reuniones = await reunionModel.search(
      criteria,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const total = await reunionModel.countReuniones(criteria);
    
    res.status(200).json({
      reuniones,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error al buscar reuniones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};