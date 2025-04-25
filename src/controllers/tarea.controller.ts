import { Request, Response } from 'express';
import * as tareaModel from '../models/tarea.model';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { Tarea } from '../types/interfaces';
import { handleDatabaseError } from '../utils/errorHandler';

export const getAllTareas = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Construir filtros
    const filters: any = {
      descripcion: req.query.descripcion,
      tipo_tarea: req.query.tipo_tarea,
      estatus: req.query.estatus,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      login_registrado: req.query.login_registrado,
      fkarea: req.query.fkarea
    };
    
    // Añadir información del usuario para filtrado de acceso
    if (user) {
      filters.userLogin = user.login;
      filters.isAdmin = user.nivel >= 1;
    }
    
    const { tareas, total } = await tareaModel.findAll(page, limit, filters);
    
    res.json({
      tareas,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    handleDatabaseError(error, res, 'Error al obtener tareas');
  }
};

export const getTareaById = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    const id = parseInt(req.params.id);
    
    const tarea = await tareaModel.findById(id);
    
    if (!tarea) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }
    
    // Verificar permisos de acceso
    if (user && user.nivel > 3 && user.fkarea !== tarea.fkarea) {
      res.status(403).json({ error: 'No tiene permiso para ver esta tarea' });
      return;
    }
    
    res.json({ tarea });
  } catch (error) {
    handleDatabaseError(error, res, `Error al obtener tarea ${req.params.id}`);
  }
};

export const createTarea = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    // Validar campos requeridos
    if (!req.body.descripcion || !req.body.tipo_tarea) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }
    
    // Preparar datos para crear
    const tareaData: Tarea = {
      ...req.body,
      login_registrado: user.login,
      login_modificacion: user.login,
      estatus: req.body.estatus || 'PENDIENTE',
        fkarea: user.fkarea
    };
    
    const newTarea = await tareaModel.create(tareaData);
    
    res.status(201).json({
      message: 'Tarea creada exitosamente',
      tarea: newTarea
    });
  } catch (error) {
    handleDatabaseError(error, res, 'Error al crear tarea');
  }
};

export const updateTarea = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const id = parseInt(req.params.id);
    
    // Verificar existencia y permisos
    const existingTarea = await tareaModel.findById(id);
    
    if (!existingTarea) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }
    
    // Verificar permisos (sólo el creador o admins)
    if ((user.nivel > 3 && user.login !== existingTarea.login_registrado) || user.fkarea !== existingTarea.fkarea) {
      res.status(403).json({ error: 'No tiene permiso para editar esta tarea' });
      return;
    }
    
    // Preparar datos para actualizar
    const tareaData: Partial<Tarea> = {
      ...req.body,
      login_modificacion: user.login
    };
    
    const success = await tareaModel.update(id, tareaData);
    
    if (!success) {
      res.status(400).json({ error: 'No se pudo actualizar la tarea' });
      return;
    }
    
    const updatedTarea = await tareaModel.findById(id);
    
    res.json({
      message: 'Tarea actualizada exitosamente',
      tarea: updatedTarea
    });
  } catch (error) {
    handleDatabaseError(error, res, `Error al actualizar tarea ${req.params.id}`);
  }
};

export const updateTareaStatus = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const id = parseInt(req.params.id);
    const { estatus } = req.body;
    
    if (!estatus || !['PENDIENTE', 'EN_PROCESO', 'FINALIZADA', 'CANCELADA'].includes(estatus)) {
      res.status(400).json({ error: 'Estatus inválido' });
      return;
    }
    
    // Verificar existencia y permisos
    const existingTarea = await tareaModel.findById(id);
    
    if (!existingTarea) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }
    
    // Verificar permisos (sólo el creador o admins)
    if ((user.nivel > 3 && user.login !== existingTarea.login_registrado) || user.fkarea !== existingTarea.fkarea) {
      res.status(403).json({ error: 'No tiene permiso para editar esta tarea' });
      return;
    }
    
    const success = await tareaModel.updateStatus(id, estatus, user.login);
    
    if (!success) {
      res.status(400).json({ error: 'No se pudo actualizar el estatus de la tarea' });
      return;
    }
    
    res.json({ message: 'Estatus de tarea actualizado exitosamente' });
  } catch (error) {
    handleDatabaseError(error, res, `Error al actualizar estatus de tarea ${req.params.id}`);
  }
};