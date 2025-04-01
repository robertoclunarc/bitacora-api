import { Request, Response } from 'express';
import * as bitacoraModel from '../models/bitacora.model';
import { Bitacora } from '../types/interfaces';
import { RequestWithUser } from '../middlewares/authMiddleware';

export const getAllBitacoras = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const bitacoras = await bitacoraModel.findAll(limit, offset);
    res.status(200).json({ bitacoras });
  } catch (error) {
    console.error('Error al obtener bitácoras:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getBitacoraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bitacora = await bitacoraModel.findById(Number(id));
    
    if (!bitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    res.status(200).json({ bitacora });
  } catch (error) {
    console.error(`Error al obtener bitácora ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const { fecha, turno, fkequipo, tema, descripcion, estatus, critico } = req.body;
    
    if (!fecha || !turno || !descripcion) {
      res.status(400).json({ message: 'Fecha, turno y descripción son campos requeridos' });
      return;
    }
    
    const newBitacora: Bitacora = {
      fecha: new Date(fecha),
      turno,
      login: user.login,
      fkequipo,
      tema,
      descripcion,
      estatus: estatus || 'ACTIVO',
      critico: critico || false
    };
    
    const id = await bitacoraModel.create(newBitacora);
    
    res.status(201).json({
      message: 'Bitácora creada exitosamente',
      bitacora: { idbitacora: id, ...newBitacora }
    });
  } catch (error) {
    console.error('Error al crear bitácora:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    const { fecha, turno, fkequipo, tema, descripcion, estatus, critico } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!fecha || !turno || !descripcion) {
      res.status(400).json({ message: 'Fecha, turno y descripción son campos requeridos' });
      return;
    }
    
    // Obtener la bitácora actual
    const currentBitacora = await bitacoraModel.findById(Number(id));
    
    if (!currentBitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede modificar la bitácora
    if (currentBitacora.login !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta bitácora' });
      return;
    }
    
    const updatedBitacora: Bitacora = {
      fecha: new Date(fecha),
      turno,
      login: currentBitacora.login, // Mantener el usuario original que creó la bitácora
      fkequipo,
      tema,
      descripcion,
      estatus,
      critico
    };
    
    const success = await bitacoraModel.update(Number(id), updatedBitacora);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar la bitácora' });
      return;
    }
    
    res.status(200).json({
      message: 'Bitácora actualizada exitosamente',
      bitacora: { idbitacora: Number(id), ...updatedBitacora }
    });
  } catch (error) {
    console.error(`Error al actualizar bitácora ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Obtener la bitácora
    const bitacora = await bitacoraModel.findById(Number(id));
    
    if (!bitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede eliminar la bitácora
    if (bitacora.login !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta bitácora' });
      return;
    }
    
    const success = await bitacoraModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar la bitácora' });
      return;
    }
    
    res.status(200).json({ message: 'Bitácora eliminada exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar bitácora ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchBitacoras = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fechaInicio,
      fechaFin,
      turno,
      login,
      fkequipo,
      critico,
      keyword,
      limit = '100',
      offset = '0'
    } = req.query;
    
    const criteria: any = {};
    
    if (fechaInicio) criteria.fechaInicio = fechaInicio as string;
    if (fechaFin) criteria.fechaFin = fechaFin as string;
    if (turno) criteria.turno = turno as string;
    if (login) criteria.login = login as string;
    if (fkequipo) criteria.fkequipo = parseInt(fkequipo as string);
    if (critico !== undefined) criteria.critico = critico === 'true';
    if (keyword) criteria.keyword = keyword as string;
    
    const bitacoras = await bitacoraModel.search(
      criteria,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const total = await bitacoraModel.countBitacoras(criteria);
    
    res.status(200).json({
      bitacoras,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error al buscar bitácoras:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};