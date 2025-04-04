import { Request, Response } from 'express';
import * as carteleraModel from '../models/cartelera.model';
import { Cartelera } from '../types/interfaces';
import { RequestWithUser } from '../types/interfaces';

export const getAllCarteleras = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const carteleras = await carteleraModel.findAll(limit, offset);
    res.status(200).json({ carteleras });
  } catch (error) {
    console.error('Error al obtener carteleras:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getCarteleraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cartelera = await carteleraModel.findById(Number(id));
    
    if (!cartelera) {
      res.status(404).json({ message: 'Cartelera no encontrada' });
      return;
    }
    
    res.status(200).json({ cartelera });
  } catch (error) {
    console.error(`Error al obtener cartelera ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getCartelerasByArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { areaId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const carteleras = await carteleraModel.findByArea(Number(areaId), limit, offset);
    res.status(200).json({ carteleras });
  } catch (error) {
    console.error(`Error al obtener carteleras por área ${req.params.areaId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getActiveCarteleras = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.params.limit ? parseInt(req.params.limit) : 100;
    const offset = req.params.offset ? parseInt(req.params.offset) : 0;
    
    const carteleras = await carteleraModel.findActive(limit, offset);
    res.status(200).json({ carteleras });
  } catch (error) {
    console.error('Error al obtener carteleras activas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createCartelera = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      fkarea,
      descripcion,
      fecha_inicio_publicacion,
      fecha_fin_publicacion,
      estatus
    } = req.body;
    
    if (!fkarea || !descripcion || !fecha_inicio_publicacion || !fecha_fin_publicacion) {
      res.status(400).json({ message: 'Área, descripción, fecha de inicio y fecha de fin son campos requeridos' });
      return;
    }
    
    // Verificar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(fecha_inicio_publicacion) > new Date(fecha_fin_publicacion)) {
      res.status(400).json({ message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
      return;
    }
    
    const newCartelera: Cartelera = {
      fkarea: Number(fkarea),
      descripcion,
      login_registrado: user.login,
      fecha_inicio_publicacion: new Date(fecha_inicio_publicacion),
      fecha_fin_publicacion: new Date(fecha_fin_publicacion),
      estatus: estatus || 'ACTIVO',
      tipo_info: 'INFO' // Valor por defecto
    };
    
    const id = await carteleraModel.create(newCartelera);
    
    res.status(201).json({
      message: 'Cartelera creada exitosamente',
      cartelera: { idcartelera: id, ...newCartelera }
    });
  } catch (error) {
    console.error('Error al crear cartelera:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateCartelera = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      fkarea,
      descripcion,
      fecha_inicio_publicacion,
      fecha_fin_publicacion,
      estatus
    } = req.body;
    
    if (!fkarea || !descripcion || !fecha_inicio_publicacion || !fecha_fin_publicacion) {
      res.status(400).json({ message: 'Área, descripción, fecha de inicio y fecha de fin son campos requeridos' });
      return;
    }
    
    // Verificar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(fecha_inicio_publicacion) > new Date(fecha_fin_publicacion)) {
      res.status(400).json({ message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
      return;
    }
    
    // Obtener la cartelera actual
    const cartelera = await carteleraModel.findById(Number(id));
    
    if (!cartelera) {
      res.status(404).json({ message: 'Cartelera no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede modificar la cartelera
    if (cartelera.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta cartelera' });
      return;
    }
    
    const updatedCartelera: Cartelera = {
      fkarea: Number(fkarea),
      descripcion,
      login_registrado: cartelera.login_registrado, // Mantener el usuario original que creó la cartelera
      fecha_inicio_publicacion: new Date(fecha_inicio_publicacion),
      fecha_fin_publicacion: new Date(fecha_fin_publicacion),
      estatus,
      tipo_info: cartelera.tipo_info 
    };
    
    const success = await carteleraModel.update(Number(id), updatedCartelera);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar la cartelera' });
      return;
    }
    
    res.status(200).json({
      message: 'Cartelera actualizada exitosamente',
      cartelera: { idcartelera: Number(id), ...updatedCartelera }
    });
  } catch (error) {
    console.error(`Error al actualizar cartelera ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteCartelera = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Obtener la cartelera
    const cartelera = await carteleraModel.findById(Number(id));
    
    if (!cartelera) {
      res.status(404).json({ message: 'Cartelera no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede eliminar la cartelera
    if (cartelera.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta cartelera' });
      return;
    }
    
    const success = await carteleraModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar la cartelera' });
      return;
    }
    
    res.status(200).json({ message: 'Cartelera eliminada exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar cartelera ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchCarteleras = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fkarea,
      estatus,
      fechaInicio,
      fechaFin,
      keyword,
      limit = '100',
      offset = '0'
    } = req.query;
    
    const criteria: any = {};
    
    if (fkarea) criteria.fkarea = parseInt(fkarea as string);
    if (estatus) criteria.estatus = estatus as string;
    if (fechaInicio) criteria.fechaInicio = fechaInicio as string;
    if (fechaFin) criteria.fechaFin = fechaFin as string;
    if (keyword) criteria.keyword = keyword as string;
    
    const carteleras = await carteleraModel.search(
      criteria,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const total = await carteleraModel.countCarteleras(criteria);
    
    res.status(200).json({
      carteleras,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error al buscar carteleras:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};