import { Request, Response } from 'express';
import * as detalleTareaModel from '../models/detalleTarea.model';
import * as tareaModel from '../models/tarea.model';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { DetalleTarea } from '../types/interfaces';
import { handleDatabaseError } from '../utils/errorHandler';

export const getDetallesByTareaId = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    const tareaId = parseInt(req.params.tareaId);
    
    // Verificar existencia y permisos de la tarea principal
    const tarea = await tareaModel.findById(tareaId);
    
    if (!tarea) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }
    
    // Verificar permisos de acceso
    if (user && user.nivel > 3 && user.login !== tarea.login_registrado) {
      res.status(403).json({ error: 'No tiene permiso para ver los detalles de esta tarea' });
      return;
    }
    
    const detalles = await detalleTareaModel.findByTarea(tareaId);
    
    res.json({ detalles });
  } catch (error) {
    handleDatabaseError(error, res, `Error al obtener detalles de tarea ${req.params.tareaId}`);
  }
};

export const getDetalleById = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    const id = parseInt(req.params.id);
    
    const detalle = await detalleTareaModel.findById(id);
    
    if (!detalle) {
      res.status(404).json({ error: 'Detalle de tarea no encontrado' });
      return;
    }
    
    // Verificar permisos de acceso a la tarea principal
    const tarea = await tareaModel.findById(detalle.fktarea);
    
    if (!tarea) {
      res.status(404).json({ error: 'Tarea principal no encontrada' });
      return;
    }
    
    if (user && user.nivel > 3 && user.login !== tarea.login_registrado) {
      res.status(403).json({ error: 'No tiene permiso para ver este detalle' });
      return;
    }
    
    res.json({ detalle });
  } catch (error) {
    handleDatabaseError(error, res, `Error al obtener detalle de tarea ${req.params.id}`);
  }
};

export const createDetalle = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const tareaId = parseInt(req.params.tareaId);
    
    // Verificar existencia y permisos de la tarea principal
    const tarea = await tareaModel.findById(tareaId);
    
    if (!tarea) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }
    
    // Verificar permisos de modificación
    if (user.nivel < 3 && user.login !== tarea.login_registrado) {
      res.status(403).json({ error: 'No tiene permiso para editar esta tarea' });
      return;
    }
    
    // Validar campos requeridos
    if (!req.body.descripcion || !req.body.responsable || !req.body.fecha_inicio) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }
    
    // Preparar datos para crear
    const detalleData: DetalleTarea = {
      ...req.body,
      fktarea: tareaId,
      login_registrado: user.login,
      login_modificacion: user.login,
      estatus: req.body.estatus || 'PENDIENTE'
    };
    
    const newDetalle = await detalleTareaModel.create(detalleData);
    
    res.status(201).json({
      message: 'Detalle de tarea creado exitosamente',
      detalle: newDetalle
    });
  } catch (error) {
    handleDatabaseError(error, res, 'Error al crear detalle de tarea');
  }
};

export const updateDetalle = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const id = parseInt(req.params.id);
    
    // Verificar existencia del detalle
    const existingDetalle = await detalleTareaModel.findById(id);
    
    if (!existingDetalle) {
      res.status(404).json({ error: 'Detalle de tarea no encontrado' });
      return;
    }
    
    // Verificar permisos de acceso a la tarea principal
    const tarea = await tareaModel.findById(existingDetalle.fktarea);
    
    if (!tarea) {
      res.status(404).json({ error: 'Tarea principal no encontrada' });
      return;
    }
    
    if (user.nivel < 3 && user.login !== tarea.login_registrado) {
      res.status(403).json({ error: 'No tiene permiso para editar este detalle' });
      return;
    }
    
    // Preparar datos para actualizar
    const detalleData: Partial<DetalleTarea> = {
      ...req.body,
      login_modificacion: user.login
    };
    
    const success = await detalleTareaModel.update(id, detalleData);
    
    if (!success) {
      res.status(400).json({ error: 'No se pudo actualizar el detalle de tarea' });
      return;
    }
    
    const updatedDetalle = await detalleTareaModel.findById(id);
    
    res.json({
      message: 'Detalle de tarea actualizado exitosamente',
      detalle: updatedDetalle
    });
  } catch (error) {
    handleDatabaseError(error, res, `Error al actualizar detalle de tarea ${req.params.id}`);
  }
};

export const updateDetalleStatus = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const id = parseInt(req.params.id);
    const { estatus, fecha_fin } = req.body;
    
    if (!estatus || !['PENDIENTE', 'EN_PROCESO', 'FINALIZADA', 'CANCELADA'].includes(estatus)) {
      res.status(400).json({ error: 'Estatus inválido' });
      return;
    }
    
    // Verificar existencia del detalle
    const existingDetalle = await detalleTareaModel.findById(id);
    
    if (!existingDetalle) {
      res.status(404).json({ error: 'Detalle de tarea no encontrado' });
      return;
    }
    
    // Verificar permisos de acceso a la tarea principal
    const tarea = await tareaModel.findById(existingDetalle.fktarea);
    
    if (!tarea) {
      res.status(404).json({ error: 'Tarea principal no encontrada' });
      return;
    }
    
    if (user.nivel > 3 && user.login !== tarea.login_registrado) {
      res.status(403).json({ error: 'No tiene permiso para editar este detalle' });
      return;
    }
    
    // Si el estatus es FINALIZADA y no se proporcionó fecha_fin, usamos la fecha actual
    const fechaFinToUse = estatus === 'FINALIZADA' && !fecha_fin ? new Date().toISOString().slice(0, 19).replace('T', ' ') : fecha_fin;
    
    const success = await detalleTareaModel.updateStatus(id, estatus, user.login, fechaFinToUse);
    
    if (!success) {
      res.status(400).json({ error: 'No se pudo actualizar el estatus del detalle' });
      return;
    }
    
    res.json({ message: 'Estatus de detalle actualizado exitosamente' });
  } catch (error) {
    handleDatabaseError(error, res, `Error al actualizar estatus de detalle de tarea ${req.params.id}`);
  }
};