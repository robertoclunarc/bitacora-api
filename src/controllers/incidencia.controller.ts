// controllers/incidencia.controller.ts
import { Request, Response } from 'express';
import * as incidenciaModel from '../models/incidencia.model';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { Incidencia } from '../types/interfaces';
import { handleDatabaseError } from '../utils/errorHandler';

export const getAllIncidencias = async (req: Request, res: Response): Promise<void> => {
 const user = (req as RequestWithUser).user;
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Construir filtros
    const filters: any = {
      descripcion: req.query.descripcion,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      tipoincidencia: req.query.tipoincidencia,
      estatus: req.query.estatus,
      fkarea: req.query.fkarea,
      critico: req.query.critico !== undefined ? parseInt(req.query.critico as string) : undefined,
      fkequipo: req.query.fkequipo,
    };
    
    // Añadir información del usuario para filtrado de acceso
    if (user) {
      filters.userLogin = user.login;
      filters.userArea = user.fkarea;
      filters.isAdmin = user.nivel >= 1;
    }
    
    const { incidencias, total } = await incidenciaModel.findAll(page, limit, filters);
    
    res.json({
      incidencias,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    
    handleDatabaseError(error, res, 'Error al obtener incidencias');
  }
};

export const getIncidenciaById = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    const id = parseInt(req.params.id);
    
    const incidencia = await incidenciaModel.findById(id);
    
    if (!incidencia) {
      res.status(404).json({ error: 'Incidencia no encontrada' });
      return;
    }
    
    // Verificar permisos de acceso
    if (user && user.nivel > 3 && 
        user.login !== incidencia.login &&
        user.fkarea !== incidencia.fkarea) {
        res.status(403).json({ error: 'No tiene permiso para ver esta incidencia' });
        return;
    }
    
    res.json({ incidencia });
  } catch (error) {
    handleDatabaseError(error, res, `Error al obtener incidencia ${req.params.id}`);
  }
};

export const createIncidencia = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    // Validar campos requeridos
    if (!req.body.descripcion || !req.body.fecha || !req.body.hora || 
        !req.body.tipoincidencia || req.body.fkarea === undefined) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }
    
    // Preparar datos para crear
    const incidenciaData: Incidencia = {
      ...req.body,
      login: user.login,
      login_modificacion: user.login,
      critico: req.body.critico === true,
      estatus: req.body.estatus || 'ACTIVO'
    };
    
    const newIncidencia = await incidenciaModel.create(incidenciaData);
    
    res.status(201).json({
      message: 'Incidencia creada exitosamente',
      incidencia: newIncidencia
    });
  } catch (error) {
    handleDatabaseError(error, res, 'Error al crear incidencia');
  }
};

export const updateIncidencia = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const id = parseInt(req.params.id);
    
    // Verificar existencia y permisos
    const existingIncidencia = await incidenciaModel.findById(id);
    
    if (!existingIncidencia) {
      res.status(404).json({ error: 'Incidencia no encontrada' });
      return;
    }
    
    // Verificar permisos (sólo el creador, admins o usuarios de la misma área)
    if (user.nivel > 3 && 
        user.login !== existingIncidencia.login &&
        user.fkarea !== existingIncidencia.fkarea) {
      res.status(403).json({ error: 'No tiene permiso para editar esta incidencia' });
      return;
    }
    
    // Preparar datos para actualizar
    const incidenciaData: Partial<Incidencia> = {
      ...req.body,
      login_modificacion: user.login
    };
    
    // Actualizar campos booleanos explícitamente
    if (req.body.critico !== undefined) {
      incidenciaData.critico = req.body.critico === true;
    }
    
    const success = await incidenciaModel.update(id, incidenciaData);
    
    if (!success) {
      res.status(400).json({ error: 'No se pudo actualizar la incidencia' });
      return;
    }
    
    const updatedIncidencia = await incidenciaModel.findById(id);
    
    res.json({
      message: 'Incidencia actualizada exitosamente',
      incidencia: updatedIncidencia
    });
  } catch (error) {
    handleDatabaseError(error, res, `Error al actualizar incidencia ${req.params.id}`);
  }
};

export const updateIncidenciaStatus = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const id = parseInt(req.params.id);
    const { estatus } = req.body;
    
    if (!estatus || !['ACTIVO', 'INACTIVO', 'FINALIZADO', 'PROCESO'].includes(estatus)) {
      res.status(400).json({ error: 'Estatus inválido' });
      return;
    }
    
    // Verificar existencia y permisos
    const existingIncidencia = await incidenciaModel.findById(id);
    
    if (!existingIncidencia) {
      res.status(404).json({ error: 'Incidencia no encontrada' });
      return;
    }
    
    // Verificar permisos (sólo el creador, admins o usuarios de la misma área)
    if (user.nivel > 3 && 
        user.login !== existingIncidencia.login &&
        user.fkarea !== existingIncidencia.fkarea) {
      res.status(403).json({ error: 'No tiene permiso para editar esta incidencia' });
      return;
    }
    
    const success = await incidenciaModel.updateStatus(id, estatus, user.login);
    
    if (!success) {
      res.status(400).json({ error: 'No se pudo actualizar el estatus de la incidencia' });
      return;
    }
    
    res.json({ message: 'Estatus de incidencia actualizado exitosamente' });
  } catch (error) {
    handleDatabaseError(error, res, `Error al actualizar estatus de incidencia ${req.params.id}`);
  }
};

export const toggleIncidenciaCartelera = async (req: Request, res: Response): Promise<void> => {
    const user = (req as RequestWithUser).user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }
    
    const id = parseInt(req.params.id);
    
    // Verificar existencia y permisos
    const existingIncidencia = await incidenciaModel.findById(id);
    
    if (!existingIncidencia) {
      res.status(404).json({ error: 'Incidencia no encontrada' });
      return;
    }
    
    // Verificar permisos (sólo el creador, admins o usuarios de la misma área)
    if (user.nivel > 3 && 
        user.login !== existingIncidencia.login &&
        user.fkarea !== existingIncidencia.fkarea) {
      res.status(403).json({ error: 'No tiene permiso para publicar/quitar esta incidencia de cartelera' });
      return;
    }
    
    const result = await incidenciaModel.toggleCartelera(id, user.login);
    
    res.json({ 
      message: result.en_cartelera 
        ? 'Incidencia publicada en cartelera exitosamente' 
        : 'Incidencia quitada de cartelera exitosamente',
      en_cartelera: result.en_cartelera
    });
  } catch (error) {
    handleDatabaseError(error, res, `Error al alternar cartelera de incidencia ${req.params.id}`);
  }
};